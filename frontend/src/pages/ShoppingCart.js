import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, Plus, Minus, Package, Store, User } from 'lucide-react';
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
    
    // Load cart from localStorage
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Error loading cart:', e);
      localStorage.removeItem('cart');
    }
  }, []);

  // Save cart to localStorage with minimal data
  const saveCart = (newCart) => {
    try {
      // Only save essential fields to avoid quota errors
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
      console.error('Error saving cart:', e);
      // If quota exceeded, clear old data
      if (e.name === 'QuotaExceededError') {
        localStorage.removeItem('cart');
        toast.error('Carrito reiniciado por falta de espacio');
      }
    }
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    saveCart(newCart);
  };

  const increaseQuantity = (productId) => {
    const newCart = cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    updateCart(newCart);
  };

  const decreaseQuantity = (productId) => {
    const item = cart.find(i => i.product_id === productId);
    if (item.quantity === 1) {
      removeItem(productId);
    } else {
      const newCart = cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      updateCart(newCart);
    }
  };

  const removeItem = (productId) => {
    const newCart = cart.filter(item => item.product_id !== productId);
    updateCart(newCart);
    toast.success('Producto eliminado');
  };

  // Group items by pulperia
  const groupedByPulperia = cart.reduce((groups, item) => {
    const pulperiaId = item.pulperia_id;
    if (!groups[pulperiaId]) {
      groups[pulperiaId] = {
        pulperia_id: pulperiaId,
        pulperia_name: item.pulperia_name || 'Pulpería',
        items: []
      };
    }
    groups[pulperiaId].items.push(item);
    return groups;
  }, {});

  const handleCheckout = async (pulperiaId) => {
    if (!customerName.trim()) {
      toast.error('Por favor ingresa tu nombre para el pedido');
      return;
    }

    const pulperiaItems = cart.filter(item => item.pulperia_id === pulperiaId);
    if (pulperiaItems.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
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
      };

      await axios.post(`${BACKEND_URL}/api/orders`, orderData, { withCredentials: true });
      
      const remainingCart = cart.filter(item => item.pulperia_id !== pulperiaId);
      updateCart(remainingCart);
      
      toast.success('¡Orden creada!');
      
      if (remainingCart.length === 0) {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pulperiaGroups = Object.values(groupedByPulperia);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 pb-24">
      <AnimatedBackground variant="minimal" />
      <Header user={user} title="Carrito" subtitle={`${cartCount} producto${cartCount !== 1 ? 's' : ''}`} />

      {/* Customer Name */}
      {cart.length > 0 && (
        <div className="px-4 py-4 bg-stone-800/50 border-b border-stone-700">
          <label className="block text-sm font-bold text-white mb-2">
            <User className="w-4 h-4 inline mr-1 text-red-400" />
            Nombre para tu pedido
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="¿A nombre de quién va el pedido?"
            className="w-full bg-stone-700/50 border border-stone-600 rounded-xl py-3 px-4 text-white placeholder:text-stone-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      )}

      <div className="px-4 py-4">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-stone-600" />
            </div>
            <p className="text-stone-400 text-lg font-semibold mb-4">Tu carrito está vacío</p>
            <button onClick={() => navigate('/map')} className="bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3 px-8 rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-900/30">
              Explorar Pulperías
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {pulperiaGroups.map((group) => {
              const groupTotal = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              
              return (
                <div key={group.pulperia_id} className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-3 text-white">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      <span className="font-bold">{group.pulperia_name}</span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-stone-700/50">
                    {group.items.map((item) => (
                      <div key={item.product_id} className="p-4 flex items-center gap-3">
                        <div className="w-14 h-14 bg-stone-700 rounded-xl flex items-center justify-center">
                          <Package className="w-7 h-7 text-stone-500" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate">{item.name}</h3>
                          <p className="text-red-400 font-bold">L{item.price.toFixed(2)}</p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <div className="flex items-center bg-stone-700/50 rounded-xl border border-stone-600">
                            <button onClick={() => decreaseQuantity(item.product_id)} className="p-2 hover:bg-stone-600 rounded-l-xl transition-colors">
                              <Minus className="w-4 h-4 text-red-400" />
                            </button>
                            <span className="font-bold text-white w-8 text-center">{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item.product_id)} className="p-2 hover:bg-stone-600 rounded-r-xl transition-colors">
                              <Plus className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.product_id)} className="p-2 text-red-500 hover:bg-stone-700 rounded-xl transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-stone-700/30 p-4 border-t border-stone-700/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-stone-400">Subtotal:</span>
                      <span className="text-xl font-black text-red-400">L{groupTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => handleCheckout(group.pulperia_id)}
                      disabled={loading || !customerName.trim()}
                      className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-xl font-bold hover:from-red-500 hover:to-red-400 disabled:opacity-50 transition-all shadow-lg shadow-red-900/30"
                    >
                      {loading ? 'Procesando...' : `Ordenar`}
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
