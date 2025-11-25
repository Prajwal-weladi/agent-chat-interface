import { Bot, User, Volume2, VolumeX, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  fileUrl?: string;
  fileName?: string;
}

export const ChatMessage = ({ role, content, isStreaming, fileUrl, fileName }: ChatMessageProps) => {
  const isUser = role === "user";
  const { isSpeaking, speak, stop, isSupported } = useSpeechSynthesis();
  const [isPlayingThis, setIsPlayingThis] = useState(false);

  const handleSpeak = () => {
    if (isPlayingThis) {
      stop();
      setIsPlayingThis(false);
    } else {
      speak(content);
      setIsPlayingThis(true);
      setTimeout(() => setIsPlayingThis(false), content.length * 50);
    }
  };

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
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm text-foreground">
            {isUser ? "You" : "AI Agent"}
          </div>
          {!isUser && isSupported && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeak}
              className="h-8"
            >
              {isPlayingThis ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
        {fileUrl && fileName && (
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors w-fit"
          >
            <FileText className="h-4 w-4" />
            <span>{fileName}</span>
          </a>
        )}
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
