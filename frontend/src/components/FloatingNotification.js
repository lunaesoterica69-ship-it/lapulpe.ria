import { useState, useEffect } from 'react';
import { Bell, X, ShoppingBag, CheckCircle, Clock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente de notificaciones flotantes en pantalla
 * Muestra notificaciones de pedidos en tiempo real
 */
const FloatingNotification = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Entrada con animación
    setTimeout(() => setIsVisible(true), 50);
    
    // Auto-cerrar después de 8 segundos
    const autoClose = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(autoClose);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    navigate('/orders');
    handleClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'new_order':
        return <ShoppingBag className="w-6 h-6 text-white" />;
      case 'order_ready':
        return <CheckCircle className="w-6 h-6 text-white" />;
      case 'order_accepted':
        return <Clock className="w-6 h-6 text-white" />;
      default:
        return <Package className="w-6 h-6 text-white" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'new_order':
        return 'from-green-600 to-green-700';
      case 'order_ready':
        return 'from-blue-600 to-blue-700';
      case 'order_accepted':
        return 'from-amber-600 to-amber-700';
      default:
        return 'from-red-600 to-red-700';
    }
  };

  return (
    <div 
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div 
        onClick={handleClick}
        className={`
          bg-gradient-to-r ${getBgColor()} 
          rounded-2xl shadow-2xl shadow-black/50 
          p-4 cursor-pointer
          hover:scale-[1.02] transition-transform
          border border-white/10
          max-w-sm w-full
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-white font-bold text-sm">{notification.title}</h4>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
            
            <p className="text-white/90 text-sm mt-1">{notification.message}</p>
            
            {/* Items preview */}
            {notification.items && notification.items.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <div className="flex flex-wrap gap-1">
                  {notification.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">
                      {item.quantity}x {item.product_name}
                    </span>
                  ))}
                  {notification.items.length > 3 && (
                    <span className="text-xs text-white/70">+{notification.items.length - 3} más</span>
                  )}
                </div>
                {notification.total && (
                  <p className="text-white font-bold mt-1">Total: L{notification.total.toFixed(0)}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Click indicator */}
        <div className="mt-2 text-center">
          <span className="text-xs text-white/60">Toca para ver detalles</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Contenedor de notificaciones flotantes
 */
export const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[99999] space-y-3 pointer-events-auto" style={{ zIndex: 99999 }}>
      {notifications.map((notification) => (
        <FloatingNotification
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

export default FloatingNotification;
