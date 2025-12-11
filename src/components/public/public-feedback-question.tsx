'use client';

import { useEffect, useState, useTransition } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle2, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { submitFeedbackResponse, checkFeedbackSubmitted, getFeedbackResponses, type FeedbackQuestionData } from '@/actions/document-feedback';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface PublicFeedbackQuestionProps {
  viewId: string;
  feedbackData: FeedbackQuestionData;
  linkId: string;
  tenantId: string;
}

export function PublicFeedbackQuestion({ viewId, feedbackData, linkId, tenantId }: PublicFeedbackQuestionProps) {
  const t = useTranslations('public.link.feedback');
  const [isPending, startTransition] = useTransition();
  const [selectedAnswer, setSelectedAnswer] = useState<'YES' | 'NO' | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [additionalText, setAdditionalText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if feedback already submitted
    const checkStatus = async () => {
      const result = await checkFeedbackSubmitted(viewId);
      if (result.success && result.submitted) {
        setAlreadySubmitted(true);
        setIsClosed(true); // Don't show if already submitted
      }
    };
    checkStatus();
  }, [viewId]);

  useEffect(() => {
    // Show modal after 5 seconds if not already submitted or closed
    if (!alreadySubmitted && !isClosed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alreadySubmitted, isClosed]);

  const handleSubmit = () => {
    // Validation based on feedback type
    if (feedbackData.type === 'YES_NO' && !selectedAnswer) {
      toast.error(t('selectAnswer'));
      return;
    }
    if (feedbackData.type === 'RATING' && !selectedRating) {
      toast.error(t('selectRating'));
      return;
    }
    if (feedbackData.type === 'TEXT' && additionalText.trim().length < 5) {
      toast.error(t('textTooShort'));
      return;
    }

    startTransition(async () => {
      try {
        let answer: string;
        if (feedbackData.type === 'YES_NO') {
          answer = selectedAnswer!;
        } else if (feedbackData.type === 'RATING') {
          answer = selectedRating!.toString();
        } else {
          answer = 'TEXT';
        }

        const result = await submitFeedbackResponse(viewId, {
          answer,
          text: additionalText.trim() || undefined,
        });

        if (result.success) {
          setSubmitted(true);
          toast.success(t('thankYou'));
        } else {
          toast.error(result.error || t('submitError'));
        }
      } catch (error) {
        console.error('Error submitting feedback:', error);
        toast.error(t('submitError'));
      }
    });
  };

  if (!feedbackData.enabled || !isVisible || isClosed) {
    return null;
  }

  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-green-900 dark:text-green-100">
                {t('submitted')}
              </h3>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {t('thankYouMessage')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => setIsClosed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (feedbackData.type === 'YES_NO') {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Card className="p-5 shadow-lg max-w-md w-[380px]">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">{feedbackData.question}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => setIsClosed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedAnswer('YES')}
                variant={selectedAnswer === 'YES' ? 'default' : 'outline'}
                className="flex-1"
                size="sm"
                disabled={isPending}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                {t('yes')}
              </Button>
              <Button
                onClick={() => setSelectedAnswer('NO')}
                variant={selectedAnswer === 'NO' ? 'default' : 'outline'}
                className="flex-1"
                size="sm"
                disabled={isPending}
              >
                <ThumbsDown className="h-3.5 w-3.5 mr-1.5" />
                {t('no')}
              </Button>
            </div>

            {selectedAnswer && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {t('additionalComments')}
                    <span className="text-muted-foreground font-normal">({t('optional')})</span>
                  </label>
                  <Textarea
                    value={additionalText}
                    onChange={(e) => setAdditionalText(e.target.value)}
                    placeholder={t('commentsPlaceholder')}
                    className="mt-1.5 text-sm"
                    rows={2}
                    maxLength={500}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {additionalText.length}/500
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full"
                  size="sm"
                >
                  {isPending ? t('submitting') : t('submitFeedback')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (feedbackData.type === 'TEXT') {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Card className="p-5 shadow-lg max-w-md w-[380px]">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">{feedbackData.question}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => setIsClosed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Textarea
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
                placeholder={t('textAnswerPlaceholder')}
                rows={4}
                maxLength={1000}
                disabled={isPending}
                className="w-full text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {additionalText.length}/1000
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isPending || additionalText.trim().length < 5}
              className="w-full"
              size="sm"
            >
              {isPending ? t('submitting') : t('submitFeedback')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (feedbackData.type === 'RATING') {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Card className="p-5 shadow-lg max-w-md w-[380px]">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">{feedbackData.question}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => setIsClosed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-1.5 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  disabled={isPending}
                  className="transition-all hover:scale-110 disabled:opacity-50"
                >
                  <Star
                    className={`h-8 w-8 ${
                      selectedRating && star <= selectedRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>

            {selectedRating && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {t('additionalComments')}
                    <span className="text-muted-foreground font-normal">({t('optional')})</span>
                  </label>
                  <Textarea
                    value={additionalText}
                    onChange={(e) => setAdditionalText(e.target.value)}
                    placeholder={t('commentsPlaceholder')}
                    className="mt-1.5 text-sm"
                    rows={2}
                    maxLength={500}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {additionalText.length}/500
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full"
                  size="sm"
                >
                  {isPending ? t('submitting') : t('submitFeedback')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return null;
}

