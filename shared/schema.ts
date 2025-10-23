import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const emotionSchema = z.enum(['celebrating', 'thinking', 'talking', 'angry', 'idle', 'crazy_dance', 'confused']);
export type EmotionType = z.infer<typeof emotionSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  message: z.string().min(1).max(2000),
  sender: z.enum(["user", "cz"]),
  username: z.string().optional(),
  timestamp: z.string(),
  emotion: emotionSchema.optional(),
  audioBase64: z.string().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const insertChatMessageSchema = chatMessageSchema.omit({ id: true, timestamp: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
