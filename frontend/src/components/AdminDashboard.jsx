import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ManageItems from './ManageItems';
import ManageOrders from './ManageOrders';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentPath === '/admin') {
      fetchStats();
    }
  }, [currentPath]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/stats/overview');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <Link
              to="/admin"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPath === '/admin'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/items"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPath === '/admin/items'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Items
            </Link>
            <Link
              to="/admin/orders"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPath === '/admin/orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Orders
            </Link>
          </nav>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                ) : stats ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="card">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.statistics.total_orders || 0}</p>
                      </div>
                      <div className="card">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold text-primary-600">
                          ₹{parseFloat(stats.statistics.total_revenue || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="card">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Order Value</h3>
                        <p className="text-3xl font-bold text-gray-900">
                          ₹{parseFloat(stats.statistics.avg_order_value || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="card">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Orders</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats.statistics.pending_orders || 0}</p>
                      </div>
                    </div>

                    <div className="card mb-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status Overview</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Pending</p>
                          <p className="text-2xl font-bold text-yellow-600">{stats.statistics.pending_orders || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Preparing</p>
                          <p className="text-2xl font-bold text-blue-600">{stats.statistics.preparing_orders || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ready</p>
                          <p className="text-2xl font-bold text-purple-600">{stats.statistics.ready_orders || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Completed</p>
                          <p className="text-2xl font-bold text-green-600">{stats.statistics.completed_orders || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
                      {stats.recent_orders?.length === 0 ? (
                        <p className="text-gray-500">No recent orders</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {stats.recent_orders?.map((order) => (
                                <tr key={order.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{order.id}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.user_name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ₹{order.total_amount}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                      order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.order_date).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            }
          />
          <Route path="/items" element={<ManageItems />} />
          <Route path="/orders" element={<ManageOrders />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;

