import { useState, useEffect, useRef, useCallback } from 'react';
import { notifyNewOrder, notifyOrderStatusChange, requestNotificationPermission, registerServiceWorker } from './useNotifications';
import { toast } from 'sonner';

/**
 * Custom hook for WebSocket connection with auto-reconnect
 * Provides real-time order updates with browser notifications
 */
export const useWebSocket = (userId, onMessage) => {
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

  // Get WebSocket URL from environment
  const getWsUrl = useCallback(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '');
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
          
          // Send browser notifications AND in-app toasts for important events
          if (data.type === 'order_update') {
            const { event: orderEvent, order, target, message } = data;
            const pulperiaName = order.pulperia_name || 'tu pulpería';
            const items = order.items || [];
            const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            
            // Notification for pulperia owners - new order
            if (orderEvent === 'new_order' && target === 'owner') {
              // Browser notification
              notifyNewOrder(order, pulperiaName);
              // In-app toast as backup
              const itemSummary = items.slice(0, 2).map(i => `${i.quantity}x ${i.product_name}`).join(', ');
              toast.success(`🛒 ¡Nuevo Pedido!`, {
                description: `${order.customer_name}: ${itemSummary} - L${order.total?.toFixed(0)}`,
                duration: 10000
              });
            }
            
            // Notification for customers - status changes
            if (target === 'customer' && ['accepted', 'ready', 'completed'].includes(order.status)) {
              // Browser notification
              notifyOrderStatusChange(order.status, pulperiaName, order);
              // In-app toast as backup
              const statusMessages = {
                accepted: `👨‍🍳 ${pulperiaName} está preparando tu pedido`,
                ready: `✅ ¡Tu orden en ${pulperiaName} está lista!`,
                completed: `🎉 Orden completada en ${pulperiaName}`
              };
              toast.success(statusMessages[order.status] || message, {
                description: `${totalItems} productos • L${order.total?.toFixed(0)}`,
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
  }, [userId, getWsUrl, onMessage]);

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
