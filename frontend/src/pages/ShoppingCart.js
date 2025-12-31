import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, Plus, Minus, Package, Store, User, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        setUser(response.data);
        setCustomerName(response.data.name || '');
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
    
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      localStorage.removeItem('cart');
    }
  }, []);

  const saveCart = (newCart) => {
    try {
      const minimalCart = newCart.map(item => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        pulperia_id: item.pulperia_id,
        pulperia_name: item.pulperia_name || 'Pulpería'
      }));
      localStorage.setItem('cart', JSON.stringify(minimalCart));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        localStorage.removeItem('cart');
        toast.error('Carrito reiniciado');
      }
    }
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    saveCart(newCart);
  };

  const increaseQuantity = (productId) => {
    updateCart(cart.map(item =>
      item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decreaseQuantity = (productId) => {
    const item = cart.find(i => i.product_id === productId);
    if (item.quantity === 1) {
      removeItem(productId);
    } else {
      updateCart(cart.map(item =>
        item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    }
  };

  const removeItem = (productId) => {
    updateCart(cart.filter(item => item.product_id !== productId));
    toast.success('Producto eliminado');
  };

  const groupedByPulperia = cart.reduce((groups, item) => {
    const pulperiaId = item.pulperia_id;
    if (!groups[pulperiaId]) {
      groups[pulperiaId] = { pulperia_id: pulperiaId, pulperia_name: item.pulperia_name || 'Pulpería', items: [] };
    }
    groups[pulperiaId].items.push(item);
    return groups;
  }, {});

  const handleCheckout = async (pulperiaId) => {
    if (!customerName.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }

    const pulperiaItems = cart.filter(item => item.pulperia_id === pulperiaId);
    if (pulperiaItems.length === 0) return;

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/orders`, {
        customer_name: customerName.trim(),
        pulperia_id: pulperiaId,
        items: pulperiaItems.map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          pulperia_id: item.pulperia_id,
          pulperia_name: item.pulperia_name
        })),
        total: pulperiaItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        order_type: 'pickup'
      }, { withCredentials: true });
      
      const remainingCart = cart.filter(item => item.pulperia_id !== pulperiaId);
      updateCart(remainingCart);
      toast.success('¡Orden creada!');
      
      if (remainingCart.length === 0) navigate('/orders');
    } catch (error) {
      toast.error('Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pulperiaGroups = Object.values(groupedByPulperia);

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <AnimatedBackground variant="minimal" />
      <Header user={user} title="Carrito" subtitle={`${cartCount} producto${cartCount !== 1 ? 's' : ''}`} />

      {/* Customer Name Input */}
      {cart.length > 0 && (
        <div className="relative z-10 px-4 py-4 bg-stone-900/50 border-b border-stone-800">
          <label className="block text-sm font-medium text-stone-400 mb-2">
            <User className="w-4 h-4 inline mr-1.5 text-red-400" />
            Nombre para el pedido
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="¿A nombre de quién?"
            className="w-full bg-stone-800 border border-stone-700 rounded-xl py-3 px-4 text-white placeholder:text-stone-600 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
      )}

      <div className="relative z-10 px-4 py-4">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-stone-800">
              <ShoppingCart className="w-10 h-10 text-stone-700" />
            </div>
            <p className="text-stone-400 text-lg font-semibold mb-4">Carrito vacío</p>
            <button 
              onClick={() => navigate('/map')} 
              className="bg-red-600 hover:bg-red-500 text-white font-medium py-3 px-8 rounded-xl transition-all"
            >
              Explorar Pulperías
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pulperiaGroups.map((group) => {
              const groupTotal = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              
              return (
                <div key={group.pulperia_id} className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
                  {/* Pulperia Header */}
                  <div className="bg-gradient-to-r from-red-600/20 to-transparent px-4 py-3 border-b border-stone-800">
                    <div className="flex items-center gap-2 text-white">
                      <Store className="w-4 h-4 text-red-400" />
                      <span className="font-semibold">{group.pulperia_name}</span>
                    </div>
                  </div>
                  
                  {/* Items */}
                  <div className="divide-y divide-stone-800/50">
                    {group.items.map((item) => (
                      <div key={item.product_id} className="p-4 flex items-center gap-3">
                        <div className="w-16 h-16 bg-stone-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-stone-600" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm truncate">{item.name}</h3>
                          <p className="text-red-400 font-bold">L{item.price.toFixed(0)}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-stone-800 rounded-xl border border-stone-700">
                            <button 
                              onClick={() => decreaseQuantity(item.product_id)} 
                              className="p-2 hover:bg-stone-700 rounded-l-xl transition-colors"
                            >
                              <Minus className="w-4 h-4 text-stone-400" />
                            </button>
                            <span className="font-bold text-white w-8 text-center text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => increaseQuantity(item.product_id)} 
                              className="p-2 hover:bg-stone-700 rounded-r-xl transition-colors"
                            >
                              <Plus className="w-4 h-4 text-stone-400" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(item.product_id)} 
                            className="p-2 text-red-500/70 hover:text-red-500 hover:bg-stone-800 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Checkout */}
                  <div className="p-4 bg-stone-800/30 border-t border-stone-800">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-stone-500 text-sm">Total</span>
                      <span className="text-2xl font-black text-white">L{groupTotal.toFixed(0)}</span>
                    </div>
                    <button
                      onClick={() => handleCheckout(group.pulperia_id)}
                      disabled={loading || !customerName.trim()}
                      className="w-full bg-red-600 hover:bg-red-500 disabled:bg-stone-700 disabled:text-stone-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Ordenar Ahora
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default ShoppingCartPage;
