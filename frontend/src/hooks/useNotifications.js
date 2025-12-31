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

    // Auto-cerrar después de 5 segundos
    setTimeout(() => notification.close(), 5000);

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
export const notifyNewOrder = (customerName, total, pulperiaName) => {
  sendBrowserNotification(`🛒 ¡Nuevo Pedido!`, {
    body: `${customerName} hizo un pedido por L${total} en ${pulperiaName}`,
    tag: 'new-order',
    renotify: true
  });
};

export const notifyOrderReady = (pulperiaName) => {
  sendBrowserNotification(`✅ ¡Tu orden está lista!`, {
    body: `${pulperiaName} tiene tu pedido listo para recoger`,
    tag: 'order-ready',
    renotify: true
  });
};

export const notifyOrderAccepted = (pulperiaName) => {
  sendBrowserNotification(`👨‍🍳 Preparando tu orden`, {
    body: `${pulperiaName} está preparando tu pedido`,
    tag: 'order-accepted',
    renotify: true
  });
};

export const notifyOrderStatusChange = (status, pulperiaName) => {
  const messages = {
    accepted: { title: '👨‍🍳 Preparando tu orden', body: `${pulperiaName} está preparando tu pedido` },
    ready: { title: '✅ ¡Tu orden está lista!', body: `${pulperiaName} tiene tu pedido listo para recoger` },
    completed: { title: '🎉 Orden completada', body: `Gracias por tu compra en ${pulperiaName}` }
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
