import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationContainer } from '../components/FloatingNotification';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Reproducir sonido si está disponible
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      // Ignorar errores de vibración
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notificación de nuevo pedido (para dueños de pulpería)
  const notifyNewOrder = useCallback((order, pulperiaName) => {
    addNotification({
      type: 'new_order',
      title: `🛒 ¡Nuevo Pedido!`,
      message: `${order.customer_name || 'Cliente'} hizo un pedido`,
      items: order.items,
      total: order.total,
      orderId: order.order_id
    });
  }, [addNotification]);

  // Notificación de orden aceptada (para clientes)
  const notifyOrderAccepted = useCallback((pulperiaName, order) => {
    addNotification({
      type: 'order_accepted',
      title: `👨‍🍳 Preparando tu orden`,
      message: `${pulperiaName} está preparando tu pedido`,
      items: order?.items,
      total: order?.total,
      orderId: order?.order_id
    });
  }, [addNotification]);

  // Notificación de orden lista (para clientes)
  const notifyOrderReady = useCallback((pulperiaName, order) => {
    addNotification({
      type: 'order_ready',
      title: `✅ ¡Tu orden está lista!`,
      message: `Pasa a recoger tu pedido en ${pulperiaName}`,
      items: order?.items,
      total: order?.total,
      orderId: order?.order_id
    });
  }, [addNotification]);

  // Notificación genérica de cambio de estado
  const notifyOrderStatusChange = useCallback((status, pulperiaName, order) => {
    const configs = {
      accepted: {
        type: 'order_accepted',
        title: '👨‍🍳 Preparando tu orden',
        message: `${pulperiaName} está preparando tu pedido`
      },
      ready: {
        type: 'order_ready',
        title: '✅ ¡Tu orden está lista!',
        message: `Pasa a recoger en ${pulperiaName}`
      },
      completed: {
        type: 'order_completed',
        title: '🎉 Orden completada',
        message: `Gracias por tu compra en ${pulperiaName}`
      }
    };

    const config = configs[status];
    if (config) {
      addNotification({
        ...config,
        items: order?.items,
        total: order?.total,
        orderId: order?.order_id
      });
    }
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notifyNewOrder,
    notifyOrderAccepted,
    notifyOrderReady,
    notifyOrderStatusChange
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};

export default NotificationContext;
