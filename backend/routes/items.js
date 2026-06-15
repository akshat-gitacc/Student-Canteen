import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all items (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, available } = req.query;
    
    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (available !== undefined) {
      query += ' AND available = ?';
      params.push(available === 'true');
    }

    query += ' ORDER BY category, name';

    const [items] = await pool.query(query, params);
    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT * FROM items WHERE id = ?',
      [req.params.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(items[0]);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM items WHERE category IS NOT NULL ORDER BY category'
    );
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create item (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').optional().trim(),
  body('description').optional().trim(),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, image_url, stock, available } = req.body;

    const [result] = await pool.query(
      'INSERT INTO items (name, description, price, category, image_url, stock, available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, price, category || null, image_url || null, stock || 0, available !== undefined ? available : true]
    );

    const [newItem] = await pool.query('SELECT * FROM items WHERE id = ?', [result.insertId]);
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update item (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, image_url, stock, available } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (stock !== undefined) {
      updates.push('stock = ?');
      params.push(stock);
    }
    if (available !== undefined) {
      updates.push('available = ?');
      params.push(available);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    await pool.query(
      `UPDATE items SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedItem] = await pool.query('SELECT * FROM items WHERE id = ?', [req.params.id]);
    res.json(updatedItem[0]);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete item (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

