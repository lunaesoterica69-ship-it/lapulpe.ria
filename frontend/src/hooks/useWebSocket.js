import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection with auto-reconnect
 * Provides real-time order updates for pulperías
 */
export const useWebSocket = (userId, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 10;
  const RECONNECT_DELAY = 2000;

  // Get WebSocket URL from environment
  const getWsUrl = useCallback(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    // Convert HTTP URL to WebSocket URL
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
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('✅ WebSocket connected!');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          
          // Handle pong (keep-alive response)
          if (data.type === 'pong') {
            console.log('🏓 Pong received');
            return;
          }
          
          // Handle ping from server
          if (data.type === 'ping') {
            socket.send(JSON.stringify({ type: 'pong' }));
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

      socket.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        setConnectionError('Error de conexión');
        setIsConnected(false);
      };

      socket.onclose = (event) => {
        console.log('🔌 WebSocket disconnected. Code:', event.code);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current - 1), 30000);
          
          console.log(`🔄 Reconnecting in ${delay/1000}s... (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setConnectionError('No se pudo reconectar. Recarga la página.');
        }
      };

      wsRef.current = socket;
    } catch (e) {
      console.error('Error creating WebSocket:', e);
      setConnectionError(e.message);
    }
  }, [userId, getWsUrl, onMessage]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('⚠️ WebSocket not connected, cannot send message');
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
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

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
    connectionError,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};

export default useWebSocket;
