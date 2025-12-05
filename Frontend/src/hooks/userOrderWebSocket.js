// frontend/src/hooks/useOrderWebSocket.js

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

export const useOrderWebSocket = (onNewOrder, onStatusChange, onOrderCancelled) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const pingInterval = useRef(null);
  
  // Use refs to avoid stale closures
  const callbacksRef = useRef({ onNewOrder, onStatusChange, onOrderCancelled });
  
  useEffect(() => {
    callbacksRef.current = { onNewOrder, onStatusChange, onOrderCancelled };
  }, [onNewOrder, onStatusChange, onOrderCancelled]);

  const connect = useCallback(() => {
    try {
      console.log('🔌 Connecting to WebSocket:', WS_URL);
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
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
          console.log('📩 WebSocket message:', message);

          switch (message.type) {
            case 'CONNECTED':
              console.log('🎉', message.message);
              break;

            case 'NEW_ORDER':
              console.log('🆕 New order received:', message.data);
              if (callbacksRef.current.onNewOrder) {
                callbacksRef.current.onNewOrder(message.data);
              }
              // Show browser notification
              showNotification('New Order!', `Table ${message.data.TableNumber}`);
              // Play sound
              playSound();
              break;

            case 'ORDER_STATUS_CHANGED':
              console.log('🔄 Order status changed:', message.data);
              if (callbacksRef.current.onStatusChange) {
                callbacksRef.current.onStatusChange(message.data.orderId, message.data.newStatus);
              }
              break;

            case 'ORDER_CANCELLED':
              console.log('❌ Order cancelled:', message.data);
              if (callbacksRef.current.onOrderCancelled) {
                callbacksRef.current.onOrderCancelled(message.data.orderId);
              }
              break;

            case 'PONG':
              // Keepalive response
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);

        // Clear ping interval
        if (pingInterval.current) {
          clearInterval(pingInterval.current);
        }

        // Attempt reconnect after 5 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 5000);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError(error.message);
    }
  }, []); // No dependencies to prevent infinite reconnects

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []); // Empty dependency array - connect only on mount

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