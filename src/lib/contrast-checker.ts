/**
 * Contrast utilities for theme colors (inspired by tweakcn).
 * WCAG relative luminance and contrast ratio.
 */

/**
 * Get relative luminance for a color (0–1).
 * Works with hex; for other formats convert to rgb first.
 */
function getLuminanceHex(hex: string): number {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) return 0;

  const r = parseInt(result[1] ?? '0', 16) / 255;
  const g = parseInt(result[2] ?? '0', 16) / 255;
  const b = parseInt(result[3] ?? '0', 16) / 255;

  const rs = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gs = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bs = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Get contrast ratio between two luminances (1–21).
 */
export function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Contrast ratio for two hex colors.
 */
export function getContrastRatioHex(hex1: string, hex2: string): number {
  return getContrastRatio(getLuminanceHex(hex1), getLuminanceHex(hex2));
}

/**
 * Whether contrast passes WCAG AA for normal text (min ratio 4.5).
 */
export function passesWcagAaNormal(ratio: number): boolean {
  return ratio >= 4.5;
}

/**
 * Whether contrast passes WCAG AA for large text (min ratio 3).
 */
export function passesWcagAaLarge(ratio: number): boolean {
  return ratio >= 3;
}

/**
 * Suggested foreground (black or white) for a background hex.
 * Re-export of existing getContrastColor from color.ts for consistency.
 */
export function getContrastColor(hex: string): '#000000' | '#ffffff' {
  const luminance = getLuminanceHex(hex);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
