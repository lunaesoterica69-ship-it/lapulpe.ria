import { useState, useEffect } from 'react';
import { api, BACKEND_URL } from '../config/api';
import { toast } from 'sonner';
import { History, TrendingUp, ShoppingBag, DollarSign, Calendar, Package, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';


const OrderHistory = () => {
  const [user, setUser] = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [activeTab, setActiveTab] = useState('stats');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats(selectedPeriod);
    }
  }, [selectedPeriod, user]);

  const fetchData = async () => {
    try {
      const [userRes, ordersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/orders/completed`, { withCredentials: true })
      ]);
      
      setUser(userRes.data);
      setCompletedOrders(ordersRes.data);
      
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (period) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders/stats?period=${period}`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getPeriodLabel = (period) => {
    const labels = { day: 'Hoy', week: 'Semana', month: 'Mes' };
    return labels[period] || period;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-red-400/30 rounded-full animate-spin border-t-red-500 mx-auto"></div>
          <p className="mt-4 text-stone-500">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (user?.user_type !== 'pulperia') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <AnimatedBackground />
        <div className="text-center px-6 relative z-10">
          <BarChart3 className="w-16 h-16 mx-auto text-stone-700 mb-4" />
          <p className="text-xl text-stone-400">Solo para pulperías</p>
        </div>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <AnimatedBackground />
      
      <Header 
        user={user} 
        title="Reportes" 
        subtitle={`${completedOrders.length} órdenes completadas`}
      />

      <div className="relative z-10 px-4 py-4">
        {/* Tabs */}
        <div className="flex bg-stone-900 rounded-xl p-1 mb-6 border border-stone-800">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'stats' ? 'bg-red-600 text-white' : 'text-stone-500 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'history' ? 'bg-red-600 text-white' : 'text-stone-500 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            Historial
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Period Selector */}
            <div className="flex gap-2">
              {['day', 'week', 'month'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-red-600 text-white'
                      : 'bg-stone-900 border border-stone-800 text-stone-500 hover:text-white'
                  }`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>

            {stats && (
              <>
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Orders */}
                  <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="flex items-center text-xs text-green-400">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-stone-500 text-xs mb-1">Órdenes</p>
                    <p className="text-3xl font-bold text-white">{stats.total_orders}</p>
                  </div>

                  {/* Revenue */}
                  <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="flex items-center text-xs text-green-400">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-stone-500 text-xs mb-1">Ingresos</p>
                    <p className="text-3xl font-bold text-white">L{stats.total_revenue.toFixed(0)}</p>
                  </div>

                  {/* Average */}
                  <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-violet-400" />
                      </div>
                    </div>
                    <p className="text-stone-500 text-xs mb-1">Ticket Promedio</p>
                    <p className="text-3xl font-bold text-white">L{stats.average_order.toFixed(0)}</p>
                  </div>

                  {/* Products */}
                  <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <p className="text-stone-500 text-xs mb-1">Top Productos</p>
                    <p className="text-3xl font-bold text-white">{stats.top_products.length}</p>
                  </div>
                </div>

                {/* Top Products */}
                {stats.top_products.length > 0 && (
                  <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-red-400" />
                      Más Vendidos
                    </h3>
                    <div className="space-y-3">
                      {stats.top_products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between bg-stone-800/50 rounded-xl p-3 border border-stone-700">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                              index === 0 ? 'bg-amber-500' :
                              index === 1 ? 'bg-stone-500' :
                              index === 2 ? 'bg-orange-700' :
                              'bg-stone-700'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-white text-sm">{product.name}</span>
                          </div>
                          <span className="text-xl font-bold text-red-400">{product.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 rounded-2xl border border-red-500/20 p-5">
                  <h3 className="text-base font-bold text-white mb-4">
                    Resumen - {getPeriodLabel(selectedPeriod)}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Total órdenes</span>
                      <span className="font-bold text-white">{stats.total_orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Ingresos</span>
                      <span className="font-bold text-green-400">L{stats.total_revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Promedio</span>
                      <span className="font-bold text-white">L{stats.average_order.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            {completedOrders.length === 0 ? (
              <div className="text-center py-16">
                <History className="w-16 h-16 mx-auto text-stone-700 mb-4" />
                <p className="text-stone-500">No hay órdenes completadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-stone-800/50 px-4 py-3 flex justify-between items-center border-b border-stone-700">
                      <div>
                        <p className="font-bold text-white text-sm">#{order.order_id.slice(-8)}</p>
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString('es-HN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full text-xs font-medium">
                        Completada
                      </span>
                    </div>
                    
                    {/* Items */}
                    <div className="p-4">
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-stone-400">
                              {item.quantity}x {item.product_name}
                            </span>
                            <span className="text-stone-300">
                              L{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-stone-800 pt-3 flex justify-between items-center">
                        <span className="text-stone-500">Total</span>
                        <span className="text-xl font-bold text-green-400">L{order.total.toFixed(2)}</span>
                      </div>
                    </div>
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

export default OrderHistory;
