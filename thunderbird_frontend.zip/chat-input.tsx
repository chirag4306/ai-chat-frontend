import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, Mic, Lightbulb, Code, PenTool, BarChart3 } from "lucide-react";
import type { Conversation } from "@shared/schema";

interface ChatInputProps {
  conversationId?: string;
  onNewConversation: (id: string) => void;
}

export function ChatInput({ conversationId, onNewConversation }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/conversations', {
        title: 'New Conversation'
      });
      return response.json();
    },
    onSuccess: (newConversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      onNewConversation(newConversation.id);
      return newConversation.id;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        content,
        role: 'user'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      }
      setIsTyping(false);
    },
    onError: (error: any) => {
      setIsTyping(false);
      
      // Extract meaningful error message
      let errorMessage = "Failed to send message. Please try again.";
      
      if (error?.message?.includes("quota")) {
        errorMessage = "OpenAI API quota exceeded. Please check your billing at platform.openai.com";
      } else if (error?.message?.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error?.message?.includes("invalid_api_key")) {
        errorMessage = "Invalid API key. Please check your OpenAI configuration.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    const messageContent = message.trim();
    setMessage("");
    setIsTyping(true);

    try {
      let targetConversationId = conversationId;

      // Create new conversation if none exists
      if (!targetConversationId) {
        const newConversation = await createConversationMutation.mutateAsync();
        targetConversationId = newConversation.id;
      }

      // Send the message
      await sendMessageMutation.mutateAsync({
        conversationId: targetConversationId,
        content: messageContent,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const isDisabled = sendMessageMutation.isPending || createConversationMutation.isPending;

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                className="min-h-[48px] max-h-[200px] resize-none border border-slate-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
              />
              <Button
                type="submit"
                disabled={!message.trim() || isDisabled}
                size="sm"
                className="absolute right-3 bottom-3 w-6 h-6 p-0 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 px-2">
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-slate-400 hover:text-slate-600"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-slate-400 hover:text-slate-600"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-xs text-slate-400">{message.length}/2000</span>
            </div>
          </div>
        </form>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleQuickAction("Give me ideas for")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Give me ideas
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleQuickAction("Help me with this code:")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm"
          >
            <Code className="w-3 h-3 mr-1" />
            Help with code
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleQuickAction("Write content about")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm"
          >
            <PenTool className="w-3 h-3 mr-1" />
            Write content
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleQuickAction("Analyze this data:")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Analyze data
          </Button>
        </div>
      </div>
    </div>
  );
}
