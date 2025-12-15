'use client';

import { FileText, MessageSquare, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import type { LinkFormValues } from './index';

export function FeedbackQuestion() {
  const t = useTranslations('admin.link.form.feedbackQuestion');
  const form = useFormContext<LinkFormValues>();
  const enableFeedback = form.watch('enableFeedback');

  if (!enableFeedback) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="feedbackQuestion.type"
          render={({ field }) => (
            <FormItem>
              <Label>{t('type.label')}</Label>
              <Select value={field.value || 'YES_NO'} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YES_NO">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {t('type.yesNo')}
                    </div>
                  </SelectItem>
                  <SelectItem value="TEXT">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t('type.text')}
                    </div>
                  </SelectItem>
                  <SelectItem value="RATING">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {t('type.rating')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t('type.description')}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedbackQuestion.question"
          render={({ field }) => (
            <FormItem>
              <Label>{t('question.label')}</Label>
              <Textarea placeholder={t('question.placeholder')} {...field} value={field.value || ''} rows={3} maxLength={500} />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{t('question.description')}</p>
                <p className="text-xs text-muted-foreground">{field.value?.length || 0}/500</p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Example preview */}
        <div className="pt-4 border-t">
          <Label className="mb-2 block">{t('preview.label')}</Label>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-3">{form.watch('feedbackQuestion.question') || t('preview.placeholder')}</p>
              {form.watch('feedbackQuestion.type') === 'YES_NO' && (
                <div className="flex gap-2">
                  <div className="flex-1 p-2 border rounded-md text-center text-sm bg-background">{t('preview.yes')}</div>
                  <div className="flex-1 p-2 border rounded-md text-center text-sm bg-background">{t('preview.no')}</div>
                </div>
              )}
              {form.watch('feedbackQuestion.type') === 'TEXT' && <Textarea placeholder={t('preview.textPlaceholder')} disabled className="bg-background" rows={3} />}
              {form.watch('feedbackQuestion.type') === 'RATING' && (
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-8 w-8 text-muted-foreground" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground mt-2">{t('preview.description')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
