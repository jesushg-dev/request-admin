import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import PricingView from '@/components/common/pricing-view';
import { HeroWithMockup } from '@/components/shared/hero-with-mockup';

const IS_ON_PREMISE = process.env.ON_PREMISE === 'true';

const Home = async () => {
  const t = await getTranslations('home');

  return (
    <main>
      <HeroWithMockup
        title={t('brandName')}
        description={t('subHeading')}
        primaryCta={
          <Button variant="secondary" size="lg" asChild={true}>
            <Link href="/auth/login">{t('signInButton')}</Link>
          </Button>
        }
        secondaryCta={
          <Button size="lg" variant="link">
            Learn More
          </Button>
        }
        mockupImage={{
          alt: 'AI Platform Dashboard',
          width: 1440,
          height: 1024,
          src: '/demo.webp',
        }}
      />
      {IS_ON_PREMISE && (
        <section className="bg-background container w-full py-12 md:py-24 ">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t('pricingTitle')}</h2>
              <p className="text-muted-foreground max-w-[900px]">{t('pricingDescription')}</p>
            </div>
            <PricingView />
          </div>
        </section>
      )}
    </main>
  );
};

export default Home;
