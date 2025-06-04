import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function ContactTab() {
  const t = useTranslations('admin.helpPage.contact');

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('support.title')}</CardTitle>
          <CardDescription>{t('support.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">{t('support.emailLabel')}</h3>
              <p className="text-sm text-muted-foreground">{t('support.email')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">{t('support.phoneLabel')}</h3>
              <p className="text-sm text-muted-foreground">{t('support.phone')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">{t('support.hoursLabel')}</h3>
              <p className="text-sm text-muted-foreground">{t('support.hours')}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">{t('support.button')}</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('training.title')}</CardTitle>
          <CardDescription>{t('training.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('training.detail')}</p>
            <div>
              <h3 className="text-sm font-medium">{t('training.typesLabel')}</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {t('training.types')
                  .split(',')
                  .map((type, index) => (
                    <li key={index}>• {type.trim()}</li>
                  ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">{t('training.button')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
