import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemCount = cart.items?.length || 0;

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-2xl font-bold text-primary-600">
              SCX
            </Link>
            {user.role === 'customer' && (
              <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                Menu
              </Link>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/admin/items" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Manage Items
                </Link>
                <Link to="/admin/orders" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Manage Orders
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user.role === 'customer' && (
              <Link
                to="/dashboard/cart"
                className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">{user.name}</span>
              <span className="text-gray-400">|</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

