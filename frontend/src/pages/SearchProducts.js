import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Package, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SearchProducts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        setUser(response.data);
        
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Por favor ingresa un término de búsqueda');
      return;
    }

    setLoading(true);
    try {
      let url = `${BACKEND_URL}/api/products?search=${searchTerm}`;
      if (sortBy) {
        url += `&sort_by=${sortBy}`;
      }
      
      const response = await axios.get(url);
      setProducts(response.data);
      
      if (response.data.length === 0) {
        toast.info('No se encontraron productos');
      }
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = async (newSort) => {
    setSortBy(newSort);
    if (products.length > 0) {
      setLoading(true);
      try {
        let url = `${BACKEND_URL}/api/products?search=${searchTerm}`;
        if (newSort) {
          url += `&sort_by=${newSort}`;
        }
        
        const response = await axios.get(url);
        setProducts(response.data);
      } catch (error) {
        console.error('Error sorting products:', error);
        toast.error('Error al ordenar');
      } finally {
        setLoading(false);
      }
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 pb-24">
      {/* Header with Profile Dropdown */}
      <Header 
        user={user} 
        title="Buscar Productos" 
        subtitle="Encuentra lo que necesitas"
      />
      
      {/* Search Section */}
      <div className="bg-gradient-to-b from-stone-800 to-transparent text-white px-4 pb-6">
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            data-testid="product-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="¿Qué estás buscando?"
            className="flex-1 bg-stone-700/50 text-white border border-stone-600 focus:ring-2 focus:ring-red-500 focus:border-transparent rounded-xl py-3 px-4 placeholder:text-stone-400"
          />
          <button
            data-testid="product-search-button"
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 font-bold px-5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-red-900/30"
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-stone-600" />
            </div>
            <p className="text-stone-500 text-lg">
              {searchTerm ? 'No se encontraron productos' : 'Busca productos en todas las pulperías'}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">
                {products.length} resultado{products.length !== 1 ? 's' : ''}
              </h2>
              
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="">Recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>
            </div>
            
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  data-testid={`search-result-${product.product_id}`}
                  onClick={() => navigate(`/pulperia/${product.pulperia_id}`)}
                  className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 p-4 cursor-pointer hover:border-red-500/50 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-stone-700 rounded-xl flex items-center justify-center">
                        <Package className="w-10 h-10 text-stone-500" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{product.name}</h3>
                      
                      {/* Pulperia Info */}
                      <div className="flex items-center gap-1 mt-1">
                        {product.pulperia_logo ? (
                          <img
                            src={product.pulperia_logo}
                            alt={product.pulperia_name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        ) : (
                          <Store className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs text-red-400 font-medium truncate">
                          {product.pulperia_name}
                        </span>
                      </div>
                      
                      <p className="text-sm text-stone-500 mt-1">Stock: {product.stock}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-black text-red-400">L{product.price.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default SearchProducts;
