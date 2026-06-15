import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await pool.query(`
      SELECT 
        ci.id,
        ci.item_id,
        ci.quantity,
        i.name,
        i.description,
        i.price,
        i.image_url,
        i.available,
        i.stock,
        (ci.quantity * i.price) as subtotal
      FROM cart_items ci
      LEFT JOIN items i ON ci.item_id = i.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `, [req.user.id]);

    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      items: cartItems,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart
router.post('/', authenticateToken, [
  body('item_id').isInt().withMessage('Valid item_id is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { item_id, quantity } = req.body;
    const userId = req.user.id;

    // Check if item exists and is available
    const [items] = await pool.query(
      'SELECT id, name, price, available, stock FROM items WHERE id = ?',
      [item_id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = items[0];

    if (!item.available) {
      return res.status(400).json({ error: 'Item is not available' });
    }

    // Check if item already in cart
    const [existingCartItems] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND item_id = ?',
      [userId, item_id]
    );

    if (existingCartItems.length > 0) {
      // Update quantity
      const newQuantity = existingCartItems[0].quantity + quantity;
      
      if (item.stock !== null && item.stock < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingCartItems[0].id]
      );

      res.json({ message: 'Cart updated successfully' });
    } else {
      // Add new item to cart
      if (item.stock !== null && item.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      await pool.query(
        'INSERT INTO cart_items (user_id, item_id, quantity) VALUES (?, ?, ?)',
        [userId, item_id, quantity]
      );

      res.status(201).json({ message: 'Item added to cart' });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, [
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity } = req.body;
    const cartItemId = req.params.id;
    const userId = req.user.id;

    // Get cart item with item details
    const [cartItems] = await pool.query(`
      SELECT ci.*, i.stock, i.available
      FROM cart_items ci
      LEFT JOIN items i ON ci.item_id = i.id
      WHERE ci.id = ? AND ci.user_id = ?
    `, [cartItemId, userId]);

    if (cartItems.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const cartItem = cartItems[0];

    if (!cartItem.available) {
      return res.status(400).json({ error: 'Item is no longer available' });
    }

    if (cartItem.stock !== null && cartItem.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, cartItemId, userId]
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const userId = req.user.id;

    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

