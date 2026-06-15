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

## Running the Application

- **Start backend server** (from `backend/`):
  ```bash
  npm run dev
  ```
- **Start frontend server** (from `frontend/`):
  ```bash
  npm run dev
  ```

## API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Menu Items**: `/api/items` (GET, POST, PUT, DELETE)
- **Cart**: `/api/cart` (GET, POST, PUT, DELETE)
- **Orders**: `/api/orders` (GET, POST, PUT), `/api/orders/stats/overview` (Admin statistics)

## License
This project is open source and available under the MIT License.

