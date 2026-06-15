import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all orders (admin) or user's orders (customer)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === 'admin') {
      // Admin: Get all orders with user details
      query = `
        SELECT 
          o.id,
          o.user_id,
          o.total_amount,
          o.status,
          o.order_date,
          o.completed_at,
          u.name as user_name,
          u.email as user_email,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.order_date DESC
      `;
      params = [];
    } else {
      // Customer: Get only their orders
      query = `
        SELECT 
          o.id,
          o.total_amount,
          o.status,
          o.order_date,
          o.completed_at,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.order_date DESC
      `;
      params = [req.user.id];
    }

    const [orders] = await pool.query(query, params);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;

    // Get order details
    let query = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;

    // If customer, ensure they can only see their own orders
    if (req.user.role !== 'admin') {
      query += ' AND o.user_id = ?';
    }

    const params = req.user.role === 'admin' ? [orderId] : [orderId, req.user.id];
    const [orders] = await pool.query(query, params);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [orderItems] = await pool.query(`
      SELECT 
        oi.*,
        i.name as item_name,
        i.description as item_description,
        i.image_url as item_image
      FROM order_items oi
      LEFT JOIN items i ON oi.item_id = i.id
      WHERE oi.order_id = ?
    `, [orderId]);

    res.json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order from cart
router.post('/', authenticateToken, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.item_id').isInt().withMessage('Valid item_id is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items } = req.body;
    const userId = req.user.id;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Calculate total and validate items
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        // Get item details
        const [itemRows] = await connection.query(
          'SELECT id, name, price, available, stock FROM items WHERE id = ?',
          [item.item_id]
        );

        if (itemRows.length === 0) {
          throw new Error(`Item ${item.item_id} not found`);
        }

        const itemData = itemRows[0];

        if (!itemData.available) {
          throw new Error(`Item ${itemData.name} is not available`);
        }

        if (itemData.stock !== null && itemData.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${itemData.name}`);
        }

        const itemTotal = itemData.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          item_id: item.item_id,
          quantity: item.quantity,
          price: itemData.price,
          item_name: itemData.name
        });

        // Update stock (only if stock is not null)
        if (itemData.stock !== null) {
          await connection.query(
            'UPDATE items SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.item_id]
          );
        }
      }

      // Create order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
        [userId, totalAmount, 'pending']
      );

      const orderId = orderResult.insertId;

      // Create order items
      const orderItemsValues = orderItems.map(oi => [
        orderId,
        oi.item_id,
        oi.quantity,
        oi.price
      ]);

      await connection.query(
        'INSERT INTO order_items (order_id, item_id, quantity, price) VALUES ?',
        [orderItemsValues]
      );

      // Clear user's cart
      await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

      await connection.commit();

      // Get complete order details
      const [newOrder] = await connection.query(`
        SELECT 
          o.*,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ?
        GROUP BY o.id
      `, [orderId]);

      res.status(201).json({
        message: 'Order created successfully',
        order: newOrder[0]
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({ error: error.message || 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'preparing', 'ready', 'completed', 'cancelled'])
    .withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const orderId = req.params.id;

    const updateData = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    await pool.query(
      'UPDATE orders SET status = ?, completed_at = ? WHERE id = ?',
      [status, updateData.completed_at || null, orderId]
    );

    const [updatedOrder] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.json(updatedOrder[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
      FROM orders
    `);

    const [recentOrders] = await pool.query(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.order_date,
        u.name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
      LIMIT 10
    `);

    res.json({
      statistics: stats[0],
      recent_orders: recentOrders
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

