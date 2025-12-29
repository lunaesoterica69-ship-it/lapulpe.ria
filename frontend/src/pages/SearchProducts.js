import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Package } from 'lucide-react';
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Profile Dropdown */}
      <Header 
        user={user} 
        title="Buscar Productos" 
        subtitle="Encuentra lo que necesitas"
      />
      
      {/* Search Section */}
      <div className="bg-gradient-to-b from-primary to-red-600 text-white px-6 pb-6">
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            data-testid="product-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="¿Qué estás buscando?"
            className="flex-1 bg-white/90 backdrop-blur text-stone-800 border-0 focus:ring-2 focus:ring-white rounded-xl py-3 px-4 placeholder:text-stone-500"
          />
          <button
            data-testid="product-search-button"
            onClick={handleSearch}
            disabled={loading}
            className="bg-white text-primary hover:bg-white/90 font-bold px-6 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="px-6 py-6">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 text-lg">
              {searchTerm ? 'No se encontraron productos' : 'Busca productos en todas las pulperías'}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-stone-800">
                {products.length} resultado{products.length !== 1 ? 's' : ''}
              </h2>
              
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white border-2 border-orange-100 rounded-xl px-4 py-2 font-semibold text-stone-700 focus:ring-2 focus:ring-primary"
              >
                <option value="">Más recientes</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  data-testid={`search-result-${product.product_id}`}
                  onClick={() => navigate(`/pulperia/${product.pulperia_id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 card-hover cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Package className="w-10 h-10 text-primary" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-stone-800 mb-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-stone-600 mb-2">{product.description}</p>
                      )}
                      
                      {/* Pulperia Info */}
                      <div className="flex items-center gap-2 mb-3">
                        {product.pulperia_logo && (
                          <img
                            src={product.pulperia_logo}
                            alt={product.pulperia_name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span className="text-sm font-semibold text-secondary">
                          {product.pulperia_name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-primary">L {product.price.toFixed(2)}</p>
                        <p className="text-sm text-stone-500">Stock: {product.stock}</p>
                      </div>
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