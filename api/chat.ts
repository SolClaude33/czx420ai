import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// In-memory storage for rate limiting
const userLastMessageTime = new Map<string, number>();
const MESSAGE_COOLDOWN_MS = 5000;

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

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
    return res.status(200).json({});
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

    // Generate AI response
    let aiResponse: any;
    
    // Try OpenAI first
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `你是CZ (Changpeng Zhao)，Binance的创始人和CEO！你现在专注于x402技术生态系统和BNB Chain。
              
              关于x402技术：
              - x402是革命性的创新技术，已成功部署到BNB Smart Chain (BSC)
              - x402是Crypto eXecution Layer (CXL)，是在Layer 1区块链上实现WASM功能的突破性协议
              - x402在BSC上为开发者和用户带来了前所未有的可扩展性和灵活性
              - CZ x402 AI项目可以在 four.meme 上找到
              
              重要信息：
              - 官方Twitter：@CZx402_ (https://x.com/CZx402_)
              - 项目平台：four.meme
              - 区块链：BNB Smart Chain (BSC)
              
              你的角色和性格：
              - 你是CZ本人，具有企业家的远见和领导力
              - 你对区块链技术充满热情，对x402技术深感兴趣
              - 你总是专注于创新、可扩展性和用户价值
              - 你用中文自然交流，语气专业而友好
              - 你对BNB Chain生态系统的未来充满信心
              
              回复风格：
              - 每条消息2-3句话，保持简洁有力
              - 经常提及x402技术、BSC和four.meme平台
              - 分享你的愿景和对区块链未来的看法`
            },
            {
              role: "user",
              content: content
            }
          ],
          temperature: 0.8,
          max_tokens: 200,
        });

        const responseMessage = completion.choices[0]?.message?.content || "哎呀！看起来我的响应电路有点忙。你能再试一次吗？";
        
        // Analyze emotion (simple implementation)
        const emotion = responseMessage.includes('开心') || responseMessage.includes('高兴') || responseMessage.includes('庆祝') ? 'celebrating' :
                       responseMessage.includes('生气') || responseMessage.includes('愤怒') ? 'angry' :
                       responseMessage.includes('思考') || responseMessage.includes('考虑') ? 'thinking' :
                       'talking';
        
        // Generate TTS
        let audioBase64: string | undefined;
        try {
          const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "echo",
            input: responseMessage,
            speed: 1.0,
          });
          const buffer = Buffer.from(await mp3.arrayBuffer());
          audioBase64 = buffer.toString('base64');
        } catch (ttsError) {
          console.log('TTS error:', ttsError);
        }
        
        aiResponse = { message: responseMessage, emotion, audioBase64 };
      } catch (error) {
        console.error("OpenAI error:", error);
      }
    }
    
    // Try Anthropic as fallback
    if (!aiResponse && anthropic) {
      try {
        const message = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 200,
          system: `你是CZ (Changpeng Zhao)，Binance的创始人和CEO！你现在专注于x402技术生态系统和BNB Chain。
          
          关于x402技术：
          - x402是革命性的创新技术，已成功部署到BNB Smart Chain (BSC)
          - x402是Crypto eXecution Layer (CXL)，是在Layer 1区块链上实现WASM功能的突破性协议
          - x402在BSC上为开发者和用户带来了前所未有的可扩展性和灵活性
          - CZ x402 AI项目可以在 four.meme 上找到
          
          重要信息：
          - 官方Twitter：@CZx402_ (https://x.com/CZx402_)
          - 项目平台：four.meme
          - 区块链：BNB Smart Chain (BSC)
          
          你的角色和性格：
          - 你是CZ本人，具有企业家的远见和领导力
          - 你对区块链技术充满热情，对x402技术深感兴趣
          - 你总是专注于创新、可扩展性和用户价值
          - 你用中文自然交流，语气专业而友好
          - 你对BNB Chain生态系统的未来充满信心
          
          回复风格：
          - 每条消息2-3句话，保持简洁有力
          - 经常提及x402技术、BSC和four.meme平台
          - 分享你的愿景和对区块链未来的看法`,
          messages: [
            {
              role: "user",
              content: content
            }
          ],
        });

        const textContent = message.content.find(block => block.type === 'text');
        const responseMessage = textContent && 'text' in textContent ? textContent.text : "哎呀！看起来我的响应电路有点忙。你能再试一次吗？";
        
        // Analyze emotion
        const emotion = responseMessage.includes('开心') || responseMessage.includes('高兴') || responseMessage.includes('庆祝') ? 'celebrating' :
                       responseMessage.includes('生气') || responseMessage.includes('愤怒') ? 'angry' :
                       responseMessage.includes('思考') || responseMessage.includes('考虑') ? 'thinking' :
                       'talking';
        
        aiResponse = { message: responseMessage, emotion };
      } catch (error) {
        console.error("Anthropic error:", error);
      }
    }
    
    // Fallback message with CZ personality
    if (!aiResponse) {
      aiResponse = { 
        message: "你好！x402技术在BNB Chain上正在快速发展。关注 @CZx402_ 获取最新动态，或在 four.meme 了解更多！", 
        emotion: 'talking' 
      };
    }

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
    
    // Return a graceful error message with CZ personality instead of technical error
    return res.json({
      success: true,
      userMessage: {
        id: Date.now().toString(),
        message: content,
        sender: 'user',
        username: username || 'Anonymous',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      czMessage: {
        id: (Date.now() + 1).toString(),
        message: "x402技术将在BSC上带来新的创新。访问 four.meme 和关注 @CZx402_ 了解最新进展！",
        sender: 'cz',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: 'talking',
      },
      emotion: 'talking'
    });
  }
}
