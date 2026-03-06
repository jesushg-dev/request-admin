/**
 * Built-in theme presets (inspired by tweakcn).
 * Used as starting points for tenant theme customization.
 */

import type { ExtendedThemeStyles } from '@/types/extended-theme';
import { defaultThemeColors } from '@/types/theme-colors';
import { defaultExtendedStyleProps } from '@/types/extended-theme';

export type ThemePresetDefinition = {
  label: string;
  styles: ExtendedThemeStyles;
};

/** Merge preset styles with defaults (colors + extended props) */
export function mergePresetWithDefaults(preset: ExtendedThemeStyles): ExtendedThemeStyles {
  const defaultLight = { ...defaultThemeColors.light, ...defaultExtendedStyleProps };
  const defaultDark = { ...defaultThemeColors.dark, ...defaultExtendedStyleProps };
  return {
    light: { ...defaultLight, ...preset.light },
    dark: { ...defaultDark, ...preset.dark },
  };
}

/** Get built-in preset by name; returns null if not found */
export function getBuiltInPreset(name: string): ThemePresetDefinition | null {
  const preset = builtInPresets[name];
  if (!preset) return null;
  return { label: preset.label, styles: mergePresetWithDefaults(preset.styles) };
}

/** List of built-in preset names */
export const builtInPresetNames = ['default', 'modern-minimal', 'violet-bloom', 'slate'] as const;

/** Built-in presets (subset for integration; colors in hex/oklch, optional extended props) */
export const builtInPresets: Record<string, ThemePresetDefinition> = {
  default: {
    label: 'Default',
    styles: {
      light: { ...defaultThemeColors.light, ...defaultExtendedStyleProps },
      dark: { ...defaultThemeColors.dark, ...defaultExtendedStyleProps },
    },
  },
  'modern-minimal': {
    label: 'Modern Minimal',
    styles: {
      light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.2 0 0)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.2 0 0)',
        primary: 'oklch(0.55 0.2 250)',
        'primary-foreground': 'oklch(0.985 0 0)',
        secondary: 'oklch(0.97 0 0)',
        'secondary-foreground': 'oklch(0.35 0 0)',
        muted: 'oklch(0.97 0 0)',
        'muted-foreground': 'oklch(0.45 0 0)',
        accent: 'oklch(0.95 0.02 250)',
        'accent-foreground': 'oklch(0.25 0.1 250)',
        border: 'oklch(0.92 0 0)',
        input: 'oklch(0.92 0 0)',
        ring: 'oklch(0.55 0.2 250)',
        radius: '0.375rem',
        sidebar: 'oklch(0.98 0 0)',
        'sidebar-foreground': 'oklch(0.2 0 0)',
        'sidebar-primary': 'oklch(0.55 0.2 250)',
        'sidebar-primary-foreground': 'oklch(0.985 0 0)',
        'sidebar-accent': 'oklch(0.95 0.02 250)',
        'sidebar-accent-foreground': 'oklch(0.25 0.1 250)',
        'sidebar-border': 'oklch(0.92 0 0)',
        'sidebar-ring': 'oklch(0.55 0.2 250)',
        ...defaultExtendedStyleProps,
      },
      dark: {
        background: 'oklch(0.145 0 0)',
        foreground: 'oklch(0.92 0 0)',
        card: 'oklch(0.2 0 0)',
        'card-foreground': 'oklch(0.92 0 0)',
        primary: 'oklch(0.55 0.2 250)',
        'primary-foreground': 'oklch(0.985 0 0)',
        secondary: 'oklch(0.2 0 0)',
        'secondary-foreground': 'oklch(0.92 0 0)',
        muted: 'oklch(0.22 0 0)',
        'muted-foreground': 'oklch(0.65 0 0)',
        accent: 'oklch(0.25 0.05 250)',
        'accent-foreground': 'oklch(0.85 0.05 250)',
        border: 'oklch(0.3 0 0)',
        input: 'oklch(0.3 0 0)',
        ring: 'oklch(0.55 0.2 250)',
        radius: '0.375rem',
        sidebar: 'oklch(0.145 0 0)',
        'sidebar-foreground': 'oklch(0.92 0 0)',
        'sidebar-primary': 'oklch(0.55 0.2 250)',
        'sidebar-primary-foreground': 'oklch(0.985 0 0)',
        'sidebar-accent': 'oklch(0.25 0.05 250)',
        'sidebar-accent-foreground': 'oklch(0.85 0.05 250)',
        'sidebar-border': 'oklch(0.3 0 0)',
        'sidebar-ring': 'oklch(0.45 0 0)',
        ...defaultExtendedStyleProps,
      },
    },
  },
  'violet-bloom': {
    label: 'Violet Bloom',
    styles: {
      light: {
        primary: 'oklch(0.55 0.25 290)',
        'primary-foreground': 'oklch(0.985 0 0)',
        secondary: 'oklch(0.95 0.02 290)',
        'secondary-foreground': 'oklch(0.25 0.1 260)',
        accent: 'oklch(0.94 0.03 290)',
        'accent-foreground': 'oklch(0.3 0.15 260)',
        ring: 'oklch(0.55 0.25 290)',
        radius: '1rem',
        'sidebar-primary': 'oklch(0.55 0.25 290)',
        'letter-spacing': '-0.01em',
        ...defaultThemeColors.light,
        ...defaultExtendedStyleProps,
      },
      dark: {
        primary: 'oklch(0.65 0.2 290)',
        'primary-foreground': 'oklch(0.985 0 0)',
        secondary: 'oklch(0.25 0.03 290)',
        'secondary-foreground': 'oklch(0.92 0 0)',
        accent: 'oklch(0.22 0.04 290)',
        'accent-foreground': 'oklch(0.8 0.08 250)',
        ring: 'oklch(0.55 0.25 290)',
        radius: '1rem',
        'sidebar-primary': 'oklch(0.55 0.25 290)',
        'letter-spacing': '-0.01em',
        ...defaultThemeColors.dark,
        ...defaultExtendedStyleProps,
      },
    },
  },
  slate: {
    label: 'Slate',
    styles: {
      light: {
        primary: 'oklch(0.35 0.02 250)',
        'primary-foreground': 'oklch(0.98 0 0)',
        secondary: 'oklch(0.96 0.005 250)',
        'secondary-foreground': 'oklch(0.3 0.02 250)',
        muted: 'oklch(0.96 0.005 250)',
        'muted-foreground': 'oklch(0.4 0.02 250)',
        accent: 'oklch(0.95 0.01 250)',
        border: 'oklch(0.9 0.01 250)',
        input: 'oklch(0.9 0.01 250)',
        ring: 'oklch(0.35 0.02 250)',
        radius: '0.5rem',
        ...defaultThemeColors.light,
        ...defaultExtendedStyleProps,
      },
      dark: {
        primary: 'oklch(0.9 0.01 250)',
        'primary-foreground': 'oklch(0.2 0.02 250)',
        secondary: 'oklch(0.25 0.02 250)',
        'secondary-foreground': 'oklch(0.92 0 0)',
        muted: 'oklch(0.28 0.02 250)',
        'muted-foreground': 'oklch(0.6 0.02 250)',
        accent: 'oklch(0.28 0.02 250)',
        border: 'oklch(0.35 0.02 250)',
        input: 'oklch(0.32 0.02 250)',
        ring: 'oklch(0.55 0.02 250)',
        radius: '0.5rem',
        ...defaultThemeColors.dark,
        ...defaultExtendedStyleProps,
      },
    },
  },
};
