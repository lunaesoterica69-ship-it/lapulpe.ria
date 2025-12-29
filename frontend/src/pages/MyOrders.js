import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Package, Clock, CheckCircle, XCircle, Wifi, WifiOff, ShoppingBag } from 'lucide-react';
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
          accepted: { background: '#3B82F6', color: 'white' },
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

  // WebSocket connection
  const { isConnected } = useWebSocket(user?.user_id, handleWebSocketMessage);

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
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ready: 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse',
      completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return styleMap[status] || 'bg-slate-500/20 text-slate-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500 mx-auto"></div>
          <p className="mt-4 text-white/70 font-medium">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Órdenes</h1>
            <p className="text-white/60 text-sm">{orders.length} orden{orders.length !== 1 ? 'es' : ''}</p>
          </div>
          {user?.picture && (
            <img src={user.picture} alt="" className="w-10 h-10 rounded-full border-2 border-white/20" />
          )}
        </div>
      </div>
      
      {/* Connection Status - Solo mostrar cuando hay órdenes */}
      {user && orders.length > 0 && (
        <div className={`px-4 py-2 flex items-center justify-center gap-2 text-sm ${
          isConnected ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
        }`}>
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Actualizaciones en tiempo real</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Conectando...</span>
            </>
          )}
        </div>
      )}

      {/* Orders List */}
      <div className="px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-white/30" />
            </div>
            <p className="text-white/50 text-lg">No tienes órdenes aún</p>
            <p className="text-white/30 text-sm mt-2">¡Explora las pulperías cercanas!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                data-testid={`order-${order.order_id}`}
                className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden transition-all
                  ${order.status === 'ready' ? 'ring-2 ring-green-500/50' : ''}`}
              >
                {/* Order Header */}
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-white/40 text-xs">
                      {new Date(order.created_at).toLocaleDateString('es-HN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-white/70 text-sm font-medium">#{order.order_id.slice(-8)}</p>
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
                      <div className="w-14 h-14 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-white/30" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.product_name}</p>
                        <p className="text-white/50 text-sm">x{item.quantity}</p>
                      </div>
                      
                      {/* Price */}
                      <p className="text-white font-bold">
                        L{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="px-5 py-4 bg-white/5 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Package className="w-4 h-4" />
                      {order.order_type === 'pickup' ? 'Recoger' : 'Envío'}
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs">Total</p>
                      <p className="text-2xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
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
