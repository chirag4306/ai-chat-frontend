import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, User, Settings, Bolt } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@shared/schema";

interface SidebarProps {
  currentConversationId?: string;
  onConversationSelect: (id: string) => void;
  onClose: () => void;
}

export function Sidebar({ currentConversationId, onConversationSelect, onClose }: SidebarProps) {
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/conversations', {
        title: 'New Conversation'
      });
      return response.json();
    },
    onSuccess: (newConversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      onConversationSelect(newConversation.id);
      onClose();
    },
  });

  const handleNewConversation = () => {
    createConversationMutation.mutate();
  };

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: false });
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Bolt className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Thunderbird</h1>
            <p className="text-sm text-slate-500">AI Assistant</p>
          </div>
        </div>
        
        <Button 
          onClick={handleNewConversation}
          disabled={createConversationMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {isLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </>
          ) : conversations?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new conversation to get started</p>
            </div>
          ) : (
            conversations?.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  onConversationSelect(conversation.id);
                  onClose();
                }}
                className={`
                  group p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors duration-200
                  ${currentConversationId === conversation.id ? 'border-l-2 border-blue-600 bg-blue-50' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTimeAgo(conversation.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors duration-200">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="text-slate-600 w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">User</p>
            <p className="text-xs text-slate-500">Free Plan</p>
          </div>
          <Settings className="text-slate-400 w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
