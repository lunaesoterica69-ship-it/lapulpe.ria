import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Package, Clock, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import useWebSocket from '../hooks/useWebSocket';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MyOrders = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  
  // WebSocket message handler for real-time order updates
  const handleWebSocketMessage = useCallback((data) => {
    console.log('📬 Customer received WebSocket message:', data);
    
    if (data.type === 'order_update' && data.target === 'customer') {
      const { event, order, message, sound } = data;
      
      // Play sound for important updates
      if (sound || event === 'ready') {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = event === 'ready' ? 1000 : 800;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.3;
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
        } catch (e) {
          console.log('Audio not available');
        }
      }
      
      // Show toast notification based on event
      if (event === 'new_order') {
        toast.success(message || '📝 ¡Tu orden fue creada!', { duration: 4000 });
      } else if (event === 'status_changed') {
        const statusColors = {
          accepted: { background: '#B91C1C', color: 'white' },
          ready: { background: '#10B981', color: 'white' },
          completed: { background: '#059669', color: 'white' }
        };
        toast.success(message, {
          duration: 5000,
          style: statusColors[order.status] || {}
        });
      } else if (event === 'cancelled') {
        toast.error(message || '❌ Tu orden fue cancelada', { duration: 5000 });
      }
      
      // Update order in the list
      setOrders(prevOrders => {
        const existingIndex = prevOrders.findIndex(o => o.order_id === order.order_id);
        
        if (existingIndex !== -1) {
          const updatedOrders = [...prevOrders];
          updatedOrders[existingIndex] = { ...updatedOrders[existingIndex], ...order };
          return updatedOrders;
        } else if (event === 'new_order') {
          return [order, ...prevOrders];
        }
        
        return prevOrders;
      });
    } else if (data.type === 'connected') {
      console.log('🟢 Customer connected to real-time updates');
    }
  }, []);

  // WebSocket connection (silent - no UI indicator)
  useWebSocket(user?.user_id, handleWebSocketMessage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, ordersRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
          axios.get(`${BACKEND_URL}/api/orders`, { withCredentials: true })
        ]);
        
        setUser(userRes.data);
        setOrders(ordersRes.data);
        
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pendiente',
      accepted: 'Preparando',
      ready: '¡Lista!',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return statusMap[status] || status;
  };

  const getStatusStyle = (status) => {
    const styleMap = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      accepted: 'bg-blue-100 text-blue-700 border-blue-200',
      ready: 'bg-green-100 text-green-700 border-green-200 animate-pulse',
      completed: 'bg-stone-100 text-stone-600 border-stone-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    return styleMap[status] || 'bg-stone-100 text-stone-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pulpo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pulpo-200 rounded-full animate-spin border-t-pulpo-600 mx-auto"></div>
          <p className="mt-4 text-pulpo-600 font-medium">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-pulpo-50 pb-24">
      {/* Header */}
      <Header 
        user={user} 
        title="Mis Órdenes" 
        subtitle={`${orders.length} orden${orders.length !== 1 ? 'es' : ''}`}
      />

      {/* Orders List */}
      <div className="px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-pulpo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-pulpo-400" />
            </div>
            <p className="text-pulpo-600 text-lg font-semibold">No tienes órdenes aún</p>
            <p className="text-pulpo-400 text-sm mt-2">¡Explora las pulperías cercanas!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                data-testid={`order-${order.order_id}`}
                className={`bg-white rounded-2xl shadow-md border border-pulpo-100 overflow-hidden transition-all
                  ${order.status === 'ready' ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Order Header */}
                <div className="px-5 py-4 border-b border-pulpo-100 flex justify-between items-center">
                  <div>
                    <p className="text-pulpo-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString('es-HN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-pulpo-700 text-sm font-semibold">#{order.order_id.slice(-8)}</p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusStyle(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-bold">{getStatusText(order.status)}</span>
                  </div>
                </div>

                {/* Order Items with Images */}
                <div className="px-5 py-4 space-y-3">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {/* Product Image */}
                      <div className="w-14 h-14 bg-pulpo-100 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-pulpo-300" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-800 font-medium truncate">{item.product_name}</p>
                        <p className="text-stone-500 text-sm">x{item.quantity}</p>
                      </div>
                      
                      {/* Price */}
                      <p className="text-stone-800 font-bold">
                        L{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="px-5 py-4 bg-pulpo-50 border-t border-pulpo-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-pulpo-500 text-sm">
                      <Package className="w-4 h-4" />
                      {order.order_type === 'pickup' ? 'Recoger' : 'Envío'}
                    </div>
                    <div className="text-right">
                      <p className="text-pulpo-400 text-xs">Total</p>
                      <p className="text-2xl font-black text-pulpo-600">
                        L{order.total?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default MyOrders;
