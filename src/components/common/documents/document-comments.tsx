'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Edit, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DocumentCommentsProps {
  documentId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

export function DocumentComments({ documentId }: DocumentCommentsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    // Simulate API call to fetch document comments
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from your API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock comments data
        setComments([
          {
            id: '1',
            content: 'Please review the financial projections on page 15. I think we need to update the Q3 forecast.',
            createdAt: new Date('2023-01-18T14:32:00'),
            user: {
              id: '1',
              name: 'John Doe',
              avatar: '/placeholder.svg',
            },
          },
          {
            id: '2',
            content: "The executive summary looks great. I've shared this with the board members.",
            createdAt: new Date('2023-01-17T10:15:00'),
            user: {
              id: '2',
              name: 'Jane Smith',
              avatar: '/placeholder.svg',
            },
          },
          {
            id: '3',
            content: 'We should include the new product line in the future outlook section.',
            createdAt: new Date('2023-01-16T16:45:00'),
            user: {
              id: '1',
              name: 'John Doe',
              avatar: '/placeholder.svg',
            },
          },
        ]);
      } catch {
        toast.error('Failed to fetch comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [documentId]);

  const handleAddComment = () => {
    if (!newComment.trim()) {
      return;
    }

    // In a real application, you would call your API to add the comment
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      createdAt: new Date(),
      user: {
        id: '1',
        name: 'John Doe',
        avatar: '/placeholder.svg',
      },
    };

    setComments([comment, ...comments]);
    setNewComment('');
    toast.success('Comment added');
  };

  const handleDeleteComment = (id: string) => {
    // In a real application, you would call your API to delete the comment
    setComments(comments.filter((comment) => comment.id !== id));
    toast.success('Comment deleted');
  };

  const handleEditComment = (id: string) => {
    const comment = comments.find((c) => c.id === id);
    if (comment) {
      setEditingComment(id);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editContent.trim()) {
      return;
    }

    // In a real application, you would call your API to update the comment
    setComments(comments.map((comment) => (comment.id === id ? { ...comment, content: editContent } : comment)));
    setEditingComment(null);
    setEditContent('');
    toast.success('Comment updated');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>Discuss this document with your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex animate-pulse gap-4">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-5/6 rounded bg-muted"></div>
              </div>
            </div>
            <div className="flex animate-pulse gap-4">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-5/6 rounded bg-muted"></div>
              </div>
            </div>
            <div className="flex animate-pulse gap-4">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-5/6 rounded bg-muted"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
        <CardDescription>Discuss this document with your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt="Your avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="relative">
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button className="absolute bottom-2 right-2" size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send comment</span>
                </Button>
              </div>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-sm text-muted-foreground">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                      {comment.user.id === '1' && ( // Assuming "1" is the current user
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditComment(comment.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {editingComment === comment.id ? (
                      <div className="mt-2 relative">
                        <textarea className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                        <div className="mt-2 flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingComment(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => handleSaveEdit(comment.id)} disabled={!editContent.trim()}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm">{comment.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
