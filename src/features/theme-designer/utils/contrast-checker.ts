/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
function getLuminance(color: string): number {
  // Parse color to RGB
  const rgb = parseColorToRgb(color);
  if (!rgb) return 0;

  // Normalize RGB values to 0-1 range
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Parse a color string to RGB values
 * Supports hex, rgb, rgba, hsl, hsla formats
 */
function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  if (typeof window === "undefined") {
    // Server-side: basic parsing
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
      return {
        r: parseInt(hexMatch[1], 16),
        g: parseInt(hexMatch[2], 16),
        b: parseInt(hexMatch[3], 16),
      };
    }
    return null;
  }

  try {
    // Use browser's color parsing for accuracy
    const tempEl = document.createElement("div");
    tempEl.style.color = color;
    document.body.appendChild(tempEl);

    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    // Parse RGB values from computed color
    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return null;

    return {
      r: parseInt(rgbMatch[1] || "0", 10),
      g: parseInt(rgbMatch[2] || "0", 10),
      b: parseInt(rgbMatch[3] || "0", 10),
    };
  } catch (error) {
    console.warn("Failed to parse color:", color, error);
    return null;
  }
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21 (WCAG 2.1)
 */
export function getContrastRatio(foreground: string, background: string): string {
  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return ratio.toFixed(2);
}

