import { useState, useEffect, useRef, useCallback } from 'react';
import { requestNotificationPermission, registerServiceWorker, sendBrowserNotification } from './useNotifications';
import { toast } from 'sonner';

/**
 * Custom hook for WebSocket connection with auto-reconnect
 * Provides real-time order updates with browser notifications
 */
export const useWebSocket = (userId, onMessage, floatingNotifications = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const connectRef = useRef(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  // Request notification permission and register service worker on mount
  useEffect(() => {
    const initNotifications = async () => {
      await registerServiceWorker();
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        console.log('Notification permission not granted, will use in-app notifications');
      }
    };
    initNotifications();
  }, []);

  // Get WebSocket URL - siempre usar el backend de Emergent
  const getWsUrl = useCallback(() => {
    // URL fija del backend
    const backendUrl = 'https://lapulperia.preview.emergentagent.com';
    const wsProtocol = 'wss';
    const wsHost = backendUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${wsHost}/ws/orders/${userId}`;
  }, [userId]);

  const connect = useCallback(() => {
    if (!userId) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWsUrl();
      console.log('WebSocket connecting to:', wsUrl);
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected for user:', userId);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle ping/pong silently
          if (data.type === 'pong' || data.type === 'ping') {
            if (data.type === 'ping') {
              socket.send(JSON.stringify({ type: 'pong' }));
            }
            return;
          }
          
          console.log('WebSocket message received:', data.type, data.event);
          
          // Send notifications for important events
          if (data.type === 'order_update') {
            const { event: orderEvent, order, target, message } = data;
            const pulperiaName = order.pulperia_name || 'tu pulpería';
            const items = order.items || [];
            const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            
            // Notification for pulperia owners - new order
            if (orderEvent === 'new_order' && target === 'owner') {
              const itemSummary = items.slice(0, 2).map(i => `${i.quantity}x ${i.product_name}`).join(', ');
              
              // Browser notification
              sendBrowserNotification(`🛒 ¡Nuevo Pedido en ${pulperiaName}!`, {
                body: `${order.customer_name}: ${itemSummary}\nTotal: L${order.total?.toFixed(0)}`,
                tag: 'new-order',
                renotify: true
              });
              
              // Floating notification (if available)
              if (floatingNotifications?.notifyNewOrder) {
                floatingNotifications.notifyNewOrder(order, pulperiaName);
              }
              
              // Toast as additional backup
              toast.success(`🛒 ¡Nuevo Pedido!`, {
                description: `${order.customer_name}: ${itemSummary} - L${order.total?.toFixed(0)}`,
                duration: 10000
              });
            }
            
            // Notification for customers - status changes
            if (target === 'customer' && ['accepted', 'ready', 'completed'].includes(order.status)) {
              const statusMessages = {
                accepted: { title: '👨‍🍳 Preparando tu orden', body: `${pulperiaName} está preparando tu pedido` },
                ready: { title: '✅ ¡Tu orden está lista!', body: `Pasa a recoger en ${pulperiaName}` },
                completed: { title: '🎉 Orden completada', body: `Gracias por tu compra en ${pulperiaName}` }
              };
              
              const msg = statusMessages[order.status];
              
              // Browser notification
              sendBrowserNotification(msg.title, {
                body: `${msg.body}\n${totalItems} productos • L${order.total?.toFixed(0)}`,
                tag: `order-${order.status}`,
                renotify: true
              });
              
              // Floating notification (if available)
              if (floatingNotifications?.notifyOrderStatusChange) {
                floatingNotifications.notifyOrderStatusChange(order.status, pulperiaName, order);
              }
              
              // Toast
              toast.success(msg.title, {
                description: `${msg.body} • ${totalItems} productos`,
                duration: 8000
              });
            }
          }
          
          // Pass to callback
          if (onMessage) {
            onMessage(data);
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current - 1), 15000);
          console.log(`WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (connectRef.current) {
              connectRef.current();
            }
          }, delay);
        }
      };

      wsRef.current = socket;
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  }, [userId, getWsUrl, onMessage, floatingNotifications]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (userId) {
      const timeout = setTimeout(() => {
        connect();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [userId, connect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};

export default useWebSocket;
