'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, Plus, ArrowLeft, Users, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

import { createPublicConversation, addMessageToConversation, getPublicConversations, markConversationAsRead } from '@/actions/link-conversation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PublicDocumentConversationsProps {
  viewId: string;
  linkId: string;
  viewerEmail: string | null;
}

interface Conversation {
  id: string;
  title: string | null;
  visibilityMode: string;
  lastMessageAt: Date | null;
  messageCount: number;
  unreadCount: number;
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    isOwnerMessage: boolean;
    viewerEmail: string | null;
    isRead: boolean;
  }>;
}

export function PublicDocumentConversations({ viewId, linkId, viewerEmail }: PublicDocumentConversationsProps) {
  const t = useTranslations('public.link.conversations');
  const searchParams = useSearchParams();
  const highlightId = searchParams?.get('highlight');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, [viewId, linkId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  // Handle highlight from URL
  useEffect(() => {
    if (highlightId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === highlightId);
      if (conv) {
        setSelectedConversation(conv);
        // Mark as read
        markConversationAsRead(conv.id, viewId);
      }
    }
  }, [highlightId, conversations, viewId]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const result = await getPublicConversations(viewId, linkId);
      if (result.success && result.conversations) {
        setConversations(result.conversations);
      } else {
        toast.error(result.error || t('loadError'));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversation = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error(t('fillAllFields'));
      return;
    }

    if (newTitle.length < 3) {
      toast.error(t('titleTooShort'));
      return;
    }

    if (newContent.length < 5) {
      toast.error(t('messageTooShort'));
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPublicConversation(viewId, newTitle, newContent, 'PRIVATE');
        if (result.success) {
          toast.success(t('createSuccess'));
          setNewTitle('');
          setNewContent('');
          setShowNewDialog(false);
          // Reload conversations
          await loadConversations();
        } else {
          toast.error(result.error || t('createError'));
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error(t('createError'));
      }
    });
  };

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) {
      return;
    }

    if (newMessage.length < 5) {
      toast.error(t('messageTooShort'));
      return;
    }

    startTransition(async () => {
      try {
        const result = await addMessageToConversation(selectedConversation.id, viewId, newMessage);
        if (result.success) {
          setNewMessage('');
          // Reload conversations to get updated messages
          await loadConversations();
          // Re-select the conversation to show updated messages
          const updated = conversations.find((c) => c.id === selectedConversation.id);
          if (updated) {
            setSelectedConversation(updated);
          }
        } else {
          toast.error(result.error || t('sendError'));
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error(t('sendError'));
      }
    });
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Mark as read
    if (conversation.unreadCount > 0) {
      await markConversationAsRead(conversation.id, viewId);
      // Update local state
      setConversations((prev) =>
        prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, isRead: true })) } : c))
      );
    }
  };

  const isOwnConversation = (conversation: Conversation) => {
    return conversation.messages.some((msg) => !msg.isOwnerMessage && msg.viewerEmail === viewerEmail);
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t('title')}</h3>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Conversation List View
  if (!selectedConversation) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{t('title')}</h3>
            </div>
            <div className="flex items-center gap-2">
              {totalUnread > 0 && <Badge variant="destructive">{totalUnread}</Badge>}
              <Button size="sm" onClick={() => setShowNewDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('new')}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">{t('noConversations')}</p>
                <Button size="sm" onClick={() => setShowNewDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('startFirst')}
                </Button>
              </div>
            ) : (
              conversations.map((conversation) => {
                const isOwn = isOwnConversation(conversation);
                const lastMessage = conversation.messages[conversation.messages.length - 1];

                return (
                  <Card
                    key={conversation.id}
                    className={`p-3 cursor-pointer hover:bg-accent transition-colors ${isOwn ? 'border-primary/50' : ''} ${highlightId === conversation.id ? 'ring-2 ring-primary animate-pulse' : ''}`}
                    onClick={() => handleSelectConversation(conversation)}>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 mt-1">
                        <AvatarFallback className="text-xs">{conversation.title?.substring(0, 2).toUpperCase() || 'C'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{conversation.title || t('untitled')}</h4>
                          {conversation.unreadCount > 0 && <Badge variant="destructive" className="text-xs">{conversation.unreadCount}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{lastMessage?.content || ''}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {conversation.visibilityMode === 'PUBLIC' ? (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {t('public')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              {t('private')}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastMessageAt ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true }) : ''}
                          </span>
                          <span className="text-xs text-muted-foreground">{conversation.messageCount} {t('messages')}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* New Conversation Dialog */}
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('newConversation')}</DialogTitle>
              <DialogDescription>{t('newConversationDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('titleLabel')}</label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={t('titlePlaceholder')} disabled={isPending} maxLength={100} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('messageLabel')}</label>
                <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder={t('messagePlaceholder')} className="min-h-[100px]" disabled={isPending} maxLength={1000} />
                <p className="text-xs text-muted-foreground">
                  {newContent.length}/1000 {t('characters')}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewDialog(false)} disabled={isPending}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleCreateConversation} disabled={isPending || !newTitle.trim() || !newContent.trim()}>
                  {isPending ? t('creating') : t('create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Conversation Detail View
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{selectedConversation.title || t('untitled')}</h3>
            <div className="flex items-center gap-2 mt-1">
              {selectedConversation.visibilityMode === 'PUBLIC' ? (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {t('public')}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  {t('private')}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{selectedConversation.messageCount} {t('messages')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {selectedConversation.messages.map((message, index) => {
            const isOwner = message.isOwnerMessage;
            const isOwn = !isOwner && message.viewerEmail === viewerEmail;
            const showAvatar = index === 0 || selectedConversation.messages[index - 1].isOwnerMessage !== isOwner;

            return (
              <div key={message.id} className={`flex gap-3 ${isOwner ? 'flex-row' : 'flex-row'}`}>
                {showAvatar ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`text-xs ${isOwner ? 'bg-primary text-primary-foreground' : ''}`}>
                      {isOwner ? 'AD' : message.viewerEmail?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8" />
                )}
                <div className="flex-1 min-w-0">
                  {showAvatar && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{isOwner ? t('owner') : message.viewerEmail || t('anonymous')}</span>
                      {isOwn && (
                        <Badge variant="outline" className="text-xs">
                          {t('you')}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className={`rounded-lg p-3 ${isOwner ? 'bg-primary/10 border border-primary/20' : 'bg-muted'}`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('replyPlaceholder')}
            className="min-h-[60px] resize-none"
            disabled={isPending}
            maxLength={1000}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={isPending || !newMessage.trim() || newMessage.length < 5} size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {newMessage.length}/1000 {t('characters')}
        </p>
      </div>
    </div>
  );
}

