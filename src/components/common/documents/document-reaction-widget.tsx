'use client';

import { useEffect, useState } from 'react';
import { addReaction, getDocumentReactions } from '@/actions/document-reaction';
import { Frown, Heart, Lightbulb, MessageSquare, Smile, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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

interface DocumentReactionWidgetProps {
  documentId: string;
  pageNumber?: number;
  viewOnly?: boolean;
  tenantId: string;
  viewId?: string;
}

export function DocumentReactionWidget({ documentId, pageNumber = 1, viewOnly = false, tenantId, viewId }: DocumentReactionWidgetProps) {
  const t = useTranslations('admin.document.view.reactions');
  const [reactions, setReactions] = useState<DocumentReaction[]>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Count reactions by type
  const reactionCounts = reactions.reduce(
    (counts, reaction) => {
      if (reaction.type !== 'comment') {
        counts[reaction.type] = (counts[reaction.type] || 0) + 1;
      }
      return counts;
    },
    {} as Record<string, number>
  );

  // Get comments
  const comments = reactions.filter((reaction) => reaction.type === 'comment');

  useEffect(() => {
    fetchReactions();
  }, [documentId, pageNumber, tenantId]);

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

  const handleReaction = async (type: ReactionType) => {
    if (viewOnly || !viewId) {
      toast.error(t('loginRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
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
      console.error('Error adding reaction:', error);
      toast.error(t('failedToAdd'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error(t('emptyComment'));
      return;
    }

    if (viewOnly || !viewId) {
      toast.error(t('loginRequired'));
      return;
    }

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Reaction Buttons */}
      <div className="p-4 border-b flex-shrink-0">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          {t('title')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t('description')}</p>

        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {reactionButtons.map(({ type, icon: Icon }) => (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleReaction(type)} disabled={viewOnly || isSubmitting}>
                    <Icon className="h-4 w-4" />
                    <span>{reactionCounts[type] || 0}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t(`types.${type}`)}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setShowCommentInput(!showCommentInput)} disabled={viewOnly}>
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

        {showCommentInput && (
          <div className="space-y-2 mt-4 p-4 border rounded-lg bg-muted/50">
            <Label htmlFor="comment">{t('addComment')}</Label>
            <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('commentPlaceholder')} rows={3} className="resize-none" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCommentInput(false)} disabled={isSubmitting}>
                {t('cancel')}
              </Button>
              <Button size="sm" onClick={handleAddComment} disabled={!comment.trim() || isSubmitting}>
                {isSubmitting ? t('submitting') : t('submit')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-hidden">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t('noReactions')}</p>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium mb-3">{t('commentsSection')}</h3>
              {comments.map((commentItem) => (
                <Card key={commentItem.id} className="p-3">
                  <div className="space-y-2">
                    <p className="text-sm whitespace-pre-wrap break-words">{commentItem.comment}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{commentItem.viewerEmail || t('anonymous')}</p>
                      <p className="text-xs text-muted-foreground">{new Date(commentItem.createdAt).toLocaleDateString()}</p>
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
