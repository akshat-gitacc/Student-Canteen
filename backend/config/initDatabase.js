import { createPool } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    const dbName = process.env.DB_NAME || 'scx_canteen';
    
    // Create pool without database to create the database
    const tempPool = createPool();
    const connection = await tempPool.getConnection();
    
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'customer') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        image_url VARCHAR(500),
        available BOOLEAN DEFAULT TRUE,
        stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_available (available)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_order_date (order_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create order_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_item_id (item_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create cart_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_item (user_id, item_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Insert default admin user (password: admin123)
    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@scx.com']
    );
    
    if (existingAdmin.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@scx.com', hashedPassword, 'admin']
      );
      console.log('Default admin user created (admin@scx.com / admin123)');
    }
    
    // Insert sample items
    const [existingItems] = await connection.query('SELECT id FROM items LIMIT 1');
    
    if (existingItems.length === 0) {
      const sampleItems = [
        ['Burger', 'Delicious beef burger with fresh vegetables', 150.00, 'Main Course', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'],
        ['Pizza', 'Cheesy margherita pizza', 200.00, 'Main Course', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500'],
        ['French Fries', 'Crispy golden fries', 80.00, 'Snacks', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500'],
        ['Coca Cola', 'Refreshing soft drink', 50.00, 'Beverages', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500'],
        ['Coffee', 'Hot brewed coffee', 60.00, 'Beverages', 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500'],
        ['Sandwich', 'Fresh vegetable sandwich', 100.00, 'Main Course', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500'],
        ['Salad', 'Fresh garden salad', 120.00, 'Main Course', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'],
        ['Ice Cream', 'Vanilla ice cream', 70.00, 'Desserts', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500']
      ];
      
      await connection.query(
        'INSERT INTO items (name, description, price, category, image_url, stock) VALUES ?',
        [sampleItems.map(item => [...item, 100])]
      );
      console.log('Sample items inserted');
    }
    
    connection.release();
    await tempPool.end();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export default initDatabase;

