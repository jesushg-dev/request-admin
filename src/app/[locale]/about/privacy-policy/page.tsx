import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shell } from '@/components/shell';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about.privacyPolicy');
  return {
    title: `${t('title')} - Request Engine`,
    description: 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
  };
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('about.privacyPolicy');
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
            <CardTitle>{t('sections.introduction.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('sections.introduction.content')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. {t('sections.informationWeCollect.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t('sections.informationWeCollect.personalInfo.title')}</h3>
              <p className="text-muted-foreground">{t('sections.informationWeCollect.personalInfo.content')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                {t.raw('sections.informationWeCollect.personalInfo.items').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('sections.informationWeCollect.usageInfo.title')}</h3>
              <p className="text-muted-foreground">{t('sections.informationWeCollect.usageInfo.content')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                {t.raw('sections.informationWeCollect.usageInfo.items').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('sections.informationWeCollect.contentData.title')}</h3>
              <p className="text-muted-foreground">{t('sections.informationWeCollect.contentData.content')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                {t.raw('sections.informationWeCollect.contentData.items').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. {t('sections.howWeUse.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.howWeUse.content')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              {t.raw('sections.howWeUse.items').map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. {t('sections.sharing.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.sharing.content')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              {t.raw('sections.sharing.items').map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">{t('sections.sharing.note')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. {t('sections.security.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.security.content')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              {t.raw('sections.security.items').map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">{t('sections.security.disclaimer')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. {t('sections.retention.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('sections.retention.content')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. {t('sections.rights.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.rights.content')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              {t.raw('sections.rights.items').map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">{t('sections.rights.contact')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. {t('sections.cookies.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('sections.cookies.content')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              {t.raw('sections.cookies.types').map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">{t('sections.cookies.note')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. {t('sections.international.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('sections.international.content')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. {t('sections.children.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('sections.children.content')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. {t('sections.changes.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('sections.changes.content')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. {t('sections.contact.title')}</CardTitle>
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
