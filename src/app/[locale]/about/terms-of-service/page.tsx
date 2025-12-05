import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shell } from '@/components/shell';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about.termsOfService');
  return {
    title: `${t('title')} - Request Engine`,
    description: 'Read our terms of service to understand the rules and guidelines for using Request Engine.',
  };
}

export default async function TermsOfServicePage() {
  const t = await getTranslations('about.termsOfService');
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Shell variant="markdown">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('lastUpdated')}: {lastUpdated}
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>1. {t('sections.acceptance.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('sections.acceptance.content')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. {t('sections.description.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.description.content')}</p>
            <p className="text-muted-foreground">{t('sections.description.includes')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              {t.raw('sections.description.items').map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. {t('sections.responsibilities.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.responsibilities.content')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              {t.raw('sections.responsibilities.items').map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. {t('sections.privacy.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.privacy.content')}</p>
            <p className="text-muted-foreground">{t('sections.privacy.acknowledge')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              {t.raw('sections.privacy.items').map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. {t('sections.intellectualProperty.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.intellectualProperty.content')}</p>
            <p className="text-muted-foreground">{t('sections.intellectualProperty.userContent')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. {t('sections.billing.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.billing.content')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              {t.raw('sections.billing.items').map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. {t('sections.liability.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('sections.liability.content')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. {t('sections.termination.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.termination.content')}</p>
            <p className="text-muted-foreground">{t('sections.termination.cease')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. {t('sections.changes.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('sections.changes.content')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. {t('sections.contact.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('sections.contact.content')}</p>
            <p className="text-muted-foreground mt-2">
              Email: {t('sections.contact.email')}
              <br />
              Address: {t('sections.contact.address')}
            </p>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
