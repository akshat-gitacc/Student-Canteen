# Database Setup Guide

## Overview

The SCX Canteen application uses **5 main tables** in MySQL:

1. **users** - User accounts (admin and customers)
2. **items** - Menu items/food products
3. **orders** - Order information
4. **order_items** - Items in each order
5. **cart_items** - Shopping cart items

## Automatic Setup (Recommended)

The database tables are **automatically created** when you start the backend server. You don't need to create them manually!

Just make sure:
1. MySQL is running
2. Your `.env` file has correct database credentials
3. Start the backend server: `cd backend && npm run dev`

The server will:
- Create the database if it doesn't exist
- Create all tables automatically
- Insert default admin user (admin@scx.com / admin123)
- Insert sample menu items

## Manual Setup (Optional)

If you want to create the tables manually, you can:

### Option 1: Run the SQL file

```bash
mysql -u root -p < database_schema.sql
```

Or in MySQL command line:
```sql
source database_schema.sql;
```

### Option 2: Copy and paste SQL commands

Use the SQL commands from `database_schema.sql` in your MySQL client.

## Table Structure

### 1. users
- `id` - Primary key (auto-increment)
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `role` - Either 'admin' or 'customer'
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### 2. items
- `id` - Primary key (auto-increment)
- `name` - Item name
- `description` - Item description
- `price` - Item price (DECIMAL)
- `category` - Item category (e.g., "Main Course", "Beverages")
- `image_url` - URL to item image
- `available` - Boolean (is item available?)
- `stock` - Stock quantity (NULL = unlimited)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 3. orders
- `id` - Primary key (auto-increment)
- `user_id` - Foreign key to users table
- `total_amount` - Total order amount
- `status` - Order status: 'pending', 'preparing', 'ready', 'completed', 'cancelled'
- `order_date` - When order was placed
- `completed_at` - When order was completed (NULL if not completed)

### 4. order_items
- `id` - Primary key (auto-increment)
- `order_id` - Foreign key to orders table
- `item_id` - Foreign key to items table
- `quantity` - Quantity of item in order
- `price` - Price at time of order (snapshot)

### 5. cart_items
- `id` - Primary key (auto-increment)
- `user_id` - Foreign key to users table
- `item_id` - Foreign key to items table
- `quantity` - Quantity in cart
- `created_at` - When added to cart
- `updated_at` - Last update timestamp
- Unique constraint: One item per user (prevents duplicates)

## Relationships

```
users (1) -> (many) orders
users (1) -> (many) cart_items
orders (1) -> (many) order_items
items (1) -> (many) order_items
items (1) -> (many) cart_items
```

## Default Data

When the server starts, it automatically creates:

1. **Admin User:**
   - Email: `admin@scx.com`
   - Password: `admin123`
   - Role: `admin`

2. **Sample Items:**
   - Burger (₹150)
   - Pizza (₹200)
   - French Fries (₹80)
   - Coca Cola (₹50)
   - Coffee (₹60)
   - Sandwich (₹100)
   - Salad (₹120)
   - Ice Cream (₹70)

## Database Configuration

Make sure your `backend/.env` file has:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=scx_canteen
```

## Troubleshooting

### If tables aren't created automatically:
1. Check MySQL is running
2. Verify database credentials in `.env`
3. Check backend server logs for errors
4. Manually run `database_schema.sql`

### If you get foreign key errors:
- Make sure tables are created in order (users first, then items, then orders, etc.)
- Check that foreign key constraints are supported (InnoDB engine)

### To reset the database:
```sql
DROP DATABASE IF EXISTS scx_canteen;
CREATE DATABASE scx_canteen;
```
Then restart the backend server to recreate all tables.

