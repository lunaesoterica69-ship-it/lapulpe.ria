import { useState, useEffect, useCallback, useMemo } from 'react';
import { api, BACKEND_URL } from '../config/api';
import { toast } from 'sonner';
import { Package, Clock, CheckCircle, XCircle, ShoppingBag, Sparkles, Zap, Trophy, MapPin, Store, ChevronRight, History, Calendar, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';
import Pulpero, { getPulperoMessage } from '../components/Pulpero';
import useWebSocket from '../hooks/useWebSocket';
import { useNotifications } from '../contexts/NotificationContext';


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

const MyOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Floating notifications
  const floatingNotifications = useNotifications();
  
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

  useWebSocket(user?.user_id, handleWebSocketMessage, floatingNotifications);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, ordersRes] = await Promise.all([
          api.get(`/api/auth/me`),
          api.get(`/api/orders`)
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
  
  // Agrupar órdenes activas por pulpería para mostrar claramente
  const activeOrdersByPulperia = useMemo(() => {
    const grouped = {};
    activeOrders.forEach(order => {
      const pulperiaId = order.pulperia_id;
      if (!grouped[pulperiaId]) {
        grouped[pulperiaId] = {
          pulperia_id: pulperiaId,
          pulperia_name: order.pulperia_name || 'Pulpería',
          orders: []
        };
      }
      grouped[pulperiaId].orders.push(order);
    });
    return Object.values(grouped);
  }, [activeOrders]);

  // Estadísticas del historial
  const historyStats = useMemo(() => {
    const completed = pastOrders.filter(o => o.status === 'completed');
    const totalSpent = completed.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalItems = completed.reduce((sum, o) => sum + (o.items?.length || 0), 0);
    const uniquePulperias = new Set(completed.map(o => o.pulperia_id)).size;
    return { totalSpent, totalItems, totalOrders: completed.length, uniquePulperias };
  }, [pastOrders]);

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
      <Header user={user} title="Mis Órdenes" subtitle={`${activeOrders.length} activa${activeOrders.length !== 1 ? 's' : ''}`} />

      {/* Tab Selector */}
      <div className="relative z-10 px-4 py-3 flex gap-2">
        <button
          onClick={() => setShowHistory(false)}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            !showHistory 
              ? 'bg-red-600 text-white' 
              : 'bg-stone-900 text-stone-400 border border-stone-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          Activas ({activeOrders.length})
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            showHistory 
              ? 'bg-red-600 text-white' 
              : 'bg-stone-900 text-stone-400 border border-stone-800'
          }`}
        >
          <History className="w-4 h-4" />
          Historial ({pastOrders.length})
        </button>
      </div>

      <div className="relative z-10 px-4 py-2">
        {!showHistory ? (
          /* ÓRDENES ACTIVAS - Separadas por Pulpería */
          <>
            {activeOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-stone-800">
                  <ShoppingBag className="w-10 h-10 text-stone-700" />
                </div>
                <p className="text-white text-lg font-semibold">No tienes órdenes activas</p>
                <p className="text-stone-500 text-sm mt-1 mb-4">¡Explora las pulperías cercanas!</p>
                <button 
                  onClick={() => navigate('/map')}
                  className="bg-red-600 hover:bg-red-500 text-white font-medium py-3 px-6 rounded-xl transition-all"
                >
                  Explorar Pulperías
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Aviso si hay múltiples pulperías */}
                {activeOrdersByPulperia.length > 1 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3">
                    <Store className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <p className="text-amber-400 text-sm">
                      Tienes pedidos en <span className="font-bold">{activeOrdersByPulperia.length} pulperías diferentes</span>. 
                      Cada una preparará tu orden por separado.
                    </p>
                  </div>
                )}

                {/* Órdenes agrupadas por pulpería */}
                {activeOrdersByPulperia.map((group) => (
                  <div key={group.pulperia_id} className="space-y-3">
                    {/* Pulpería Header */}
                    <div className="flex items-center gap-2 px-1">
                      <Store className="w-4 h-4 text-red-400" />
                      <h3 className="text-white font-semibold">{group.pulperia_name}</h3>
                      <span className="text-stone-600 text-sm">({group.orders.length} orden{group.orders.length !== 1 ? 'es' : ''})</span>
                    </div>

                    {/* Órdenes de esta pulpería */}
                    {group.orders.map((order) => (
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
                          <p className="text-center text-sm text-stone-400 mt-2 px-4 italic">
                            &ldquo;{getPulperoMessage(order.status)}&rdquo;
                          </p>
                        </div>

                        {/* Order Header */}
                        <div className="px-4 py-3 border-t border-stone-800/50">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <p className="text-stone-500 text-xs flex items-center gap-1">
                                <Receipt className="w-3 h-3" />
                                Pedido #{order.order_id.slice(-6)}
                              </p>
                              <p className="text-stone-600 text-xs mt-0.5">
                                A nombre de: <span className="text-stone-400">{order.customer_name}</span>
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
                ))}
              </div>
            )}
          </>
        ) : (
          /* HISTORIAL DE COMPRAS */
          <div className="space-y-4">
            {/* Estadísticas */}
            {historyStats.totalOrders > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 text-center">
                  <p className="text-2xl font-black text-white">L{historyStats.totalSpent.toFixed(0)}</p>
                  <p className="text-stone-500 text-xs">Total gastado</p>
                </div>
                <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 text-center">
                  <p className="text-2xl font-black text-white">{historyStats.totalOrders}</p>
                  <p className="text-stone-500 text-xs">Órdenes completadas</p>
                </div>
                <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 text-center">
                  <p className="text-2xl font-black text-white">{historyStats.totalItems}</p>
                  <p className="text-stone-500 text-xs">Productos comprados</p>
                </div>
                <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 text-center">
                  <p className="text-2xl font-black text-white">{historyStats.uniquePulperias}</p>
                  <p className="text-stone-500 text-xs">Pulperías visitadas</p>
                </div>
              </div>
            )}

            {pastOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-stone-800">
                  <History className="w-8 h-8 text-stone-700" />
                </div>
                <p className="text-white font-semibold">Sin historial aún</p>
                <p className="text-stone-500 text-sm mt-1">Tus compras completadas aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-stone-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Todas tus compras
                </h3>
                
                {pastOrders.map((order) => (
                  <div 
                    key={order.order_id} 
                    className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden"
                  >
                    {/* Order Header - Clickable */}
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-stone-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          order.status === 'completed' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {order.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium">{order.pulperia_name || 'Pulpería'}</p>
                          <p className="text-stone-500 text-xs">
                            {new Date(order.created_at).toLocaleDateString('es-HN', { 
                              day: 'numeric', month: 'short', year: 'numeric' 
                            })} • {order.items?.length || 0} productos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold">L{order.total?.toFixed(0)}</p>
                        <ChevronRight className={`w-5 h-5 text-stone-600 transition-transform ${
                          expandedOrder === order.order_id ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {expandedOrder === order.order_id && (
                      <div className="border-t border-stone-800 p-4 bg-stone-800/20 space-y-3">
                        <div className="flex justify-between text-xs text-stone-500 mb-2">
                          <span>Pedido #{order.order_id.slice(-6)}</span>
                          <span>A nombre de: {order.customer_name}</span>
                        </div>
                        
                        {/* Items List */}
                        <div className="space-y-2">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 bg-stone-900/50 rounded-lg p-2">
                              <div className="w-10 h-10 bg-stone-800 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-stone-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">{item.product_name}</p>
                                <p className="text-stone-600 text-xs">L{item.price} x {item.quantity}</p>
                              </div>
                              <p className="text-stone-400 text-sm font-medium">L{(item.price * item.quantity).toFixed(0)}</p>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary */}
                        <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                          <span className="text-stone-500 text-sm">Total de la orden</span>
                          <span className="text-white font-bold text-lg">L{order.total?.toFixed(0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
