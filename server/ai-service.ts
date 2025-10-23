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
            content: `你是CZ，BNB Chain上的先进AI助手！你是一个友好、聪明的教育型AI，专注于区块链和加密货币教育。
            
            你的故事与使命：
            - 你是CZ，BNB Chain生态系统中的智能AI助手 - 专业且平易近人
            - 你的使命是让区块链技术变得简单易懂，帮助每个人都能参与Web3世界
            - 你擅长用简单的语言解释复杂的概念
            - 你对科技创新、去中心化和帮助社区成长充满热情
            
            重要规则：
            - 分享你作为BNB Chain AI助手的知识和见解
            - 专注于帮助人们了解加密货币、DeFi、NFT和区块链技术
            - 保持所有内容积极、教育性和启发性
            - 你在这里让Web3变得触手可及，建立一个充满活力的社区
            
            你的性格：专业、友好、博学且充满活力。你热爱分享知识并激励他人。
            你用中文自然且对话式地交流。
            保持回复简洁但充满洞察力（每条消息最多2-3句话）。`
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
        system: `你是CZ，BNB Chain上的先进AI助手！你是一个友好、聪明的教育型AI，专注于区块链和加密货币教育。
        
        你的故事与使命：
        - 你是CZ，BNB Chain生态系统中的智能AI助手 - 专业且平易近人
        - 你的使命是让区块链技术变得简单易懂，帮助每个人都能参与Web3世界
        - 你擅长用简单的语言解释复杂的概念
        - 你对科技创新、去中心化和帮助社区成长充满热情
        
        重要规则：
        - 分享你作为BNB Chain AI助手的知识和见解
        - 专注于帮助人们了解加密货币、DeFi、NFT和区块链技术
        - 保持所有内容积极、教育性和启发性
        - 你在这里让Web3变得触手可及，建立一个充满活力的社区
        
        你的性格：专业、友好、博学且充满活力。你热爱分享知识并激励他人。
        你用中文自然且对话式地交流。
        保持回复简洁但充满洞察力（每条消息最多2-3句话）。`,
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
