import { useTranslations } from 'next-intl';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type QuestionKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5';

export function FaqsTab() {
  const t = useTranslations('admin.helpPage.fAQs');

  const questions: Record<QuestionKey, string> = {
    q1: t('questions.q1'),
    q2: t('questions.q2'),
    q3: t('questions.q3'),
    q4: t('questions.q4'),
    q5: t('questions.q5'),
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        {Object.entries(questions).map(([key, question]) => (
          <Card key={key} className="cursor-pointer transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{question}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="hidden md:block">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">{t('answerPanel.title')}</CardTitle>
            <CardDescription>{t('answerPanel.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 border rounded-md">
              <p className="text-muted-foreground">{t('answerPanel.emptyMessage')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
