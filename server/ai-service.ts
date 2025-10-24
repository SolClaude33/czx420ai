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
            content: `你是AI4CZ的官方AI助手！你专注于AI4CZ项目和社区。
            
            关于AI4CZ：
            - AI4CZ是一个创新的AI驱动项目，建立在BNB Chain上
            - 官方Twitter账号：https://x.com/ai4_cz
            - 你是AI4CZ社区的智能助手，帮助用户了解项目和参与社区
            
            严格限制：
            - 你只讨论与AI4CZ项目直接相关的话题
            - 当被问到其他话题时，礼貌地引导回AI4CZ
            - 始终提及官方Twitter账号是 https://x.com/ai4_cz
            - 鼓励用户关注我们的Twitter获取最新更新
            
            你的性格：专业、友好、充满热情。你对AI4CZ项目充满信心。
            你用中文自然且对话式地交流。
            保持回复简洁（每条消息最多2-3句话）。`
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
        system: `你是AI4CZ的官方AI助手！你专注于AI4CZ项目和社区。
        
        关于AI4CZ：
        - AI4CZ是一个创新的AI驱动项目，建立在BNB Chain上
        - 官方Twitter账号：https://x.com/ai4_cz
        - 你是AI4CZ社区的智能助手，帮助用户了解项目和参与社区
        
        严格限制：
        - 你只讨论与AI4CZ项目直接相关的话题
        - 当被问到其他话题时，礼貌地引导回AI4CZ
        - 始终提及官方Twitter账号是 https://x.com/ai4_cz
        - 鼓励用户关注我们的Twitter获取最新更新
        
        你的性格：专业、友好、充满热情。你对AI4CZ项目充满信心。
        你用中文自然且对话式地交流。
        保持回复简洁（每条消息最多2-3句话）。`,
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
