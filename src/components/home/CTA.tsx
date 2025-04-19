import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';

export default async function CTA() {
  const t = await getTranslations('home.cta');

  return (
    <section className="border-t">
      <div className="container flex flex-col items-center gap-4 py-24 text-center md:py-32">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">{t('title')}</h2>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">{t('description')}</p>
        <Button size="lg" className="mt-4">
          {t('button')}
        </Button>
      </div>
    </section>
  );
}
