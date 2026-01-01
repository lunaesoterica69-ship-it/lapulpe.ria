import { useState, useEffect, useRef, useCallback } from 'react';
import { notifyNewOrder, notifyOrderStatusChange, requestNotificationPermission, registerServiceWorker } from './useNotifications';

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
      await requestNotificationPermission();
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
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
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
          
          // Send browser notifications for important events
          if (data.type === 'order_update') {
            const { event: orderEvent, order, target } = data;
            const pulperiaName = order.pulperia_name || 'tu pulpería';
            
            // Notification for pulperia owners - new order
            if (orderEvent === 'new_order' && target === 'owner') {
              notifyNewOrder(order, pulperiaName);
            }
            
            // Notification for customers - status changes
            if (target === 'customer' && ['accepted', 'ready', 'completed'].includes(order.status)) {
              notifyOrderStatusChange(order.status, pulperiaName, order);
            }
          }
          
          // Pass to callback
          if (onMessage) {
            onMessage(data);
          }
        } catch (e) {
          /* Ignore parse errors */
        }
      };

      socket.onerror = () => {
        setIsConnected(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current - 1), 15000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (connectRef.current) {
              connectRef.current();
            }
          }, delay);
        }
      };

      wsRef.current = socket;
    } catch (e) {
      /* Ignore connection errors */
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
