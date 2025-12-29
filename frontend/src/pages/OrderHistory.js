import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { History, TrendingUp, ShoppingBag, DollarSign, Calendar, Package } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const OrderHistory = () => {
  const [user, setUser] = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('day');
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
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (period) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/orders/stats?period=${period}`,
        { withCredentials: true }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getPeriodLabel = (period) => {
    const labels = {
      day: 'Hoy',
      week: 'Esta Semana',
      month: 'Este Mes'
    };
    return labels[period] || period;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-stone-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user?.user_type !== 'pulperia') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-xl text-stone-600">Solo pulperías pueden ver el historial</p>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Profile Dropdown */}
      <Header 
        user={user} 
        title="Historial y Reportes" 
        subtitle={`${completedOrders.length} órdenes completadas`}
      />

      <div className="px-6 py-6">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats">
            {/* Period Selector */}
            <div className="flex gap-2 mb-6">
              {['day', 'week', 'month'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    selectedPeriod === period
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>

            {stats && (
              <div className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <ShoppingBag className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-sm opacity-90 mb-1">Total Órdenes</p>
                    <p className="text-4xl font-black">{stats.total_orders}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                    <DollarSign className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-sm opacity-90 mb-1">Ingresos Totales</p>
                    <p className="text-4xl font-black">L{stats.total_revenue.toFixed(0)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-sm opacity-90 mb-1">Promedio por Orden</p>
                    <p className="text-3xl font-black">L{stats.average_order.toFixed(2)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                    <Package className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-sm opacity-90 mb-1">Top Productos</p>
                    <p className="text-3xl font-black">{stats.top_products.length}</p>
                  </div>
                </div>

                {/* Top Products */}
                {stats.top_products.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md border-b-4 border-primary p-6">
                    <h3 className="text-xl font-black text-stone-800 mb-4 flex items-center gap-2">
                      <Package className="w-6 h-6 text-primary" />
                      Productos Más Vendidos
                    </h3>
                    <div className="space-y-3">
                      {stats.top_products.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-red-50 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-orange-600' :
                              'bg-primary'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-bold text-stone-800">{product.name}</span>
                          </div>
                          <span className="text-2xl font-black text-primary">{product.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-gradient-to-br from-primary to-red-700 rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="text-2xl font-black mb-4">Resumen - {getPeriodLabel(selectedPeriod)}</h3>
                  <div className="space-y-2 text-lg">
                    <p className="flex justify-between">
                      <span className="opacity-90">Total de órdenes:</span>
                      <span className="font-black">{stats.total_orders}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="opacity-90">Ingresos generados:</span>
                      <span className="font-black">L{stats.total_revenue.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="opacity-90">Ticket promedio:</span>
                      <span className="font-black">L{stats.average_order.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {completedOrders.length === 0 ? (
              <div className="text-center py-16">
                <History className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                <p className="text-stone-500 text-lg">No hay órdenes completadas aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-white rounded-2xl shadow-md border-l-4 border-green-500 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-stone-500 mb-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(order.created_at).toLocaleString('es-HN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="font-bold text-stone-800">Orden #{order.order_id.slice(-8)}</p>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                        COMPLETADA
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm bg-stone-50 rounded-lg p-2">
                          <span className="text-stone-700">
                            {item.quantity}x {item.product_name}
                          </span>
                          <span className="font-semibold text-stone-800">
                            L{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-stone-200 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-stone-800">Total:</span>
                      <span className="text-2xl font-black text-green-600">L{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default OrderHistory;
