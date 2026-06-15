import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const MenuView = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      
      const res = await api.get('/items', { params });
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/items/categories/list');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, searchTerm]);

  const handleAddToCart = async (itemId) => {
    await addToCart(itemId, 1);
  };

  const filteredItems = items.filter(item => 
    item.available && (item.stock > 0 || item.stock === null)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 http://localhost:5173/">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                {item.stock !== null && item.stock < 10 && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Low Stock
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
              {item.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-600">₹{item.price}</span>
                {item.stock !== null && (
                  <span className="text-sm text-gray-500">Stock: {item.stock}</span>
                )}
              </div>
              <button
                onClick={() => handleAddToCart(item.id)}
                disabled={!item.available || (item.stock !== null && item.stock === 0)}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!item.available || (item.stock !== null && item.stock === 0)
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuView;

