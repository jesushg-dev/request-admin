'use client';

import { useEffect, useState, useTransition } from 'react';
import { addReaction, deleteReaction, getDocumentReactions } from '@/actions/document-reaction';
import { Frown, Heart, Lightbulb, MessageSquare, Smile, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ReactionType = 'like' | 'dislike' | 'love' | 'smile' | 'frown' | 'idea' | 'comment';

interface DocumentReaction {
  id: string;
  viewId: string;
  pageNumber: number;
  type: ReactionType;
  comment?: string | null;
  createdAt: Date;
  viewerEmail?: string | null;
}

interface PublicDocumentReactionsProps {
  viewId: string;
  documentId: string;
  tenantId: string;
  pageNumber?: number;
}

export function PublicDocumentReactions({ viewId, documentId, tenantId, pageNumber = 1 }: PublicDocumentReactionsProps) {
  const t = useTranslations('public.link.reactions');
  const [reactions, setReactions] = useState<DocumentReaction[]>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [myReactionType, setMyReactionType] = useState<ReactionType | null>(null);

  // Count reactions by type (from all users)
  const reactionCounts = reactions.reduce(
    (counts, reaction) => {
      if (reaction.type !== 'comment') {
        counts[reaction.type] = (counts[reaction.type] || 0) + 1;
      }
      return counts;
    },
    {} as Record<string, number>
  );

  // Get all comments (public)
  const comments = reactions.filter((reaction) => reaction.type === 'comment');

  // Find my reaction (if any)
  const myReaction = reactions.find((r) => r.viewId === viewId && r.type !== 'comment');

  useEffect(() => {
    fetchReactions();
  }, [documentId, pageNumber, tenantId]);

  useEffect(() => {
    // Update myReactionType when reactions change
    if (myReaction) {
      setMyReactionType(myReaction.type);
    } else {
      setMyReactionType(null);
    }
  }, [myReaction]);

  const fetchReactions = async () => {
    setIsLoading(true);
    try {
      const result = await getDocumentReactions(documentId, pageNumber, tenantId);

      if (result.success && result.reactions) {
        setReactions(result.reactions as DocumentReaction[]);
      } else {
        toast.error(result.error || t('failedToLoad'));
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
      toast.error(t('failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = (type: ReactionType) => {
    startTransition(async () => {
      try {
        // If clicking the same reaction, remove it (toggle off)
        if (myReactionType === type && myReaction) {
          const result = await deleteReaction(myReaction.id, tenantId);

          if (result.success) {
            toast.success(t('reactionRemoved'));
            await fetchReactions();
          } else {
            toast.error(t('failedToAdd'), {
              description: result.error,
            });
          }
          return;
        }

        // If there's already a different reaction, remove it first
        if (myReaction && myReactionType !== type) {
          await deleteReaction(myReaction.id, tenantId);
        }

        // Add the new reaction
        const result = await addReaction(documentId, viewId, pageNumber, type, tenantId);

        if (result.success) {
          toast.success(t('reactionAdded'), {
            description: t('reactionAddedDescription', { type: t(`types.${type}`) }),
          });
          await fetchReactions();
        } else {
          toast.error(t('failedToAdd'), {
            description: result.error,
          });
        }
      } catch (error) {
        console.error('Error handling reaction:', error);
        toast.error(t('failedToAdd'));
      }
    });
  };

  const handleAddComment = () => {
    if (!comment.trim()) {
      toast.error(t('emptyComment'));
      return;
    }

    if (comment.length < 5) {
      toast.error(t('commentTooShort'));
      return;
    }

    startTransition(async () => {
      try {
        const result = await addReaction(documentId, viewId, pageNumber, 'comment', tenantId, comment.trim());

        if (result.success) {
          toast.success(t('commentAdded'), {
            description: t('commentAddedDescription'),
          });
          setComment('');
          setShowCommentInput(false);
          await fetchReactions();
        } else {
          toast.error(t('failedToAdd'), {
            description: result.error,
          });
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        toast.error(t('failedToAdd'));
      }
    });
  };

  const reactionButtons = [
    { type: 'like' as ReactionType, icon: ThumbsUp },
    { type: 'dislike' as ReactionType, icon: ThumbsDown },
    { type: 'love' as ReactionType, icon: Heart },
    { type: 'smile' as ReactionType, icon: Smile },
    { type: 'frown' as ReactionType, icon: Frown },
    { type: 'idea' as ReactionType, icon: Lightbulb },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t('title')}</h3>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Smile className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{t('title')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t('description')}</p>

        {/* Reaction Buttons */}
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {reactionButtons.map(({ type, icon: Icon }) => {
              const isSelected = myReactionType === type;
              return (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <Button variant={isSelected ? 'default' : 'outline'} size="sm" className="flex items-center gap-1" onClick={() => handleReaction(type)} disabled={isPending}>
                      <Icon className="h-4 w-4" />
                      <span>{reactionCounts[type] || 0}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isSelected ? t('tapToRemove') : t(`types.${type}`)}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={showCommentInput ? 'default' : 'outline'} size="sm" className="flex items-center gap-1" onClick={() => setShowCommentInput(!showCommentInput)}>
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('addComment')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Comment Input */}
        {showCommentInput && (
          <div className="space-y-2 mt-4 p-4 border rounded-lg bg-muted/50">
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('commentPlaceholder')} className="min-h-[80px] resize-none" disabled={isPending} maxLength={500} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {comment.length}/500 {t('characters')}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCommentInput(false);
                    setComment('');
                  }}
                  disabled={isPending}>
                  {t('cancel')}
                </Button>
                <Button size="sm" onClick={handleAddComment} disabled={!comment.trim() || isPending || comment.length < 5}>
                  {isPending ? t('submitting') : t('submit')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-hidden">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t('noComments')}</p>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium mb-3">{t('commentsSection')}</h4>
              {comments.map((commentItem) => (
                <Card key={commentItem.id} className="p-3">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{commentItem.viewerEmail?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{commentItem.viewerEmail || t('anonymous')}</span>
                        <span className="text-xs text-muted-foreground">{new Date(commentItem.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">{commentItem.comment}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
