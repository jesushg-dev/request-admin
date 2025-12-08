'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LinkAgreementFormProps {
  agreementContent: string;
  requireName: boolean;
  onSuccess: (name?: string) => void;
}

export function LinkAgreementForm({ agreementContent, requireName, onSuccess }: LinkAgreementFormProps) {
  const t = useTranslations('public.link');
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      return;
    }
    if (requireName && !name.trim()) {
      return;
    }
    onSuccess(requireName ? name : undefined);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>{t('agreement.title')}</CardTitle>
        </div>
        <CardDescription>{t('agreement.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('agreement.contentLabel')}</Label>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: agreementContent }} />
            </ScrollArea>
          </div>

          {requireName && (
            <div className="space-y-2">
              <Label htmlFor="name">{t('agreement.nameLabel')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('agreement.namePlaceholder')}
                required
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="accept" checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} required />
            <Label htmlFor="accept" className="text-sm font-normal cursor-pointer">
              {t('agreement.acceptLabel')}
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={!accepted || (requireName && !name.trim())}>
            {t('agreement.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

