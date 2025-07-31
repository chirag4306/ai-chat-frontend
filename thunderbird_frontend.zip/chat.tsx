import { useState } from "react";
import { useParams } from "wouter";
import { Sidebar, ChatArea } from "@/components/chat";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Chat() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out' : 'w-80'} 
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        ${!isMobile ? 'hidden lg:flex' : ''}
      `}>
        <Sidebar 
          currentConversationId={currentConversationId}
          onConversationSelect={setCurrentConversationId}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatArea 
          conversationId={currentConversationId}
          onNewConversation={setCurrentConversationId}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  );
}
