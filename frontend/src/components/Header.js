import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, LogOut, User, Store, ShoppingBag, CheckCircle, Clock, XCircle, Package, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Header = ({ user, title, subtitle }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notification count on mount (WebSocket will handle real-time updates)
  useEffect(() => {
    if (!user) return;
    
    const fetchCount = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/notifications`, { withCredentials: true });
        setNotificationCount(response.data.filter(n => n.status === 'pending' || n.status === 'accepted' || n.status === 'ready').length);
      } catch (error) {
        // Silently fail
      }
    };
    
    fetchCount();
    // Reduced polling to 30 seconds as backup (WebSocket handles real-time)
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, { withCredentials: true });
      setNotifications(response.data);
      setNotificationCount(response.data.filter(n => n.status === 'pending' || n.status === 'accepted' || n.status === 'ready').length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications when dropdown opens
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-stone-500" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="gradient-hero text-white px-6 py-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && <h1 className="text-2xl font-black mb-1">{title}</h1>}
          {subtitle && <p className="text-white/90 text-sm">{subtitle}</p>}
        </div>

        {/* Profile Icon with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full p-1 pr-3 transition-all"
            data-testid="profile-dropdown-trigger"
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
            )}
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50">
              {/* User Info Header */}
              <div className="bg-gradient-to-r from-primary to-red-600 text-white p-4">
                <div className="flex items-center gap-3">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-12 h-12 rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{user?.name}</p>
                    <p className="text-sm opacity-90 flex items-center gap-1">
                      {user?.user_type === 'pulperia' ? (
                        <>
                          <Store className="w-3 h-3" /> Dueño de Pulpería
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" /> Cliente
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                  <p className="text-xs font-bold text-stone-500 uppercase">
                    {user?.user_type === 'pulperia' ? 'Órdenes Pendientes' : 'Mis Órdenes'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchNotifications();
                    }}
                    className="p-1 hover:bg-stone-200 rounded transition-colors"
                    title="Actualizar"
                  >
                    <RefreshCw className={`w-4 h-4 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loading ? (
                  <div className="p-4 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-stone-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          setShowDropdown(false);
                          navigate(user?.user_type === 'pulperia' ? '/dashboard' : '/orders');
                        }}
                        className="p-3 hover:bg-stone-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(notification.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-stone-800 text-sm">{notification.title}</p>
                            <p className="text-xs text-stone-600 truncate">{notification.message}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusBadgeColor(notification.status)}`}>
                            {notification.status === 'pending' ? 'Nuevo' : 
                             notification.status === 'accepted' ? 'Aceptada' :
                             notification.status === 'ready' ? 'Lista' : notification.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-stone-200 p-2">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Ver Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
