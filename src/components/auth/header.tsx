import { Poppins } from 'next/font/google';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const font = Poppins({
  subsets: ['latin'],
  weight: ['600'],
});

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  const t = useTranslations('home'); // Namespace for translations

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-4">
      <h1 className={cn('text-3xl font-semibold', font.className)}>{t('title')}</h1>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};
