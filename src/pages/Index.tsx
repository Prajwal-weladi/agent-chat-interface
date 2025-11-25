import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { DomainSelector } from "@/components/DomainSelector";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Trash2, Bot, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  const [domainSelected, setDomainSelected] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [agentInstructions, setAgentInstructions] = useState("");
  
  const { messages, isLoading, sendMessage, clearMessages } = useChat(agentInstructions);

  const handleDomainSelect = (domain: string, instructions: string) => {
    setDomainName(domain);
    setAgentInstructions(instructions);
    setDomainSelected(true);
  };

  const handleReset = () => {
    setDomainSelected(false);
    setDomainName("");
    setAgentInstructions("");
    clearMessages();
  };

  const exampleQueries = [
    "Help me understand this topic in detail",
    "What are the latest developments?",
    "Can you analyze this for me?",
    "Give me a comprehensive overview",
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <DomainSelector
        open={!domainSelected}
        onSelect={handleDomainSelect}
      />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {domainName || "AI"} Agent
              </h1>
              <p className="text-sm text-muted-foreground">
                Powered by Web Search & AI Analysis
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearMessages}
                disabled={isLoading}
                className="bg-background text-foreground border-border hover:bg-muted"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
              className="bg-background text-foreground border-border hover:bg-muted"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Change Domain
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 container mx-auto px-4 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8 text-center">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Bot className="w-16 h-16 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Welcome to Your {domainName} Agent
                </h2>
                <p className="text-lg text-muted-foreground">
                  Ask me anything and I'll help you with comprehensive research and analysis
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Try asking:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exampleQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto py-3 px-4 bg-card text-card-foreground border-border hover:bg-muted hover:border-primary/50"
                      onClick={() => sendMessage(query)}
                      disabled={isLoading}
                    >
                      <span className="text-sm">{query}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 py-6">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  isStreaming={
                    index === messages.length - 1 &&
                    message.role === "assistant" &&
                    isLoading
                  }
                  fileUrl={message.fileUrl}
                  fileName={message.fileName}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="py-6 border-t border-border bg-background">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
