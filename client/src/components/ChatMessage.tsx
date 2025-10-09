import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import maxAvatar from "@assets/1211_1759978567238.png";

interface ChatMessageProps {
  id: string;
  message: string;
  sender: "user" | "max";
  timestamp: string;
  username?: string;
}

export default function ChatMessage({ message, sender, timestamp, username }: ChatMessageProps) {
  const isMax = sender === "max";
  
  const celebrationWords = ['great', 'awesome', 'excellent', 'perfect', 'wonderful', 'amazing', 'fantastic', 'congrat', 'success', 'good job', 'well done', 'happy', 'brilliant', 'superb'];
  const hasCelebration = isMax && celebrationWords.some(word => message.toLowerCase().includes(word));

  return (
    <div 
      className={`flex gap-3 ${isMax ? '' : 'flex-row-reverse'} animate-in slide-in-from-bottom-3 fade-in duration-300`}
      data-testid={`message-${sender}`}
    >
      <Avatar className={`h-11 w-11 flex-shrink-0 ${isMax ? 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-sm' : 'ring-2 ring-secondary/30 ring-offset-2 ring-offset-background shadow-sm'}`}>
        {isMax ? (
          <>
            <AvatarImage src={maxAvatar} alt="Max" className="object-cover" />
            <AvatarFallback className="bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-secondary">
            <User className="h-5 w-5 text-white" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`flex flex-col gap-1.5 max-w-[75%] ${isMax ? 'items-start' : 'items-end'}`}>
        <div className="flex items-center gap-2 px-1">
          <span className={`text-sm font-bold ${isMax ? 'text-foreground' : 'text-foreground'}`}>
            {isMax ? 'Max AI' : username || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{timestamp}</span>
        </div>
        
        <div 
          className={`rounded-2xl px-4 py-3 shadow-sm border ${
            isMax 
              ? 'bg-muted border-border text-foreground' 
              : 'bg-secondary border-secondary text-white'
          }`}
        >
          <p className="text-sm font-medium leading-relaxed break-words">{message}</p>
        </div>
      </div>
    </div>
  );
}
