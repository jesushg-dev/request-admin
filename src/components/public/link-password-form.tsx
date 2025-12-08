'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { validateLinkPassword } from '@/actions/link-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LinkPasswordFormProps {
  slug: string;
  onSuccess: () => void;
}

export function LinkPasswordForm({ slug, onSuccess }: LinkPasswordFormProps) {
  const t = useTranslations('public.link');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error(t('password.required'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await validateLinkPassword(slug, password);
      if (result.success) {
        onSuccess();
      } else {
        toast.error(result.error || t('password.invalid'));
      }
    } catch (error) {
      toast.error(t('password.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle>{t('password.title')}</CardTitle>
        </div>
        <CardDescription>{t('password.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t('password.label')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password.placeholder')}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('password.submitting') : t('password.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

