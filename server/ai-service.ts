import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeEmotion } from "./emotion-analyzer";
import type { EmotionType } from "@shared/schema";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

export interface AIResponse {
  message: string;
  emotion: EmotionType;
  audioBase64?: string;
}

export async function generateAIResponse(userMessage: string): Promise<AIResponse> {
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
            content: userMessage
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      const responseMessage = completion.choices[0]?.message?.content || "哎呀！看起来我的响应电路有点忙。你能再试一次吗？";
      const emotion = analyzeEmotion(responseMessage);
      const audioBase64 = await generateTextToSpeech(responseMessage);
      return { message: responseMessage, emotion, audioBase64 };
    } catch (error) {
      console.error("OpenAI error, trying Anthropic fallback:", error);
      // Fall through to try Anthropic
    }
  }
  
  // Try Anthropic as fallback or if OpenAI is not configured
  if (anthropic) {
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
            content: userMessage
          }
        ],
      });

      const textContent = message.content.find(block => block.type === 'text');
      const responseMessage = textContent && 'text' in textContent ? textContent.text : "哎呀！看起来我的响应电路有点忙。你能再试一次吗？";
      const emotion = analyzeEmotion(responseMessage);
      const audioBase64 = await generateTextToSpeech(responseMessage);
      return { message: responseMessage, emotion, audioBase64 };
    } catch (error) {
      console.error("Anthropic error:", error);
      const errorMessage = "哎呀！处理时出现了一个小错误。你能再试一次吗？";
      return { message: errorMessage, emotion: 'talking' };
    }
  }

  // No AI service available
  const errorMessage = "你好！看起来我没有配置AI凭据。请确保在Replit Secrets中有OPENAI_API_KEY或ANTHROPIC_API_KEY。";
  return { message: errorMessage, emotion: 'talking' };
}

export async function generateTextToSpeech(text: string): Promise<string | undefined> {
  if (!openai) {
    console.log('OpenAI not configured, skipping TTS');
    return undefined;
  }

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "echo",
      input: text,
      speed: 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const base64Audio = buffer.toString('base64');
    return base64Audio;
  } catch (error) {
    console.error('Error generating TTS:', error);
    return undefined;
  }
}
