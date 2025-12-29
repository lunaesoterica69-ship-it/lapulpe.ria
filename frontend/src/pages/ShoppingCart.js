import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

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
    toast.success('Producto eliminado del carrito');
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero text-white px-6 py-8">
        <h1 className="text-3xl font-black mb-2">Carrito de Compras</h1>
        <p className="text-white/90">{cartCount} producto{cartCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Cart Items */}
      <div className="px-6 py-6">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 text-lg mb-6">Tu carrito está vacío</p>
            <button
              onClick={() => navigate('/map')}
              className="btn-primary"
            >
              Explorar Pulperías
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.product_id}
                data-testid={`cart-item-${item.product_id}`}
                className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-800 mb-1">{item.name}</h3>
                    <p className="text-xl font-black text-primary mb-3">L {item.price.toFixed(2)}</p>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-orange-100 rounded-full px-2 py-1">
                        <button
                          data-testid={`cart-decrease-${item.product_id}`}
                          onClick={() => decreaseQuantity(item.product_id)}
                          className="bg-white rounded-full p-1 hover:bg-stone-100 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-primary" strokeWidth={3} />
                        </button>
                        <span className="font-bold text-primary w-8 text-center">{item.quantity}</span>
                        <button
                          data-testid={`cart-increase-${item.product_id}`}
                          onClick={() => increaseQuantity(item.product_id)}
                          className="bg-white rounded-full p-1 hover:bg-stone-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-primary" strokeWidth={3} />
                        </button>
                      </div>
                      
                      <button
                        data-testid={`cart-remove-${item.product_id}`}
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-500 hover:text-red-600 p-2 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-stone-500 mb-1">Subtotal</p>
                    <p className="text-2xl font-black text-stone-800">
                      L {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Total & Checkout */}
            <div className="bg-white rounded-2xl shadow-md border-b-4 border-primary p-6 space-y-4">
              <div className="flex justify-between items-center text-2xl font-black">
                <span className="text-stone-800">Total:</span>
                <span className="text-primary">L {total.toFixed(2)}</span>
              </div>
              
              <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg text-center font-bold">
                💵 Pago solo en efectivo al recoger
              </div>
              
              <button
                data-testid="checkout-button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full btn-primary text-lg disabled:opacity-50"
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