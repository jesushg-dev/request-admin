import Link from '@/i18n/routing-client';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import CTA from '@/components/home/CTA';
import Features from '@/components/home/Features';
import Footer from '@/components/home/Footer';
import Navbar from '@/components/home/Navbar';
import MouseMoveEffect from '@/components/mouse-move-effect';

const Home = async () => {
  const t = await getTranslations('home');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-background overflow-y-visible">
      <MouseMoveEffect />

      <div className="relative min-h-screen w-full">
        {/* Background gradients */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Navbar />
          <section className="container flex min-h-[calc(100vh-3.5rem)] max-w-screen-2xl flex-col items-center justify-center space-y-8 py-24 text-center md:py-32">
            <div className="space-y-4">
              <h1 className="bg-gradient-to-br from-foreground from-30% via-foreground/90 to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
                {t('brandName')}
              </h1>
              <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">{t('subHeading')} </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" variant="default" asChild={true}>
                <Link href="/auth/login">
                  {t('signInButton')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" type="button" variant="outline">
                {t('scheduleDemoButton')}
              </Button>
            </div>
          </section>

          <Features />
          <CTA />
          <Footer />
        </div>
      </div>
    </main>
  );
};

export default Home;
