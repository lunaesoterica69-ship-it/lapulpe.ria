import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, BACKEND_URL } from '../config/api';
import { Bell, LogOut, User, Store, CheckCircle, Clock, XCircle, Package, Sparkles, ChevronRight, X, ShoppingBag, BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { requestNotificationPermission } from '../hooks/useNotifications';

const Header = ({ user, title, subtitle, onOrderUpdate }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const dropdownRef = useRef(null);

  // Check notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      toast.success('¡Notificaciones activadas!', {
        description: 'Recibirás alertas de nuevos pedidos y actualizaciones'
      });
    } else {
      setNotificationPermission(Notification.permission);
      toast.error('No se pudieron activar las notificaciones', {
        description: 'Revisa los permisos de tu navegador'
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedOrder(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/notifications`, { withCredentials: true });
        setNotificationCount(response.data.filter(n => n.status === 'pending' || n.status === 'accepted' || n.status === 'ready' || n.type === 'admin_message').length);
      } catch (error) { /* Silently ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Reduced frequency
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, { withCredentials: true });
      setNotifications(response.data);
      setNotificationCount(response.data.filter(n => n.status === 'pending' || n.status === 'accepted' || n.status === 'ready' || n.type === 'admin_message').length);
    } catch (error) {
      /* Ignore errors */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showDropdown && user) {
      fetchNotifications();
    }
  }, [showDropdown, user, fetchNotifications]);

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('cart');
      navigate('/', { replace: true });
    } catch (error) {
      /* Ignore errors */
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await axios.put(`${BACKEND_URL}/api/orders/${orderId}/status`, 
        { status: newStatus }, 
        { withCredentials: true }
      );
      toast.success(`Orden ${newStatus === 'accepted' ? 'aceptada' : newStatus === 'ready' ? 'lista' : newStatus === 'completed' ? 'completada' : 'actualizada'}`);
      setSelectedOrder(null);
      fetchNotifications();
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      toast.error('Error al actualizar la orden');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusConfig = (status) => ({
    pending: { icon: Clock, text: 'En Cola', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    accepted: { icon: Sparkles, text: 'Preparando', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    ready: { icon: CheckCircle, text: 'Lista', color: 'text-green-400', bg: 'bg-green-500/20' },
    completed: { icon: CheckCircle, text: 'Completada', color: 'text-stone-400', bg: 'bg-stone-500/20' },
    cancelled: { icon: XCircle, text: 'Cancelada', color: 'text-red-400', bg: 'bg-red-500/20' }
  })[status] || { icon: Package, text: status, color: 'text-stone-400', bg: 'bg-stone-500/20' };

  const activeNotifications = notifications.filter(n => 
    n.status === 'pending' || n.status === 'accepted' || n.status === 'ready'
  );

  return (
    <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur-md border-b border-stone-800/50">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Title Section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white truncate">{title}</h1>
          {subtitle && <p className="text-xs text-stone-500 truncate">{subtitle}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 transition-colors"
                data-testid="notifications-button"
              >
                <Bell className="w-5 h-5 text-stone-400" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Dropdown - FIXED z-index */}
              {showDropdown && (
                <div 
                  className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-stone-900 rounded-2xl border border-stone-700 shadow-2xl shadow-black/50 overflow-hidden"
                  style={{ zIndex: 9999 }}
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-stone-800 flex items-center justify-between bg-stone-900">
                    <h3 className="font-bold text-white">Notificaciones</h3>
                    <button 
                      onClick={() => setShowDropdown(false)}
                      className="p-1 hover:bg-stone-800 rounded-lg transition-colors sm:hidden"
                    >
                      <X className="w-5 h-5 text-stone-400" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {/* Enable Notifications Banner */}
                    {notificationPermission !== 'granted' && (
                      <button
                        onClick={handleEnableNotifications}
                        className="w-full p-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-stone-800 flex items-center gap-3 hover:from-red-600/30 hover:to-orange-600/30 transition-colors"
                      >
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <BellRing className="w-5 h-5 text-red-400 animate-pulse" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-white text-sm font-medium">Activar notificaciones</p>
                          <p className="text-stone-400 text-xs">Recibe alertas de pedidos al instante</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-500" />
                      </button>
                    )}
                    
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : activeNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-10 h-10 text-stone-700 mx-auto mb-2" />
                        <p className="text-stone-500 text-sm">Sin notificaciones activas</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-stone-800">
                        {activeNotifications.map((notification) => {
                          const config = getStatusConfig(notification.status);
                          const Icon = config.icon;
                          const isOwner = notification.role === 'owner';
                          const isSelected = selectedOrder?.order_id === notification.order_id;
                          const totalItems = notification.total_items || notification.items?.length || 0;

                          return (
                            <div key={notification.order_id} className="bg-stone-900">
                              <button
                                onClick={() => isOwner ? setSelectedOrder(isSelected ? null : notification) : navigate('/orders')}
                                className="w-full p-4 text-left hover:bg-stone-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`w-5 h-5 ${config.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-sm truncate">
                                      {isOwner ? notification.customer_name : notification.pulperia_name}
                                    </p>
                                    <p className="text-stone-400 text-xs truncate">
                                      {notification.message}
                                    </p>
                                    <p className="text-stone-500 text-xs mt-0.5">
                                      {totalItems} {totalItems === 1 ? 'producto' : 'productos'} • L{notification.total?.toFixed(0) || 0}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-xs font-medium ${config.color}`}>{config.text}</span>
                                    {isOwner && <ChevronRight className={`w-4 h-4 text-stone-600 mt-1 transition-transform ${isSelected ? 'rotate-90' : ''}`} />}
                                  </div>
                                </div>
                              </button>

                              {/* Expanded Order Details for Owners */}
                              {isSelected && isOwner && (
                                <div className="px-4 pb-4 bg-stone-800/30">
                                  {/* Items List */}
                                  {notification.items && notification.items.length > 0 && (
                                    <div className="mb-3 p-3 bg-stone-900/50 rounded-xl">
                                      <p className="text-xs text-stone-400 mb-2 font-medium flex items-center gap-1">
                                        <ShoppingBag className="w-3 h-3" /> Productos:
                                      </p>
                                      <div className="space-y-1">
                                        {notification.items.map((item, idx) => (
                                          <div key={idx} className="flex justify-between text-xs">
                                            <span className="text-white">
                                              {item.quantity}x {item.product_name}
                                            </span>
                                            <span className="text-stone-400">
                                              L{(item.price * item.quantity).toFixed(0)}
                                            </span>
                                          </div>
                                        ))}
                                        <div className="flex justify-between text-sm pt-2 border-t border-stone-700 mt-2">
                                          <span className="text-white font-bold">Total:</span>
                                          <span className="text-green-400 font-bold">L{notification.total?.toFixed(0)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <p className="text-xs text-stone-500 mb-3">Cambiar estado:</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {notification.status === 'pending' && (
                                      <button
                                        onClick={() => handleUpdateOrderStatus(notification.order_id, 'accepted')}
                                        disabled={updatingStatus}
                                        className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                      >
                                        <Sparkles className="w-4 h-4" />
                                        Aceptar
                                      </button>
                                    )}
                                    {(notification.status === 'pending' || notification.status === 'accepted') && (
                                      <button
                                        onClick={() => handleUpdateOrderStatus(notification.order_id, 'ready')}
                                        disabled={updatingStatus}
                                        className="py-2.5 px-3 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Lista
                                      </button>
                                    )}
                                    {notification.status === 'ready' && (
                                      <button
                                        onClick={() => handleUpdateOrderStatus(notification.order_id, 'completed')}
                                        disabled={updatingStatus}
                                        className="py-2.5 px-3 bg-stone-600 hover:bg-stone-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 col-span-2 flex items-center justify-center gap-2"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Marcar Completada
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleUpdateOrderStatus(notification.order_id, 'cancelled')}
                                      disabled={updatingStatus}
                                      className="py-2.5 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          {user && (
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 text-stone-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
