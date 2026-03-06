'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { useTenantContext } from './tenant-provider';
import {
  parseThemeColors,
  mergeThemeColors,
  defaultExtendedStyleProps,
} from '@/types/theme-colors';
import { generateThemeColors } from '@/lib/color-utils';

/**
 * TenantThemeProvider applies tenant-specific colors to CSS variables
 * This component reads the tenant's themeColors (or falls back to primaryColor/secondaryColor)
 * and applies them dynamically to the theme
 */
export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTenant } = useTenantContext();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!currentTenant || !mounted || typeof window === 'undefined') return;

    const root = document.documentElement;
    let tenantThemeColors = parseThemeColors(currentTenant.themeColors);

    // Fallback to primaryColor/secondaryColor if themeColors is not set
    if (!tenantThemeColors && (currentTenant.primaryColor || currentTenant.secondaryColor)) {
      const generated = generateThemeColors(
        currentTenant.primaryColor || null,
        currentTenant.secondaryColor || null
      );
      tenantThemeColors = {
        light: generated.light,
        dark: generated.dark,
      };
    }

    // Merge with defaults (colors + extended props: fonts, radius, shadows)
    const merged = mergeThemeColors(tenantThemeColors);
    const mergedColors = {
      light: { ...defaultExtendedStyleProps, ...merged.light },
      dark: { ...defaultExtendedStyleProps, ...merged.dark },
    };

    // Determine if we're in dark mode
    const isDark = 
      resolvedTheme === 'dark' || 
      (resolvedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    const colors = isDark ? mergedColors.dark : mergedColors.light;

    // Apply all colors to CSS variables
    const applyColors = (colorMap: typeof colors) => {
      Object.entries(colorMap).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--${key}`, value);
        }
      });
    };

    applyColors(colors);

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      const isDarkNow = 
        resolvedTheme === 'dark' || 
        (resolvedTheme === 'system' && mediaQuery.matches);
      const currentColors = isDarkNow ? mergedColors.dark : mergedColors.light;
      applyColors(currentColors);
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [currentTenant, resolvedTheme, theme, mounted]);

  return <>{children}</>;
}

