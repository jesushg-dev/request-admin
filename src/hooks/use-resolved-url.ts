import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { locales, usePathname as useLocalePathname } from '@/i18n/routing';

// This hook returns:
//   bracketedPath => e.g. "/admin/[tenantId]/security"
//   resolvedUrl   => e.g. "/admin/2da1fc13-1f87-4a5d/security"
//   getParam(...) => function to get dynamic segment values
export const useResolvedUrl = () => {
  const bracketedPath = useLocalePathname();
  const resolvedUrl = usePathname();

  const localePrefix = useMemo(() => {
    const matchedLocale = locales.find((locale) => resolvedUrl.startsWith(`/${locale}`));
    return matchedLocale ? `/${matchedLocale}` : '';
  }, [resolvedUrl]);

  const cleanResolvedUrl = useMemo(() => {
    return localePrefix ? resolvedUrl.replace(localePrefix, '') : resolvedUrl;
  }, [resolvedUrl, localePrefix]);

  const params = useMemo(() => {
    const extractParams = (bracketedPath: string, resolvedUrl: string) => {
      const bracketedSegments = bracketedPath.split('/').filter(Boolean);
      const resolvedSegments = resolvedUrl.split('/').filter(Boolean);

      const extractedParams: { [key: string]: string } = {};
      bracketedSegments.forEach((segment, index) => {
        if (segment.startsWith('[') && segment.endsWith(']')) {
          const key = segment.slice(1, -1); // Remove brackets to get the key
          extractedParams[key] = resolvedSegments[index] || ''; // Ensure value is always a string
        }
      });

      return extractedParams;
    };

    return extractParams(bracketedPath, cleanResolvedUrl);
  }, [bracketedPath, cleanResolvedUrl]);

  // Helper function to access params safely
  const getParam = (key: string): string => {
    return params[key] || '';
  };

  return {
    bracketedPath,
    resolvedUrl: cleanResolvedUrl,
    getParam,
    params,
  };
};
