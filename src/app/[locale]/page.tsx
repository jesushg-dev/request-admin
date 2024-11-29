import { Poppins } from 'next/font/google';
import { getTranslations } from 'next-intl/server';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/auth/login-button';

const font = Poppins({
  subsets: ['latin'],
  weight: ['600'],
});

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="space-y-6 text-center">
        <h1 className={cn('text-6xl font-semibold text-white drop-shadow-md', font.className)}>{t('title')}</h1>
        <p className="text-lg text-white">{t('subHeading')}</p>
        <div>
          <LoginButton asChild>
            <Button variant="secondary" size="lg">
              {t('signInButton')}
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
