import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  replies?: Comment[];
}

interface CommentsProps {
  comments: Comment[];
}

export default function Comments({ comments }: CommentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input placeholder="Write a comment..." />
          <Button>Send</Button>
        </div>
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={comment.avatar} alt={comment.author} />
            <AvatarFallback>
              {comment.author
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{comment.author}</p>
            <p className="text-sm text-muted-foreground">{comment.time}</p>
            <p className="text-sm">{comment.content}</p>
            {comment.replies && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
