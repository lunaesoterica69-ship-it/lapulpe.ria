import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, LogOut, User, Store, CheckCircle, Clock, XCircle, Package, RefreshCw, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Header = ({ user, title, subtitle, onOrderUpdate }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const dropdownRef = useRef(null);

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
      } catch (error) {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, { withCredentials: true });
      setNotifications(response.data);
      setNotificationCount(response.data.filter(n => n.status === 'pending' || n.status === 'accepted' || n.status === 'ready' || n.type === 'admin_message').length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
      console.error('Error logging out:', error);
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
      toast.error('Error al actualizar');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusConfig = (status, type) => {
    if (type === 'admin_message') return { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Admin' };
    const configs = {
      pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Nueva' },
      accepted: { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Preparando' },
      ready: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: '¡Lista!' },
      completed: { icon: CheckCircle, color: 'text-stone-400', bg: 'bg-stone-800', border: 'border-stone-700', label: 'Completada' },
      cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Cancelada' }
    };
    return configs[status] || configs.pending;
  };

  const getNextStatus = (currentStatus) => {
    const flow = { pending: 'accepted', accepted: 'ready', ready: 'completed' };
    return flow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = { pending: 'Aceptar', accepted: 'Marcar Lista', ready: 'Completar' };
    return labels[currentStatus];
  };

  return (
    <div className="bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50 text-white px-4 py-3 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <div>
          {title && <h1 className="text-lg font-bold">{title}</h1>}
          {subtitle && <p className="text-stone-500 text-xs">{subtitle}</p>}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setShowDropdown(!showDropdown); setSelectedOrder(null); }}
            className="relative flex items-center gap-2 hover:bg-stone-800/50 rounded-full p-1.5 transition-all active:scale-95"
            data-testid="profile-dropdown-trigger"
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full ring-2 ring-stone-700" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center ring-2 ring-stone-700">
                <User className="w-5 h-5 text-stone-400" />
              </div>
            )}
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-stone-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-800 overflow-hidden animate-fade-in"
              style={{ zIndex: 999999 }}
            >
              {/* User Info */}
              <div className="p-4 bg-gradient-to-r from-stone-800/50 to-transparent border-b border-stone-800">
                <div className="flex items-center gap-3">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-11 h-11 rounded-full ring-2 ring-red-500/50" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-stone-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-stone-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      {user?.user_type === 'pulperia' ? (
                        <><Store className="w-3 h-3 text-red-400" /> Pulpería</>
                      ) : (
                        <><User className="w-3 h-3 text-blue-400" /> Cliente</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="max-h-72 overflow-y-auto">
                <div className="px-4 py-2 bg-stone-800/30 flex justify-between items-center sticky top-0 backdrop-blur-sm">
                  <p className="text-xs font-medium text-stone-400 flex items-center gap-1.5">
                    <Bell className="w-3 h-3" />
                    {selectedOrder ? 'Gestionar Orden' : 'Notificaciones'}
                  </p>
                  {selectedOrder ? (
                    <button onClick={() => setSelectedOrder(null)} className="text-xs text-stone-500 hover:text-white">
                      ← Volver
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); fetchNotifications(); }} className="p-1.5 hover:bg-stone-700 rounded-lg transition-colors">
                      <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="p-6 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-r-transparent"></div>
                  </div>
                ) : selectedOrder ? (
                  /* Order Detail View */
                  <div className="p-4 space-y-4">
                    <div className="text-center">
                      <p className="text-white font-bold">Orden #{selectedOrder.order_id?.slice(-6)}</p>
                      <p className="text-stone-500 text-xs">{selectedOrder.customer_name || 'Cliente'}</p>
                    </div>
                    
                    {/* Items */}
                    <div className="bg-stone-800/50 rounded-xl p-3 space-y-2">
                      {selectedOrder.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-stone-400">{item.quantity}x {item.product_name}</span>
                          <span className="text-white">L{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                      {selectedOrder.items?.length > 3 && (
                        <p className="text-xs text-stone-500">+{selectedOrder.items.length - 3} más...</p>
                      )}
                      <div className="border-t border-stone-700 pt-2 flex justify-between">
                        <span className="text-stone-400">Total</span>
                        <span className="font-bold text-red-400">L{selectedOrder.total?.toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Status Actions */}
                    {user?.user_type === 'pulperia' && getNextStatus(selectedOrder.status) && (
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder.order_id, getNextStatus(selectedOrder.status))}
                        disabled={updatingStatus}
                        className="w-full bg-red-600 hover:bg-red-500 disabled:bg-stone-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                      >
                        {updatingStatus ? (
                          <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            {getNextStatusLabel(selectedOrder.status)}
                          </>
                        )}
                      </button>
                    )}

                    {user?.user_type === 'pulperia' && selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder.order_id, 'cancelled')}
                        disabled={updatingStatus}
                        className="w-full bg-stone-800 hover:bg-stone-700 text-red-400 py-2 rounded-xl text-sm font-medium transition-all"
                      >
                        Cancelar Orden
                      </button>
                    )}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-5 h-5 text-stone-600" />
                    </div>
                    <p className="text-sm text-stone-500">Sin notificaciones</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1.5">
                    {notifications.slice(0, 6).map((n) => {
                      const config = getStatusConfig(n.status, n.type);
                      const Icon = config.icon;
                      const isPulperia = user?.user_type === 'pulperia';
                      const canManage = isPulperia && n.type !== 'admin_message' && ['pending', 'accepted', 'ready'].includes(n.status);
                      
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (canManage) {
                              setSelectedOrder(n);
                            } else if (!isPulperia) {
                              setShowDropdown(false);
                              navigate('/orders');
                            }
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${config.bg} ${config.border}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <Icon className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{n.title}</p>
                              <p className="text-xs text-stone-400 truncate mt-0.5">{n.message}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-800 ${config.color}`}>
                                {config.label}
                              </span>
                              {canManage && <ChevronRight className="w-3 h-3 text-stone-600" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              {!selectedOrder && (
                <div className="border-t border-stone-800 p-2 space-y-1">
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-stone-300 hover:bg-stone-800 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-stone-500" /> Mi Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
