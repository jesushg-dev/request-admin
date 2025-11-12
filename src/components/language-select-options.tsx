'use client';

import { locales } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import { SelectItem } from './ui/select';

/**
 * Component that renders language select options for use in forms.
 * This component is separated to avoid re-rendering issues when used in form fields.
 */
export function LanguageSelectOptions() {
  const tLocale = useTranslations('component.localeSwitcher');

  return (
    <>
      {locales.map((code) => (
        <SelectItem key={code} value={code}>
          {tLocale(`locale.${code}` as const)}
        </SelectItem>
      ))}
    </>
  );
}

