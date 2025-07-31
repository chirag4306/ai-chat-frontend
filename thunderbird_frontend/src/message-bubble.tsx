import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Check, CheckCheck, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex items-center justify-end mt-1 space-x-2">
            <span className="text-xs text-slate-400">{formatTime(message.createdAt)}</span>
            <CheckCheck className="w-3 h-3 text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="text-slate-600 w-4 h-4" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-900 whitespace-pre-wrap m-0">{message.content}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-start mt-1 ml-11 space-x-2">
          <span className="text-xs text-slate-400">{formatTime(message.createdAt)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-auto p-0 text-xs text-slate-400 hover:text-slate-600"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
