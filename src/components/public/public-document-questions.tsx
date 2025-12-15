'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPublicQuestion, getPublicConversations } from '@/actions/link-conversation';
import { format, formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, MessageCircle, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface PublicDocumentQuestionsProps {
  viewId: string;
  linkId: string;
  viewerEmail: string | null;
}

interface Question {
  id: string;
  title: string | null;
  lastMessageAt: Date | null;
  messageCount: number;
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    isOwnerMessage: boolean;
    viewerEmail: string | null;
  }>;
}

export function PublicDocumentQuestions({ viewId, linkId, viewerEmail }: PublicDocumentQuestionsProps) {
  const t = useTranslations('public.link.questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load questions
  useEffect(() => {
    loadQuestions();
  }, [viewId, linkId]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const result = await getPublicConversations(viewId, linkId);
      if (result.success && result.conversations) {
        setQuestions(result.conversations);
      } else {
        toast.error(result.error || t('loadError'));
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error(t('emptyError'));
      return;
    }

    if (newQuestion.length < 10) {
      toast.error(t('tooShortError'));
      return;
    }

    if (newQuestion.length > 1000) {
      toast.error(t('tooLongError'));
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPublicQuestion(viewId, newQuestion);
        if (result.success) {
          toast.success(t('submitSuccess'));
          setNewQuestion('');
          // Reload questions
          await loadQuestions();
        } else {
          toast.error(result.error || t('submitError'));
        }
      } catch (error) {
        console.error('Error submitting question:', error);
        toast.error(t('submitError'));
      }
    });
  };

  const isOwnQuestion = (question: Question) => {
    return question.messages.some((msg) => !msg.isOwnerMessage && msg.viewerEmail === viewerEmail);
  };

  const hasAnswer = (question: Question) => {
    return question.messages.some((msg) => msg.isOwnerMessage);
  };

  const getQuestionText = (question: Question) => {
    const firstMessage = question.messages[0];
    return firstMessage?.content || question.title || '';
  };

  const getAnswerText = (question: Question) => {
    const answerMessage = question.messages.find((msg) => msg.isOwnerMessage);
    return answerMessage?.content || null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t('title')}</h3>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t('title')}</h3>
          </div>
          <Badge variant="secondary">{questions.length}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
      </div>

      {/* Questions List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t('noQuestions')}</p>
            </div>
          ) : (
            questions.map((question) => {
              const isOwn = isOwnQuestion(question);
              const answered = hasAnswer(question);
              const questionText = getQuestionText(question);
              const answerText = getAnswerText(question);

              return (
                <Card key={question.id} className={`p-4 ${isOwn ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <div className="space-y-3">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="text-xs">{question.messages[0]?.viewerEmail?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium truncate">{question.messages[0]?.viewerEmail || t('anonymous')}</span>
                            {isOwn && (
                              <Badge variant="outline" className="text-xs">
                                {t('you')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{question.lastMessageAt ? formatDistanceToNow(new Date(question.lastMessageAt), { addSuffix: true }) : ''}</p>
                        </div>
                      </div>
                      <Badge variant={answered ? 'default' : 'secondary'} className="shrink-0">
                        {answered ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('answered')}
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            {t('pending')}
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Question Text */}
                    <div className="pl-10">
                      <p className="text-sm whitespace-pre-wrap break-words">{questionText}</p>
                    </div>

                    {/* Answer (if exists) */}
                    {answered && answerText && (
                      <div className="pl-10 pt-3 border-t">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">AD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-primary mb-1">{t('ownerResponse')}</p>
                            <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">{answerText}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* New Question Input */}
      <div className="p-4 border-t bg-background">
        <div className="space-y-2">
          <Textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder={t('placeholder')} className="min-h-[80px] resize-none" disabled={isPending} maxLength={1000} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newQuestion.length}/1000 {t('characters')}
            </span>
            <Button onClick={handleSubmitQuestion} disabled={isPending || !newQuestion.trim() || newQuestion.length < 10} size="sm">
              <Send className="h-4 w-4 mr-2" />
              {isPending ? t('submitting') : t('submit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
