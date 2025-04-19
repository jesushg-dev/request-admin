import Link from 'next/link';
import { Github } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';

export default async function Navbar() {
  const t = await getTranslations('home.navbar');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">{t('brand')}</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/requests" className="transition-colors hover:text-primary">
            {t('menu.requests')}
          </Link>
          <Link href="/services" className="transition-colors hover:text-primary">
            {t('menu.services')}
          </Link>
          <Link href="/knowledge" className="transition-colors hover:text-primary">
            {t('menu.knowledge')}
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="https://github.com/amanesoft" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm">
            {t('menu.contact')}
          </Button>
          <Button size="sm">{t('menu.getDemo')}</Button>
        </div>
      </div>
    </header>
  );
}
