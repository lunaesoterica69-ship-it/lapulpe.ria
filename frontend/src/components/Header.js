import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, LogOut, User, Store, CheckCircle, Clock, XCircle, Package, RefreshCw } from 'lucide-react';

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

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/notifications`, { withCredentials: true });
        setNotificationCount(response.data.filter(n => n.status === 'pending' || n.status === 'accepted' || n.status === 'ready').length);
      } catch (error) {}
    };
    fetchCount();
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
      case 'pending': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'accepted': return <Package className="w-4 h-4 text-blue-400" />;
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Package className="w-4 h-4 text-stone-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Nuevo';
      case 'accepted': return 'Aceptada';
      case 'ready': return 'Lista';
      default: return status;
    }
  };

  return (
    <div className="bg-stone-900/80 backdrop-blur-sm border-b border-stone-800 text-white px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          {title && <h1 className="text-xl font-bold">{title}</h1>}
          {subtitle && <p className="text-stone-500 text-sm">{subtitle}</p>}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative flex items-center gap-2 hover:bg-stone-800 rounded-full p-1.5 transition-colors"
            data-testid="profile-dropdown-trigger"
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center">
                <User className="w-5 h-5 text-stone-400" />
              </div>
            )}
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-stone-900 rounded-xl shadow-2xl border border-stone-800 overflow-hidden z-[99999]">
              {/* User Info */}
              <div className="p-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-stone-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      {user?.user_type === 'pulperia' ? <><Store className="w-3 h-3" /> Pulpería</> : <><User className="w-3 h-3" /> Cliente</>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="max-h-56 overflow-y-auto">
                <div className="px-4 py-2 bg-stone-800/50 flex justify-between items-center sticky top-0">
                  <p className="text-xs font-medium text-stone-400">Notificaciones</p>
                  <button onClick={(e) => { e.stopPropagation(); fetchNotifications(); }} className="p-1 hover:bg-stone-700 rounded transition-colors">
                    <RefreshCw className={`w-3 h-3 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loading ? (
                  <div className="p-4 text-center">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-r-transparent"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-6 h-6 mx-auto mb-2 text-stone-700" />
                    <p className="text-xs text-stone-600">Sin notificaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-800">
                    {notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { setShowDropdown(false); navigate(user?.user_type === 'pulperia' ? '/dashboard' : '/orders'); }}
                        className="p-3 hover:bg-stone-800/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {getStatusIcon(n.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{n.title}</p>
                            <p className="text-xs text-stone-500 truncate">{n.message}</p>
                          </div>
                          <span className="text-[10px] text-stone-500">{getStatusText(n.status)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-stone-800 p-2">
                <button
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  className="w-full text-left px-3 py-2 text-sm text-stone-400 hover:bg-stone-800 rounded-lg flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Ver Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-stone-800 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
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
