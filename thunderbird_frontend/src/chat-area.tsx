import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble, ChatInput, TypingIndicator } from "@/components/chat";
import { Menu, Plus, Bolt } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Message } from "@shared/schema";

interface ChatAreaProps {
  conversationId?: string;
  onNewConversation: (id: string) => void;
  onToggleSidebar: () => void;
}

export function ChatArea({ conversationId, onNewConversation, onToggleSidebar }: ChatAreaProps) {
  const isMobile = useIsMobile();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Mobile Header */}
      {isMobile && (
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bolt className="text-white w-4 h-4" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">Thunderbird</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {!conversationId || (!messagesLoading && (!messages || messages.length === 0)) ? (
            // Welcome Message
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bolt className="text-blue-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Welcome to Thunderbird AI</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Your intelligent AI assistant ready to help with any questions, tasks, or creative projects. How can I assist you today?
              </p>
            </div>
          ) : (
            // Messages
            <>
              {messages?.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <ChatInput 
        conversationId={conversationId}
        onNewConversation={onNewConversation}
      />
    </div>
  );
}
