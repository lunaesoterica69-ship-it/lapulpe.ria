// Hook para notificaciones del navegador con Service Worker
// Soporta notificaciones incluso cuando el navegador está minimizado

let swRegistration = null;

// Registrar Service Worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado');
      return swRegistration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return null;
    }
  }
  return null;
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    // Registrar SW si aún no está registrado
    if (!swRegistration) {
      await registerServiceWorker();
    }
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
      return true;
    }
  }

  return false;
};

// Enviar notificación usando Service Worker si está disponible
export const sendBrowserNotification = async (title, options = {}) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission !== 'granted') return;

  // Intentar usar Service Worker para notificaciones persistentes
  if (swRegistration || navigator.serviceWorker?.controller) {
    try {
      const registration = swRegistration || await navigator.serviceWorker.ready;
      
      // Enviar mensaje al SW para mostrar notificación
      if (registration.active) {
        registration.active.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            body: options.body || '',
            tag: options.tag || 'default',
            data: {
              url: options.url || '/orders',
              orderId: options.orderId
            }
          }
        });
        return;
      }
    } catch (e) {
      console.log('SW notification failed, using fallback:', e);
    }
  }

  // Fallback a notificación normal si SW no está disponible
  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false,
      ...options
    });

    setTimeout(() => notification.close(), 8000);

    notification.onclick = () => {
      window.focus();
      if (options.onClick) options.onClick();
      notification.close();
    };

    return notification;
  } catch (e) {
    console.error('Error creating notification:', e);
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
    renotify: true,
    url: '/orders',
    orderId: order.order_id
  });
};

export const notifyOrderReady = (pulperiaName, order) => {
  const items = order?.items || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  sendBrowserNotification(`✅ ¡Tu orden está lista!`, {
    body: `${pulperiaName} tiene tu pedido listo para recoger\n${totalItems} productos • L${(order?.total || 0).toFixed(0)}`,
    tag: 'order-ready',
    renotify: true,
    url: '/orders',
    orderId: order?.order_id
  });
};

export const notifyOrderAccepted = (pulperiaName, order) => {
  const items = order?.items || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  sendBrowserNotification(`👨‍🍳 Preparando tu orden`, {
    body: `${pulperiaName} está preparando tu pedido\n${totalItems} productos • L${(order?.total || 0).toFixed(0)}`,
    tag: 'order-accepted',
    renotify: true,
    url: '/orders',
    orderId: order?.order_id
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
    sendBrowserNotification(msg.title, { 
      body: msg.body, 
      tag: `order-${status}`, 
      renotify: true,
      url: '/orders',
      orderId: order?.order_id
    });
  }
};

export default {
  registerServiceWorker,
  requestNotificationPermission,
  sendBrowserNotification,
  notifyNewOrder,
  notifyOrderReady,
  notifyOrderAccepted,
  notifyOrderStatusChange
};
