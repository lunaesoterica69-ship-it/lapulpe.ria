import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Package, Clock, CheckCircle, XCircle, ShoppingBag, User } from 'lucide-react';
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
    if (data.type === 'order_update' && data.target === 'customer') {
      const { event, order, message, sound } = data;
      
      // Play sound for ready orders
      if (sound || event === 'ready') {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = 1000;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.3;
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
        } catch (e) {}
      }
      
      // Show toast notification
      if (event === 'new_order') {
        toast.success(message || '📝 ¡Tu orden fue creada!', { duration: 4000 });
      } else if (event === 'status_changed') {
        const statusColors = {
          accepted: { background: '#DC2626', color: 'white' },
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
    }
  }, []);

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
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'accepted': return <CheckCircle className="w-5 h-5" />;
      case 'ready': return <CheckCircle className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
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
      pending: 'bg-amber-900/50 text-amber-400 border-amber-700',
      accepted: 'bg-blue-900/50 text-blue-400 border-blue-700',
      ready: 'bg-green-900/50 text-green-400 border-green-700 animate-pulse',
      completed: 'bg-stone-700/50 text-stone-400 border-stone-600',
      cancelled: 'bg-red-900/50 text-red-400 border-red-700'
    };
    return styleMap[status] || 'bg-stone-700/50 text-stone-400';
  };

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-400/30 rounded-full animate-spin border-t-white mx-auto"></div>
          <p className="mt-4 text-white/80 font-medium">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 pb-24">
      <Header 
        user={user} 
        title="Mis Órdenes" 
        subtitle={`${orders.length} orden${orders.length !== 1 ? 'es' : ''}`}
      />

      <div className="px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-stone-600" />
            </div>
            <p className="text-white text-lg font-semibold">No tienes órdenes aún</p>
            <p className="text-stone-400 text-sm mt-2">¡Explora las pulperías cercanas!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className={`bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 overflow-hidden transition-all
                  ${order.status === 'ready' ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Order Header */}
                <div className="px-5 py-4 border-b border-stone-700/50 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 text-red-400 mb-1">
                      <User className="w-4 h-4" />
                      <span className="font-bold">{order.customer_name || 'Sin nombre'}</span>
                    </div>
                    <p className="text-stone-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString('es-HN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-stone-400 text-sm font-medium">#{order.order_id.slice(-8)}</p>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusStyle(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-bold">{getStatusText(order.status)}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-5 py-4 space-y-3">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-stone-700 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-stone-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.product_name}</p>
                        <p className="text-stone-500 text-sm">x{item.quantity}</p>
                      </div>
                      
                      <p className="text-white font-bold">
                        L{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="px-5 py-4 bg-stone-700/30 border-t border-stone-700/50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <Package className="w-4 h-4" />
                      {order.order_type === 'pickup' ? 'Recoger' : 'Envío'}
                    </div>
                    <div className="text-right">
                      <p className="text-stone-500 text-xs">Total</p>
                      <p className="text-2xl font-black text-red-400">
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
