'use client';

import { useEffect, useState } from 'react';
import { Frown, Heart, Lightbulb, MessageSquare, Smile, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ReactionType = 'like' | 'dislike' | 'love' | 'smile' | 'frown' | 'idea' | 'comment';

interface DocumentReaction {
  id: string;
  viewId: string;
  pageNumber: number;
  type: ReactionType;
  comment?: string;
  createdAt: Date;
}

interface DocumentReactionWidgetProps {
  documentId: string;
  pageNumber?: number;
  viewOnly?: boolean;
}

export function DocumentReactionWidget({ documentId, pageNumber = 1, viewOnly = false }: DocumentReactionWidgetProps) {
  const [reactions, setReactions] = useState<DocumentReaction[]>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
    // Fetch reactions from the API
    const fetchReactions = async () => {
      setIsLoading(true);
      try {
        // In a real application, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data
        const mockReactions: DocumentReaction[] = [
          {
            id: '1',
            viewId: 'view_1',
            pageNumber: 1,
            type: 'like',
            createdAt: new Date(Date.now() - 3600000),
          },
          {
            id: '2',
            viewId: 'view_2',
            pageNumber: 1,
            type: 'love',
            createdAt: new Date(Date.now() - 7200000),
          },
          {
            id: '3',
            viewId: 'view_1',
            pageNumber: 1,
            type: 'idea',
            createdAt: new Date(Date.now() - 10800000),
          },
          {
            id: '4',
            viewId: 'view_3',
            pageNumber: 1,
            type: 'comment',
            comment: 'This section is very insightful',
            createdAt: new Date(Date.now() - 14400000),
          },
          {
            id: '5',
            viewId: 'view_4',
            pageNumber: 1,
            type: 'comment',
            comment: 'I have a question about this part',
            createdAt: new Date(Date.now() - 18000000),
          },
        ];

        setReactions(mockReactions);
      } catch {
        toast.error('Error', {
          description: 'Failed to load reactions',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReactions();
  }, [documentId, pageNumber]);

  const handleReaction = (type: ReactionType) => {
    if (viewOnly) return;

    // In a real application, this would be an API call
    const newReaction: DocumentReaction = {
      id: Date.now().toString(),
      viewId: 'current_view_id', // In a real app, this would come from the auth context
      pageNumber,
      type,
      createdAt: new Date(),
    };

    setReactions([...reactions, newReaction]);

    toast.success('Reaction added', {
      description: `Your ${type} reaction has been recorded`,
    });
  };

  const handleAddComment = () => {
    if (!comment.trim() || viewOnly) return;

    // In a real application, this would be an API call
    const newComment: DocumentReaction = {
      id: Date.now().toString(),
      viewId: 'current_view_id', // In a real app, this would come from the auth context
      pageNumber,
      type: 'comment',
      comment,
      createdAt: new Date(),
    };

    setReactions([...reactions, newComment]);
    setComment('');
    setShowCommentInput(false);

    toast.success('Comment added', {
      description: 'Your comment has been recorded',
    });
  };

  const reactionButtons = [
    { type: 'like', icon: ThumbsUp, label: 'Like' },
    { type: 'dislike', icon: ThumbsDown, label: 'Dislike' },
    { type: 'love', icon: Heart, label: 'Love' },
    { type: 'smile', icon: Smile, label: 'Smile' },
    { type: 'frown', icon: Frown, label: 'Confused' },
    { type: 'idea', icon: Lightbulb, label: 'Idea' },
  ] as const;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reactions</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-2 mb-4">
            {reactionButtons.map(({ type, icon: Icon, label }) => (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleReaction(type)} disabled={viewOnly}>
                    <Icon className="h-4 w-4" />
                    <span>{reactionCounts[type] || 0}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
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
                <p>Add Comment</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {showCommentInput && (
          <div className="space-y-2 mb-4">
            <Label htmlFor="comment">Add a comment</Label>
            <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Type your comment here..." rows={3} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCommentInput(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>
                Add Comment
              </Button>
            </div>
          </div>
        )}

        {comments.length > 0 && (
          <div className="space-y-3 mt-4">
            <h3 className="text-sm font-medium">Comments</h3>
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-md p-3 space-y-1">
                <p className="text-sm">{comment.comment}</p>
                <p className="text-xs text-muted-foreground">{comment.createdAt.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
