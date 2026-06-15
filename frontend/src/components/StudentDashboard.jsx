import { Routes, Route, Link, useLocation } from 'react-router-dom';
import MenuView from './MenuView';
import Cart from './Cart';
import OrderHistory from './OrderHistory';

const StudentDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <Link
              to="/dashboard"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPath === '/dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/dashboard/cart"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPath === '/dashboard/cart'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cart
            </Link>
            <Link
              to="/dashboard/orders"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPath === '/dashboard/orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Orders
            </Link>
          </nav>
        </div>

        <Routes>
          <Route path="/" element={<MenuView />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderHistory />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;

