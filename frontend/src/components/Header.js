import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, LogOut, User, Store, CheckCircle, Clock, XCircle, Package, RefreshCw, Shield, Sparkles } from 'lucide-react';

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

  const getStatusIcon = (status, type) => {
    if (type === 'admin_message') return <Shield className="w-4 h-4 text-blue-400" />;
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'accepted': return <Sparkles className="w-4 h-4 text-blue-400" />;
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Package className="w-4 h-4 text-stone-500" />;
    }
  };

  const getStatusText = (status, type) => {
    if (type === 'admin_message') return 'Admin';
    switch (status) {
      case 'pending': return 'Nuevo';
      case 'accepted': return 'Preparando';
      case 'ready': return '¡Lista!';
      default: return status;
    }
  };

  const getStatusBg = (status, type) => {
    if (type === 'admin_message') return 'bg-blue-500/10 border-blue-500/30';
    switch (status) {
      case 'pending': return 'bg-amber-500/10 border-amber-500/30';
      case 'accepted': return 'bg-blue-500/10 border-blue-500/30';
      case 'ready': return 'bg-green-500/10 border-green-500/30';
      default: return 'bg-stone-800 border-stone-700';
    }
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
            onClick={() => setShowDropdown(!showDropdown)}
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
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-2 bg-stone-800/30 flex justify-between items-center sticky top-0 backdrop-blur-sm">
                  <p className="text-xs font-medium text-stone-400 flex items-center gap-1.5">
                    <Bell className="w-3 h-3" />
                    Notificaciones
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); fetchNotifications(); }} 
                    className="p-1.5 hover:bg-stone-700 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loading ? (
                  <div className="p-6 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-r-transparent"></div>
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
                    {notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { setShowDropdown(false); navigate(user?.user_type === 'pulperia' ? '/dashboard' : '/orders'); }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${getStatusBg(n.status, n.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getStatusIcon(n.status, n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{n.title}</p>
                            <p className="text-xs text-stone-400 truncate mt-0.5">{n.message}</p>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            n.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                            n.type === 'admin_message' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-stone-700 text-stone-400'
                          }`}>
                            {getStatusText(n.status, n.type)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
