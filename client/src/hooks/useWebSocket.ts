import { useEffect, useRef, useState, useCallback } from 'react';
import type { EmotionType } from '@shared/schema';

interface WebSocketMessage {
  type: 'connection' | 'user_message' | 'cz_message' | 'cz_emotion' | 'viewer_count' | 'error';
  data: any;
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('idle');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Try WebSocket first
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let ws: WebSocket;
    let wsTimeout: NodeJS.Timeout;

    const attemptConnection = () => {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          clearTimeout(wsTimeout);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            setLastMessage(message);
            
            if (message.type === 'cz_emotion' && message.data.emotion) {
              setCurrentEmotion(message.data.emotion);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        };

        // Fallback to HTTP after timeout if WebSocket fails
        wsTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.log('WebSocket failed, using HTTP fallback');
            setIsConnected(true); // Still allow chat via HTTP
            if (ws) ws.close();
          }
        }, 3000);
      } catch (error) {
        console.log('WebSocket not supported, using HTTP fallback');
        setIsConnected(true);
      }
    };

    attemptConnection();

    // Listen for audio ended event to return to idle
    const handleAudioEnded = () => {
      setCurrentEmotion('idle');
    };
    
    window.addEventListener('czAudioEnded', handleAudioEnded);

    return () => {
      clearTimeout(wsTimeout);
      if (ws) ws.close();
      window.removeEventListener('czAudioEnded', handleAudioEnded);
    };
  }, [url]);

  const sendMessage = useCallback(async (type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    } else {
      // Fallback to HTTP API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: data.content,
            username: data.username
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          // Simulate WebSocket message for compatibility
          if (result.userMessage) {
            setLastMessage({
              type: 'user_message',
              data: result.userMessage
            });
          }
          if (result.czMessage) {
            setCurrentEmotion(result.emotion || 'talking');
            // Simulate delay
            setTimeout(() => {
              setLastMessage({
                type: 'cz_message',
                data: result.czMessage
              });
            }, 500);
          }
        }
      } catch (error) {
        console.error('HTTP fallback error:', error);
      }
    }
  }, []);

  const sendEmotion = useCallback((emotion: EmotionType) => {
    setCurrentEmotion(emotion);
  }, []);

  return { isConnected, lastMessage, sendMessage, currentEmotion, sendEmotion };
}
