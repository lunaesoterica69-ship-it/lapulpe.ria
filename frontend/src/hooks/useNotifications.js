// Hook para notificaciones del navegador
// Solicita permiso y envía notificaciones push

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendBrowserNotification = (title, options = {}) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false,
      ...options
    });

    // Auto-cerrar después de 8 segundos
    setTimeout(() => notification.close(), 8000);

    // Click handler
    notification.onclick = () => {
      window.focus();
      if (options.onClick) options.onClick();
      notification.close();
    };

    return notification;
  }
};

// Notificaciones específicas para La Pulpería
export const notifyNewOrder = (order, pulperiaName) => {
  const items = order.items || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const itemSummary = items.slice(0, 3).map(i => `${i.quantity || 1}x ${i.product_name}`).join(', ');
  const extraItems = items.length > 3 ? ` +${items.length - 3} más` : '';
  
  sendBrowserNotification(`🛒 ¡Nuevo Pedido en ${pulperiaName}!`, {
    body: `${order.customer_name || 'Cliente'}: ${itemSummary}${extraItems}\nTotal: L${(order.total || 0).toFixed(0)} (${totalItems} productos)`,
    tag: 'new-order',
    renotify: true
  });
};

export const notifyOrderReady = (pulperiaName, order) => {
  const items = order?.items || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  sendBrowserNotification(`✅ ¡Tu orden está lista!`, {
    body: `${pulperiaName} tiene tu pedido listo para recoger\n${totalItems} productos • L${(order?.total || 0).toFixed(0)}`,
    tag: 'order-ready',
    renotify: true
  });
};

export const notifyOrderAccepted = (pulperiaName, order) => {
  const items = order?.items || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  sendBrowserNotification(`👨‍🍳 Preparando tu orden`, {
    body: `${pulperiaName} está preparando tu pedido\n${totalItems} productos • L${(order?.total || 0).toFixed(0)}`,
    tag: 'order-accepted',
    renotify: true
  });
};

export const notifyOrderStatusChange = (status, pulperiaName, order) => {
  const items = order?.items || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalStr = `${totalItems} productos • L${(order?.total || 0).toFixed(0)}`;
  
  const messages = {
    accepted: { title: '👨‍🍳 Preparando tu orden', body: `${pulperiaName} está preparando tu pedido\n${totalStr}` },
    ready: { title: '✅ ¡Tu orden está lista!', body: `${pulperiaName} tiene tu pedido listo para recoger\n${totalStr}` },
    completed: { title: '🎉 Orden completada', body: `Gracias por tu compra en ${pulperiaName}\n${totalStr}` }
  };

  const msg = messages[status];
  if (msg) {
    sendBrowserNotification(msg.title, { body: msg.body, tag: `order-${status}`, renotify: true });
  }
};

export default {
  requestNotificationPermission,
  sendBrowserNotification,
  notifyNewOrder,
  notifyOrderReady,
  notifyOrderAccepted,
  notifyOrderStatusChange
};
