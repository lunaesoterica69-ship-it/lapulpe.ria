import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, Plus, Minus, Package, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
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

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const pulperiaId = cart[0].pulperia_id;
    const allSamePulperia = cart.every(item => item.pulperia_id === pulperiaId);

    if (!allSamePulperia) {
      toast.error('Solo puedes hacer pedidos de una pulpería a la vez');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        pulperia_id: pulperiaId,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          image_url: item.image_url || null
        })),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        order_type: 'pickup'
      };

      await axios.post(`${BACKEND_URL}/api/orders`, orderData, { withCredentials: true });
      
      updateCart([]);
      toast.success('¡Orden creada exitosamente!');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-pulpo-50 pb-24">
      {/* Header */}
      <Header 
        user={user} 
        title="Carrito" 
        subtitle={`${cartCount} producto${cartCount !== 1 ? 's' : ''}`}
      />

      {/* Cart Items */}
      <div className="px-4 py-4">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-pulpo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-pulpo-400" />
            </div>
            <p className="text-stone-600 text-lg font-semibold mb-2">Tu carrito está vacío</p>
            <p className="text-stone-400 text-sm mb-6">Agrega productos desde las pulperías</p>
            <button
              onClick={() => navigate('/map')}
              className="bg-pulpo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-pulpo-700 transition-all"
            >
              Explorar Pulperías
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.product_id}
                data-testid={`cart-item-${item.product_id}`}
                className="bg-white rounded-2xl shadow-sm border border-pulpo-50 p-4"
              >
                <div className="flex items-center gap-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-pulpo-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-pulpo-300" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 truncate">{item.name}</h3>
                    <p className="text-pulpo-600 font-bold">L{item.price.toFixed(2)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-pulpo-100 rounded-xl">
                        <button
                          data-testid={`cart-decrease-${item.product_id}`}
                          onClick={() => decreaseQuantity(item.product_id)}
                          className="p-2 hover:bg-pulpo-200 rounded-l-xl transition-colors"
                        >
                          <Minus className="w-4 h-4 text-pulpo-600" strokeWidth={2.5} />
                        </button>
                        <span className="font-bold text-pulpo-700 w-8 text-center">{item.quantity}</span>
                        <button
                          data-testid={`cart-increase-${item.product_id}`}
                          onClick={() => increaseQuantity(item.product_id)}
                          className="p-2 hover:bg-pulpo-200 rounded-r-xl transition-colors"
                        >
                          <Plus className="w-4 h-4 text-pulpo-600" strokeWidth={2.5} />
                        </button>
                      </div>
                      
                      <button
                        data-testid={`cart-remove-${item.product_id}`}
                        onClick={() => removeItem(item.product_id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-stone-400">Subtotal</p>
                    <p className="text-lg font-black text-stone-800">
                      L{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Total & Checkout */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-pulpo-500 p-5 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-stone-600 font-medium">Total:</span>
                <span className="text-2xl font-black text-pulpo-600">L{total.toFixed(2)}</span>
              </div>
              
              <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl text-center font-medium text-sm mb-4">
                💵 Pago en efectivo al recoger
              </div>
              
              <button
                data-testid="checkout-button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-pulpo-600 text-white font-bold py-4 rounded-xl hover:bg-pulpo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default ShoppingCartPage;
