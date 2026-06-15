# SCX - Canteen Management System

This is a canteen management system built with React, Node.js, Express, and MySQL. Customers can use it to browse menu items, add them to a cart, place orders, and track order status. The admin dashboard allows management of menu items and tracking of orders and revenue.

This was a team project. I was responsible for the database management, designing the schema, creating the ER diagram, and writing the SQL initialization scripts and queries.

## Database Design and Contributions

I handled the database side of the application, which is built on MySQL. The system uses five main tables to manage data:

- **users**: Stores customer and admin accounts, handling bcrypt hashed passwords and role-based access.
- **items**: Holds the canteen menu, including prices, stock levels, categories, and availability.
- **orders**: Records the total amount, status (pending, preparing, ready, completed, cancelled), and order timestamps.
- **order_items**: A junction table that links orders to items with the purchased quantity and a price snapshot.
- **cart_items**: Stores active items in a customer's shopping cart.

I wrote the initialization scripts in `backend/config/initDatabase.js` to automatically create the database and tables on server startup. The schema structure and constraints can be found in `database_schema.sql`.

## Project Structure

- `backend/`: Node.js and Express API, server config, and database connection pool.
- `frontend/`: React components, state contexts, and styling with Tailwind CSS.
- `database_schema.sql`: Clean SQL script containing the database tables structure.

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)

### Setup Steps

1. **Clone and Install Backend**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=scx_canteen
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your_secret_key
   ```

2. **Install Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Database Initialization**:
   Start the backend server, and the database and tables will be created automatically.
   
   If you prefer manual setup, run the schema script:
   ```bash
   mysql -u root -p < database_schema.sql
   ```

## Running the Application

- **Start backend server** (from `backend/`):
  ```bash
  npm run dev
  ```
- **Start frontend server** (from `frontend/`):
  ```bash
  npm run dev
  ```

### Default Credentials
- **Admin Email**: admin@scx.com
- **Admin Password**: admin123

## API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Menu Items**: `/api/items` (GET, POST, PUT, DELETE)
- **Cart**: `/api/cart` (GET, POST, PUT, DELETE)
- **Orders**: `/api/orders` (GET, POST, PUT), `/api/orders/stats/overview` (Admin statistics)

## License
This project is open source and available under the MIT License.

