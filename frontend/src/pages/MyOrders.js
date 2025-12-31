import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Package, Clock, CheckCircle, XCircle, ShoppingBag, Sparkles, Zap, Trophy, MapPin } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';
import Pulpero, { getPulperoMessage } from '../components/Pulpero';
import useWebSocket from '../hooks/useWebSocket';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StatusBadge = ({ status }) => {
  const config = {
    pending: { icon: Clock, text: 'En Cola', bg: 'bg-amber-500/20', border: 'border-amber-500/50', color: 'text-amber-400' },
    accepted: { icon: Sparkles, text: 'Preparando', bg: 'bg-blue-500/20', border: 'border-blue-500/50', color: 'text-blue-400' },
    ready: { icon: Trophy, text: '¡LISTA!', bg: 'bg-green-500/20', border: 'border-green-500/50', color: 'text-green-400', pulse: true },
    completed: { icon: CheckCircle, text: 'Completada', bg: 'bg-stone-700/50', border: 'border-stone-600', color: 'text-stone-400' },
    cancelled: { icon: XCircle, text: 'Cancelada', bg: 'bg-red-500/20', border: 'border-red-500/50', color: 'text-red-400' }
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${c.bg} border ${c.border} ${c.pulse ? 'animate-pulse' : ''}`}>
      <Icon className={`w-4 h-4 ${c.color}`} />
      <span className={`text-xs font-bold ${c.color}`}>{c.text}</span>
    </div>
  );
};

const OrderProgress = ({ status }) => {
  const stages = ['pending', 'accepted', 'ready', 'completed'];
  const currentIndex = stages.indexOf(status);
  if (status === 'cancelled') return null;
  
  return (
    <div className="flex items-center gap-1 w-full">
      {stages.map((stage, index) => (
        <div key={stage} className="flex-1">
          <div className={`h-1 rounded-full transition-all duration-500 ${
            index <= currentIndex 
              ? stage === 'ready' || stage === 'completed' ? 'bg-green-500' : 'bg-red-500'
              : 'bg-stone-800'
          }`} />
        </div>
      ))}
    </div>
  );
};

// Usar mensajes del Pulpero más humanos
const getStatusMessage = (status) => getPulperoMessage(status);

const MyOrders = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'order_update' && data.target === 'customer') {
      const { event, order, message, sound } = data;
      
      if (sound || event === 'ready') {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = event === 'ready' ? 880 : 660;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.15;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) { /* Audio might fail silently */ }
      }
      
      if (event === 'status_changed' || event === 'ready') {
        toast.success(message, { duration: 5000 });
      }
      
      setOrders(prev => {
        const idx = prev.findIndex(o => o.order_id === order.order_id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...order };
          return updated;
        } else if (event === 'new_order') {
          return [order, ...prev];
        }
        return prev;
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
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch (error) {
        toast.error('Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const activeOrders = orders.filter(o => ['pending', 'accepted', 'ready'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-red-400/30 rounded-full animate-spin border-t-red-500 mx-auto"></div>
          <p className="mt-4 text-stone-500">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <AnimatedBackground variant="minimal" />
      <Header user={user} title="Mis Órdenes" subtitle={`${orders.length} orden${orders.length !== 1 ? 'es' : ''}`} />

      <div className="relative z-10 px-4 py-4">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-stone-800">
              <ShoppingBag className="w-10 h-10 text-stone-700" />
            </div>
            <p className="text-white text-lg font-semibold">No tienes órdenes aún</p>
            <p className="text-stone-500 text-sm mt-1">¡Explora las pulperías cercanas!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-stone-500 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Órdenes Activas ({activeOrders.length})
                </h2>
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.order_id}
                      className={`bg-stone-900 rounded-2xl border overflow-hidden transition-all ${
                        order.status === 'ready' ? 'border-green-500/50 ring-2 ring-green-500/20' : 'border-stone-800'
                      }`}
                    >
                      {/* Mascot Section */}
                      <div className={`py-4 flex flex-col items-center justify-center ${
                        order.status === 'pending' ? 'bg-amber-500/5' :
                        order.status === 'accepted' ? 'bg-blue-500/5' :
                        'bg-green-500/5'
                      }`}>
                        <Pulpero status={order.status} size="md" />
                        <p className="text-center text-sm text-stone-400 mt-2 px-4">
                          {getStatusMessage(order.status)}
                        </p>
                      </div>

                      {/* Order Header */}
                      <div className="px-4 py-3 border-t border-stone-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-white font-bold">{order.pulperia_name || 'Pulpería'}</p>
                            <p className="text-stone-600 text-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              #{order.order_id.slice(-6)}
                            </p>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>
                        <OrderProgress status={order.status} />
                      </div>

                      {/* Items with Images */}
                      <div className="px-4 py-3 space-y-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 bg-stone-800/30 rounded-xl p-2">
                            <div className="w-12 h-12 bg-stone-800 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-stone-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{item.product_name}</p>
                              <p className="text-stone-500 text-xs">x{item.quantity}</p>
                            </div>
                            <p className="text-red-400 font-bold text-sm">L{(item.price * item.quantity).toFixed(0)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 bg-stone-800/30 flex justify-between items-center border-t border-stone-800/50">
                        <p className="text-xs text-stone-500">
                          {new Date(order.created_at).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xl font-black text-white">L{order.total?.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-stone-500 mb-3">Historial ({pastOrders.length})</h2>
                <div className="space-y-2">
                  {pastOrders.slice(0, 10).map((order) => (
                    <div key={order.order_id} className="bg-stone-900/50 rounded-xl border border-stone-800/50 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium text-sm">{order.pulperia_name || 'Pulpería'}</p>
                          <p className="text-stone-600 text-xs">
                            {new Date(order.created_at).toLocaleDateString('es-HN')} • {order.items?.length || 0} productos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">L{order.total?.toFixed(0)}</p>
                          <p className={`text-xs ${order.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                            {order.status === 'completed' ? '✓ Completada' : '✗ Cancelada'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default MyOrders;
