// frontend/src/hooks/useOrderWebSocket.js

import { useEffect, useRef, useState, useCallback } from 'react';

// Determine WebSocket URL based on environment
const getWSUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  
  // Development: connect to order-service directly on port 3001
  if (import.meta.env.DEV) {
    return 'ws://localhost:3001/ws';
  }
  
  // Production: use same host as frontend
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

const WS_URL = getWSUrl();

export const useOrderWebSocket = (onNewOrder, onStatusChange, onOrderCancelled) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const pingInterval = useRef(null);
  const isConnecting = useRef(false); // Prevent multiple connect attempts
  
  // Use refs to avoid stale closures
  const callbacksRef = useRef({ onNewOrder, onStatusChange, onOrderCancelled });
  
  useEffect(() => {
    callbacksRef.current = { onNewOrder, onStatusChange, onOrderCancelled };
  }, [onNewOrder, onStatusChange, onOrderCancelled]);

  const connect = useCallback(() => {
    // Prevent duplicate connection attempts
    if (isConnecting.current || (ws.current && ws.current.readyState === WebSocket.OPEN)) {
      console.log('⚠️ Connection already in progress or established');
      return;
    }

    isConnecting.current = true;

    try {
      console.log('🔌 Connecting to WebSocket:', WS_URL);
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        isConnecting.current = false;
        setIsConnected(true);
        setError(null);

        // Start ping/pong for keepalive
        pingInterval.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'PING' }));
          }
        }, 30000); // Ping every 30 seconds
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📩 WebSocket message:', message.type);

          switch (message.type) {
            case 'CONNECTED':
              console.log('🎉', message.message);
              break;

            case 'NEW_ORDER':
              console.log('🆕 New order received:', message.data?.OrderID);
              if (callbacksRef.current.onNewOrder) {
                callbacksRef.current.onNewOrder(message.data);
              }
              showNotification('New Order!', `Table ${message.data?.TableNumber}`);
              playSound();
              break;

            case 'ORDER_STATUS_CHANGED':
              console.log('🔄 Order status changed:', message.data?.orderId);
              if (callbacksRef.current.onStatusChange) {
                callbacksRef.current.onStatusChange(message.data.orderId, message.data.newStatus);
              }
              break;

            case 'ORDER_CANCELLED':
              console.log('❌ Order cancelled:', message.data?.orderId);
              if (callbacksRef.current.onOrderCancelled) {
                callbacksRef.current.onOrderCancelled(message.data.orderId);
              }
              break;

            case 'PONG':
              // Keepalive response - silent
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (event) => {
        console.error('❌ WebSocket error:', event?.type || 'unknown error');
        isConnecting.current = false;
        setError('Failed to connect to WebSocket');
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        isConnecting.current = false;
        setIsConnected(false);

        // Clear intervals
        if (pingInterval.current) {
          clearInterval(pingInterval.current);
          pingInterval.current = null;
        }

        // Attempt reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      isConnecting.current = false;
      setError(error.message);
    }
  }, []); // No dependencies to prevent infinite reconnects

  useEffect(() => {
    // Only connect once on mount
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
        pingInterval.current = null;
      }
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      isConnecting.current = false;
    };
  }, []); // Empty dependency array - connect only on mount/unmount

  return { isConnected, error };
};

// Helper function: Show browser notification
function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/badge.png'
    });
  }
}

// Helper function: Play notification sound
function playSound() {
  const audio = new Audio('/notification.mp3');
  audio.play().catch(err => console.log('Could not play sound:', err));
}