'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Filter, ExternalLink, AlertCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { getDocumentConversations, replyToConversation, getDocumentLinks } from '@/actions/admin-conversation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentCommentsProps {
  documentId: string;
  tenantId: string;
  userTenantId: string;
}

interface Conversation {
  id: string;
  title: string | null;
  visibilityMode: string;
  lastMessageAt: Date | null;
  messageCount: number;
  hasAdminResponse: boolean;
  linkSlug: string | null;
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    isOwnerMessage: boolean;
    viewerEmail: string | null;
    viewerName: string | null;
    isRead: boolean;
  }>;
}

interface Link {
  id: string;
  slug: string | null;
  name: string | null;
}

export function DocumentComments({ documentId, tenantId, userTenantId }: DocumentCommentsProps) {
  const t = useTranslations('admin.document.view.comments');
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newReply, setNewReply] = useState('');
  const [isPending, startTransition] = useTransition();
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedLinkFilter, setSelectedLinkFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [documentId, tenantId]);

  useEffect(() => {
    applyFilters();
  }, [conversations, selectedLinkFilter, statusFilter]);

  // Auto-scroll to bottom when conversation is selected
  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load conversations
      const convResult = await getDocumentConversations(documentId, tenantId);
      if (convResult.success && convResult.conversations) {
        setConversations(convResult.conversations);
      } else {
        toast.error(convResult.error || t('loadError'));
      }

      // Load links for filtering
      const linksResult = await getDocumentLinks(documentId, tenantId);
      if (linksResult.success && linksResult.links) {
        setLinks(linksResult.links);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...conversations];

    // Filter by link
    if (selectedLinkFilter !== 'all') {
      filtered = filtered.filter((conv) => conv.linkSlug === selectedLinkFilter);
    }

    // Filter by status
    if (statusFilter === 'pending') {
      filtered = filtered.filter((conv) => !conv.hasAdminResponse);
    } else if (statusFilter === 'answered') {
      filtered = filtered.filter((conv) => conv.hasAdminResponse);
    }

    setFilteredConversations(filtered);
  };

  const handleReply = () => {
    if (!selectedConversation || !newReply.trim()) {
      return;
    }

    if (newReply.length < 5) {
      toast.error(t('replyTooShort'));
      return;
    }

    startTransition(async () => {
      try {
        const result = await replyToConversation(selectedConversation.id, userTenantId, newReply, tenantId);
        if (result.success) {
          toast.success(t('replySuccess'));
          setNewReply('');
          // Reload conversations
          await loadData();
          // Re-select the conversation
          const updated = conversations.find((c) => c.id === selectedConversation.id);
          if (updated) {
            setSelectedConversation(updated);
          }
        } else {
          toast.error(result.error || t('replyError'));
        }
      } catch (error) {
        console.error('Error replying:', error);
        toast.error(t('replyError'));
      }
    });
  };

  const getPublicUrl = (slug: string | null) => {
    if (!slug) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/l/${slug}`;
  };

  const pendingCount = conversations.filter((c) => !c.hasAdminResponse).length;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{t('title')}</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-5/6 rounded bg-muted"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Conversation detail view
  if (selectedConversation) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{selectedConversation.title || t('untitled')}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.messageCount} {t('messages')} • {selectedConversation.visibilityMode === 'PUBLIC' ? t('public') : t('private')}
                </p>
              </div>
            </div>
            {selectedConversation.linkSlug && (
              <Button variant="outline" size="sm" asChild>
                <a href={getPublicUrl(selectedConversation.linkSlug) || '#'} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('viewLink')}
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {selectedConversation.messages.map((message, index) => {
              const showAvatar = index === 0 || selectedConversation.messages[index - 1].isOwnerMessage !== message.isOwnerMessage;
              
              return (
                <div key={message.id} className="flex gap-3">
                  {showAvatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={message.isOwnerMessage ? 'bg-primary text-primary-foreground' : ''}>
                        {message.isOwnerMessage ? 'AD' : message.viewerEmail?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8" />
                  )}
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.isOwnerMessage ? t('you') : message.viewerEmail || t('anonymous')}
                        </span>
                        {message.viewerName && !message.isOwnerMessage && (
                          <span className="text-xs text-muted-foreground">({message.viewerName})</span>
                        )}
                        {message.isOwnerMessage && (
                          <Badge variant="secondary" className="text-xs">
                            {t('admin')}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className={`rounded-lg p-3 ${message.isOwnerMessage ? 'bg-primary/10 border border-primary/20' : 'bg-muted'}`}>
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

        {/* Reply Input */}
        <div className="p-4 border-t bg-background flex-shrink-0">
          <div className="space-y-2">
            <Textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder={t('replyPlaceholder')}
              className="min-h-[80px] resize-none"
              disabled={isPending}
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {newReply.length}/1000 {t('characters')}
              </span>
              <Button onClick={handleReply} disabled={isPending || !newReply.trim() || newReply.length < 5} size="sm">
                <Send className="h-4 w-4 mr-2" />
                {isPending ? t('sending') : t('send')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Conversations list view
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">{t('title')}</h3>
              <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive">
              {pendingCount} {t('needsResponse')}
            </Badge>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={selectedLinkFilter} onValueChange={setSelectedLinkFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('filterByLink')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allLinks')}</SelectItem>
              {links.map((link) => (
                <SelectItem key={link.id} value={link.slug || link.id}>
                  {link.name || link.slug || t('unnamed')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="pending">{t('pending')}</SelectItem>
              <SelectItem value="answered">{t('answered')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{conversations.length === 0 ? t('noConversations') : t('noResults')}</p>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              {filteredConversations.map((conversation) => {
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                const needsResponse = !conversation.hasAdminResponse;

                return (
                  <Card
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-accent transition-colors ${needsResponse ? 'border-orange-500/50' : ''}`}
                    onClick={() => setSelectedConversation(conversation)}>
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{conversation.title?.substring(0, 2).toUpperCase() || 'C'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{conversation.title || t('untitled')}</h4>
                          {needsResponse && (
                            <Badge variant="destructive" className="text-xs shrink-0">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {t('needsResponse')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">{lastMessage?.content || ''}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {lastMessage?.viewerEmail || t('anonymous')}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastMessageAt ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true }) : 'N/A'}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {conversation.messageCount} {t('messages')}
                          </span>
                          {conversation.linkSlug && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge variant="outline" className="text-xs">
                                {conversation.linkSlug}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
