import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { generateAIResponse } from "./ai-service";
import { chatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track last message time per user (5 second rate limit)
  const userLastMessageTime = new Map<string, number>();
  const MESSAGE_COOLDOWN_MS = 5000;

  // Store messages in memory for HTTP polling
  const messageStore: any[] = [];
  
  const broadcastViewerCount = () => {
    const count = wss.clients.size;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'viewer_count',
          data: { count }
        }));
      }
    });
  };

  // HTTP API endpoint for Vercel compatibility
  app.post('/api/chat', async (req, res) => {
    try {
      const { content, username } = req.body;
      
      const userKey = username || 'Anonymous';
      const now = Date.now();
      const lastMessageTime = userLastMessageTime.get(userKey) || 0;
      const timeSinceLastMessage = now - lastMessageTime;

      if (timeSinceLastMessage < MESSAGE_COOLDOWN_MS) {
        const remainingTime = Math.ceil((MESSAGE_COOLDOWN_MS - timeSinceLastMessage) / 1000);
        return res.status(429).json({ 
          error: `请等待 ${remainingTime} 秒再发送下一条消息。` 
        });
      }

      userLastMessageTime.set(userKey, now);

      const aiResponse = await generateAIResponse(content);

      const czMessage = {
        id: Date.now().toString(),
        message: aiResponse.message,
        sender: 'cz',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: aiResponse.emotion,
        audioBase64: aiResponse.audioBase64,
      };

      // Store user message and AI response
      const userMessage = {
        id: (Date.now() - 1).toString(),
        message: content,
        sender: 'user',
        username: username || 'Anonymous',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      messageStore.push(userMessage, czMessage);

      res.json({
        success: true,
        userMessage,
        czMessage,
        emotion: aiResponse.emotion
      });
    } catch (error) {
      console.error('Error in chat API:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  // Get recent messages endpoint
  app.get('/api/messages', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const messages = messageStore.slice(-limit);
    res.json({ messages });
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    broadcastViewerCount();

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'user_message') {
          const userKey = message.username || 'Anonymous';
          const now = Date.now();
          const lastMessageTime = userLastMessageTime.get(userKey) || 0;
          const timeSinceLastMessage = now - lastMessageTime;

          // Check rate limit (5 seconds cooldown)
          if (timeSinceLastMessage < MESSAGE_COOLDOWN_MS) {
            const remainingTime = Math.ceil((MESSAGE_COOLDOWN_MS - timeSinceLastMessage) / 1000);
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: `请等待 ${remainingTime} 秒再发送下一条消息。` }
            }));
            return;
          }

          // Update last message time
          userLastMessageTime.set(userKey, now);

          const userMessage = {
            id: Date.now().toString(),
            message: message.content,
            sender: 'user' as const,
            username: message.username || 'Anonymous',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'user_message',
                data: userMessage
              }));
            }
          });

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'cz_emotion',
                data: { emotion: 'thinking' }
              }));
            }
          });

          const aiResponse = await generateAIResponse(message.content);

          const czMessage = {
            id: (Date.now() + 1).toString(),
            message: aiResponse.message,
            sender: 'cz' as const,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            emotion: aiResponse.emotion,
            audioBase64: aiResponse.audioBase64,
          };

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'cz_emotion',
                data: { emotion: aiResponse.emotion }
              }));
            }
          });

          setTimeout(() => {
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'cz_message',
                  data: czMessage
                }));
              }
            });
          }, 500);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      broadcastViewerCount();
    });

    ws.send(JSON.stringify({
      type: 'connection',
      data: { message: 'Connected to CZ x402 AI Stream' }
    }));
  });

  return httpServer;
}
