'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Font = 'inter' | 'manrope' | 'system' | 'mono' | 'openDyslexic' | 'lexend';

type FontProviderProps = {
  children: React.ReactNode;
  defaultFont?: Font;
  storageKey?: string;
};

type FontProviderState = {
  font: Font;
  setFont: (font: Font) => void;
};

const initialState: FontProviderState = {
  font: 'inter',
  setFont: () => null,
};

const FontProviderContext = createContext<FontProviderState>(initialState);

// Font mappings to actual font families
// Note: Local fonts (geist-sans, geist-mono, openDyslexic) are temporarily disabled
// due to Turbopack bug. Using fallbacks until the issue is resolved.
const fontFamilies: Record<Font, string> = {
  inter:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  manrope: '"Manrope", ui-sans-serif, system-ui, sans-serif',
  system: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  openDyslexic: 'ui-sans-serif, system-ui, sans-serif', // Temporarily using system font fallback
  lexend: 'var(--font-lexend), ui-sans-serif, system-ui, sans-serif',
};

export function FontProvider({ children, defaultFont = 'inter', storageKey = 'appearance-font', ...props }: FontProviderProps) {
  const [font, setFontState] = useState<Font>(() => {
    if (typeof window === 'undefined') return defaultFont;
    const stored = localStorage.getItem(storageKey) as Font | null;
    return stored && Object.keys(fontFamilies).includes(stored) ? stored : defaultFont;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const fontFamily = fontFamilies[font];
    root.style.setProperty('--app-font-family', fontFamily);
  }, [font]);

  const setFont = (newFont: Font) => {
    localStorage.setItem(storageKey, newFont);
    setFontState(newFont);
  };

  const value = {
    font,
    setFont,
  };

  return (
    <FontProviderContext.Provider {...props} value={value}>
      {children}
    </FontProviderContext.Provider>
  );
}

export const useFont = () => {
  const context = useContext(FontProviderContext);
  if (context === undefined) throw new Error('useFont must be used within a FontProvider');
  return context;
};
