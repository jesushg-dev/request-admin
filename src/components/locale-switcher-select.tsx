'use client';

import { useTransition } from 'react';
import { useParams } from 'next/navigation';
import { locales, usePathname, useRouter } from '@/i18n/routing';
import clsx from 'clsx';
import { Globe } from 'lucide-react';
import type { Locale } from 'next-intl';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export default function LocaleSwitcherSelect() {
  const t = useTranslations('component.localeSwitcher');
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (nextLocale: Locale) => {
    startTransition(() => {
      router.replace(
        // @ts-expect-error TypeScript ensures params and pathname are valid
        { pathname, params },
        { locale: nextLocale }
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={clsx(isPending && 'opacity-50')}>
        {locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLocaleChange(code as Locale)}
            className={clsx(currentLocale === code && 'font-bold')} // Use currentLocale here
          >
            {t(`locale.${code}` as const)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
