# Quick Setup Guide

## Prerequisites
- Node.js (v16+)
- MySQL (v8.0+)
- npm or yarn

## Step-by-Step Setup

### 1. Database Setup
1. Make sure MySQL is running on your system
2. Note your MySQL root password (or create a new user)

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=scx_canteen
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=scx-canteen-secret-key-2024
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL password.

Start the backend server:

```bash
npm run dev
```

The database and tables will be created automatically when the server starts.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend server:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 5. Default Login Credentials

**Admin Account:**
- Email: `admin@scx.com`
- Password: `admin123`

**Customer Account:**
- Create a new account using the signup page

## Troubleshooting

### Database Connection Issues
- Make sure MySQL is running
- Check your MySQL password in the `.env` file
- Verify MySQL user has CREATE DATABASE privileges

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### CORS Issues
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL

## Development

### Backend
- Uses nodemon for auto-reload
- Logs all database operations
- API endpoints available at `/api/*`

### Frontend
- Uses Vite for fast HMR
- Tailwind CSS for styling
- React Router for navigation

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

Build files will be in `frontend/dist/`

### Backend
```bash
cd backend
npm start
```

## Features

- User Authentication (JWT)
- Role-based Access Control (Admin/Customer)
- Menu Management (CRUD)
- Shopping Cart
- Order Management
- Order History
- Admin Dashboard with Statistics
- Stock Management
- Real-time Order Status Updates

