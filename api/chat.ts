import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAIResponse } from '../server/ai-service';

// In-memory storage for rate limiting
const userLastMessageTime = new Map<string, number>();
const MESSAGE_COOLDOWN_MS = 5000;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const userMessage = {
      id: (Date.now() - 1).toString(),
      message: content,
      sender: 'user',
      username: username || 'Anonymous',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    res.json({
      success: true,
      userMessage,
      czMessage,
      emotion: aiResponse.emotion
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
}
