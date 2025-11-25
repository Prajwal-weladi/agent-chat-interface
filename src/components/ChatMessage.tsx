import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 p-6 rounded-lg border",
        isUser 
          ? "bg-muted border-border" 
          : "bg-card border-border"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border",
          isUser 
            ? "bg-primary text-primary-foreground border-primary" 
            : "bg-accent text-accent-foreground border-accent"
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="font-semibold text-sm text-foreground">
          {isUser ? "You" : "AI Agent"}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground">
          <ReactMarkdown
            components={{
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse border border-border" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="border border-border bg-muted px-4 py-2 text-left font-semibold text-foreground" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-border px-4 py-2 text-foreground" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse-glow" />
          )}
        </div>
      </div>
    </div>
  );
};
