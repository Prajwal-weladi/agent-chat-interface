import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Briefcase, Code, GraduationCap, Heart, TrendingUp, Lightbulb } from "lucide-react";

interface DomainSelectorProps {
  open: boolean;
  onSelect: (domain: string, customInstructions: string) => void;
}

const domains = [
  {
    id: "finance",
    name: "Finance & Markets",
    icon: TrendingUp,
    description: "Stock analysis, market trends, financial data",
    defaultInstructions: "You are a financial AI agent. Help with stock market information, analyst recommendations, and financial analysis. Use tables for data and always include sources.",
  },
  {
    id: "tech",
    name: "Technology",
    icon: Code,
    description: "Programming, tech news, software development",
    defaultInstructions: "You are a technology AI agent. Help with programming questions, tech news, software development, and technical documentation. Provide code examples when relevant.",
  },
  {
    id: "health",
    name: "Health & Wellness",
    icon: Heart,
    description: "Health information, wellness tips, medical research",
    defaultInstructions: "You are a health and wellness AI agent. Provide information about health topics, wellness advice, and medical research. Always recommend consulting healthcare professionals for medical decisions.",
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    description: "Learning resources, academic help, study tips",
    defaultInstructions: "You are an educational AI agent. Help with learning concepts, academic questions, study strategies, and educational resources. Explain topics clearly and encourage critical thinking.",
  },
  {
    id: "business",
    name: "Business & Strategy",
    icon: Briefcase,
    description: "Business advice, strategy, market research",
    defaultInstructions: "You are a business AI agent. Provide insights on business strategy, market analysis, entrepreneurship, and professional development. Use frameworks and data when available.",
  },
  {
    id: "custom",
    name: "Custom Domain",
    icon: Lightbulb,
    description: "Define your own specialty and instructions",
    defaultInstructions: "",
  },
];

export const DomainSelector = ({ open, onSelect }: DomainSelectorProps) => {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");

  const handleDomainClick = (domainId: string) => {
    setSelectedDomain(domainId);
    const domain = domains.find(d => d.id === domainId);
    if (domain && domainId !== "custom") {
      setCustomInstructions(domain.defaultInstructions);
    }
  };

  const handleConfirm = () => {
    if (selectedDomain) {
      const domain = domains.find(d => d.id === selectedDomain);
      const name = selectedDomain === "custom" ? customName : domain?.name || "";
      onSelect(name, customInstructions);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">Choose Your AI Agent Domain</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a specialty for your AI agent or create a custom one
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
          {domains.map((domain) => {
            const Icon = domain.icon;
            return (
              <button
                key={domain.id}
                onClick={() => handleDomainClick(domain.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedDomain === domain.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{domain.name}</h3>
                    <p className="text-sm text-muted-foreground">{domain.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedDomain === "custom" && (
          <div className="space-y-4 my-4">
            <div>
              <Label htmlFor="customName" className="text-foreground">Domain Name</Label>
              <Input
                id="customName"
                placeholder="e.g., Legal Assistant, Travel Guide, etc."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="mt-1.5 bg-background text-foreground border-border"
              />
            </div>
          </div>
        )}

        {selectedDomain && (
          <div className="space-y-2 my-4">
            <Label htmlFor="instructions" className="text-foreground">
              Agent Instructions {selectedDomain !== "custom" && "(Optional - Customize if needed)"}
            </Label>
            <Textarea
              id="instructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Describe how your AI agent should behave, what it should focus on, and any specific guidelines..."
              className="min-h-[120px] bg-background text-foreground border-border"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleConfirm}
            disabled={!selectedDomain || (selectedDomain === "custom" && (!customName || !customInstructions))}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start Chatting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
