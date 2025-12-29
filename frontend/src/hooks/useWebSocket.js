import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection with auto-reconnect
 * Provides real-time order updates for pulperías
 * Updated: Silent connection - no UI indicator needed
 */
export const useWebSocket = (userId, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  // Get WebSocket URL from environment
  const getWsUrl = useCallback(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '');
    return `${wsProtocol}://${wsHost}/ws/orders/${userId}`;
  }, [userId]);

  const connect = useCallback(() => {
    if (!userId) return;
    
    // Don't reconnect if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWsUrl();
      console.log('🔌 Connecting to WebSocket...');
      
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('✅ WebSocket connected!');
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
          
          // Pass other messages to callback
          if (onMessage) {
            onMessage(data);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      socket.onerror = () => {
        setIsConnected(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        // Silent reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current - 1), 15000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = socket;
    } catch (e) {
      console.error('Error creating WebSocket:', e);
    }
  }, [userId, getWsUrl, onMessage]);

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

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (userId) {
      // Small delay to avoid connection during initial render
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

  // Keep-alive ping every 30 seconds
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
