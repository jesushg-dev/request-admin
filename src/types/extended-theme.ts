/**
 * Extended theme types (inspired by tweakcn)
 * Includes colors + typography + shadows + radius + spacing
 */

import type { ThemeColors, ThemeColorKey } from './theme-colors';

/** Keys for styles shared between light and dark (e.g. fonts, radius) */
export const COMMON_STYLE_KEYS = [
  'font-sans',
  'font-serif',
  'font-mono',
  'radius',
  'shadow-opacity',
  'shadow-blur',
  'shadow-spread',
  'shadow-offset-x',
  'shadow-offset-y',
  'letter-spacing',
  'spacing',
] as const;

export type CommonStyleKey = (typeof COMMON_STYLE_KEYS)[number];

/** Extended style props: colors + typography + shadows + layout */
export type ThemeStyleProps = ThemeColors & {
  'font-sans'?: string;
  'font-serif'?: string;
  'font-mono'?: string;
  radius?: string;
  'shadow-color'?: string;
  'shadow-opacity'?: string;
  'shadow-blur'?: string;
  'shadow-spread'?: string;
  'shadow-offset-x'?: string;
  'shadow-offset-y'?: string;
  'letter-spacing'?: string;
  spacing?: string;
};

/** Full theme styles for light and dark */
export type ExtendedThemeStyles = {
  light?: Partial<ThemeStyleProps>;
  dark?: Partial<ThemeStyleProps>;
};

/** HSL adjustments applied globally to colors */
export type HslAdjustments = {
  hueShift: number;
  saturationScale: number;
  lightnessScale: number;
};

/** Default font stacks */
export const DEFAULT_FONT_SANS =
  "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
export const DEFAULT_FONT_SERIF =
  'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
export const DEFAULT_FONT_MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/** Default values for extended (non-color) style props */
export const defaultExtendedStyleProps: Pick<
  ThemeStyleProps,
  | 'font-sans'
  | 'font-serif'
  | 'font-mono'
  | 'radius'
  | 'shadow-color'
  | 'shadow-opacity'
  | 'shadow-blur'
  | 'shadow-spread'
  | 'shadow-offset-x'
  | 'shadow-offset-y'
  | 'letter-spacing'
  | 'spacing'
> = {
  'font-sans': DEFAULT_FONT_SANS,
  'font-serif': DEFAULT_FONT_SERIF,
  'font-mono': DEFAULT_FONT_MONO,
  radius: '0.625rem',
  'shadow-color': 'oklch(0 0 0)',
  'shadow-opacity': '0.1',
  'shadow-blur': '3px',
  'shadow-spread': '0px',
  'shadow-offset-x': '0',
  'shadow-offset-y': '1px',
  'letter-spacing': '0em',
  spacing: '0.25rem',
};

export const defaultHslAdjustments: HslAdjustments = {
  hueShift: 0,
  saturationScale: 1,
  lightnessScale: 1,
};

/** Type guard: key is a common (shared) style key */
export function isCommonStyleKey(key: string): key is CommonStyleKey {
  return (COMMON_STYLE_KEYS as readonly string[]).includes(key);
}

/** Parse extended theme from JSON string (tenant.themeColors) */
export function parseExtendedTheme(json: string | null | undefined): ExtendedThemeStyles | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as ExtendedThemeStyles;
  } catch {
    return null;
  }
}

/** Serialize extended theme to JSON string */
export function serializeExtendedTheme(theme: ExtendedThemeStyles): string {
  return JSON.stringify(theme);
}
