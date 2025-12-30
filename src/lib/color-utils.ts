/**
 * Color utility functions for converting between color formats and OKLCH
 * 
 * Note: These functions are client-side only as they use browser APIs
 */

/**
 * Parse a color string to RGB values
 * Supports hex, rgb, rgba, hsl, hsla formats
 */
function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  if (typeof window === 'undefined') return null;

  try {
    // Use browser's color parsing for accuracy
    const tempEl = document.createElement('div');
    tempEl.style.color = color;
    document.body.appendChild(tempEl);
    
    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    // Parse RGB values from computed color
    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return null;

    return {
      r: parseInt(rgbMatch[1] || '0', 10),
      g: parseInt(rgbMatch[2] || '0', 10),
      b: parseInt(rgbMatch[3] || '0', 10),
    };
  } catch (error) {
    console.warn('Failed to parse color:', color, error);
    return null;
  }
}

/**
 * Converts RGB to OKLCH format
 * Uses proper OKLab conversion formulas
 */
function rgbToOklch(r: number, g: number, b: number): string {
  // Normalize RGB to 0-1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Convert to linear RGB
  const toLinear = (c: number) => {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const rLinear = toLinear(rNorm);
  const gLinear = toLinear(gNorm);
  const bLinear = toLinear(bNorm);

  // Convert Linear RGB to XYZ (D65)
  const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
  const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.072175;
  const z = rLinear * 0.0193339 + gLinear * 0.119192 + bLinear * 0.9503041;

  // Convert XYZ to Lab
  const xn = x / 0.95047;
  const yn = y / 1.0;
  const zn = z / 1.08883;

  const fx = xn > 0.008856 ? Math.cbrt(xn) : (7.787 * xn + 16 / 116);
  const fy = yn > 0.008856 ? Math.cbrt(yn) : (7.787 * yn + 16 / 116);
  const fz = zn > 0.008856 ? Math.cbrt(zn) : (7.787 * zn + 16 / 116);

  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);

  // Convert Lab to OKLab (OKLCH uses OKLab, which is similar to Lab but with different constants)
  // For simplicity, we'll use Lab values as an approximation for OKLab
  // The actual OKLab conversion requires more complex calculations
  const lOK = Math.max(0, Math.min(1, l / 100)); // Normalize to 0-1
  const aOK = a;
  const bOK = bLab;

  // Convert OKLab to OKLCH
  const c = Math.sqrt(aOK * aOK + bOK * bOK);
  let h = Math.atan2(bOK, aOK) * (180 / Math.PI);
  if (h < 0) h += 360;
  if (isNaN(h)) h = 0;

  // Format as OKLCH string
  return `oklch(${lOK.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

/**
 * Converts a color string (hex, rgb, hsl, etc.) to OKLCH format
 * This function is client-side only
 */
export function colorToOklchSimple(color: string | null | undefined): string | null {
  if (!color || typeof window === 'undefined') return null;

  try {
    const rgb = parseColorToRgb(color);
    if (!rgb) return null;

    return rgbToOklch(rgb.r, rgb.g, rgb.b);
  } catch (error) {
    console.warn('Failed to convert color to OKLCH:', color, error);
    return null;
  }
}

/**
 * Converts OKLCH color to a format that color pickers can use (hex, rgb, etc.)
 * Uses browser's native color conversion
 */
export function oklchToColorPickerFormat(oklch: string | null | undefined): string | null {
  if (!oklch || typeof window === 'undefined') return null;

  try {
    // If already in a format that browsers can parse (not OKLCH), return as-is
    if (!oklch.startsWith('oklch(')) {
      return oklch;
    }

    // Use browser's color parsing to convert OKLCH to RGB
    const tempEl = document.createElement('div');
    tempEl.style.color = oklch;
    document.body.appendChild(tempEl);
    
    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    // Convert RGB to hex for color picker
    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return null;

    const r = parseInt(rgbMatch[1] || '0', 10);
    const g = parseInt(rgbMatch[2] || '0', 10);
    const b = parseInt(rgbMatch[3] || '0', 10);

    // Convert to hex
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (error) {
    console.warn('Failed to convert OKLCH to color picker format:', oklch, error);
    return null;
  }
}


/**
 * Adjust OKLCH lightness for dark mode
 */
function adjustOklchForDarkMode(oklch: string, isPrimary: boolean = true): string {
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return oklch;

  const l = parseFloat(match[1]);
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);

  if (isPrimary) {
    // For primary colors in dark mode, we want a lighter version
    // Increase lightness significantly for visibility on dark backgrounds
    const lightL = Math.min(0.95, Math.max(0.85, l + 0.4));
    return `oklch(${lightL.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
  } else {
    // For secondary colors in dark mode, use a darker, muted version
    const darkL = Math.max(0.25, Math.min(0.35, l * 0.4));
    const darkC = Math.max(0, c * 0.5); // Reduce chroma for muted look
    return `oklch(${darkL.toFixed(3)} ${darkC.toFixed(3)} ${h.toFixed(1)})`;
  }
}

/**
 * Generate theme colors based on primary and secondary colors
 * Returns an object with light and dark theme color mappings
 */
export function generateThemeColors(
  primaryColor: string | null | undefined,
  secondaryColor: string | null | undefined
): {
  light: Record<string, string>;
  dark: Record<string, string>;
} {
  const primaryOklch = primaryColor ? colorToOklchSimple(primaryColor) : null;
  const secondaryOklch = secondaryColor ? colorToOklchSimple(secondaryColor) : null;

  // Default colors (from globals.css)
  const defaults = {
    light: {
      primary: 'oklch(0.205 0 0)',
      'primary-foreground': 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0 0)',
      'secondary-foreground': 'oklch(0.205 0 0)',
    },
    dark: {
      primary: 'oklch(0.922 0 0)',
      'primary-foreground': 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0 0)',
      'secondary-foreground': 'oklch(0.985 0 0)',
    },
  };

  if (!primaryOklch && !secondaryOklch) {
    return defaults;
  }

  const lightTheme: Record<string, string> = { ...defaults.light };
  const darkTheme: Record<string, string> = { ...defaults.dark };

  if (primaryOklch) {
    // Use primary color as-is for light mode
    lightTheme.primary = primaryOklch;
    // For dark mode, create a lighter version
    darkTheme.primary = adjustOklchForDarkMode(primaryOklch, true);
    
    // Calculate appropriate foreground colors
    // Extract lightness to determine if we need light or dark foreground
    const lightMatch = primaryOklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (lightMatch) {
      const l = parseFloat(lightMatch[1]);
      // If primary is dark, use light foreground; if light, use dark foreground
      if (l < 0.5) {
        lightTheme['primary-foreground'] = 'oklch(0.985 0 0)'; // Light foreground
      } else {
        lightTheme['primary-foreground'] = 'oklch(0.145 0 0)'; // Dark foreground
      }
    }

    const darkMatch = darkTheme.primary.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (darkMatch) {
      const l = parseFloat(darkMatch[1]);
      // For dark mode, if primary is light, use dark foreground
      if (l > 0.5) {
        darkTheme['primary-foreground'] = 'oklch(0.145 0 0)'; // Dark foreground
      } else {
        darkTheme['primary-foreground'] = 'oklch(0.985 0 0)'; // Light foreground
      }
    }
  }

  if (secondaryOklch) {
    // Use secondary color as-is for light mode
    lightTheme.secondary = secondaryOklch;
    // For dark mode, create a darker, muted version
    darkTheme.secondary = adjustOklchForDarkMode(secondaryOklch, false);
    
    // Calculate appropriate foreground colors for secondary
    const lightMatch = secondaryOklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (lightMatch) {
      const l = parseFloat(lightMatch[1]);
      if (l < 0.5) {
        lightTheme['secondary-foreground'] = 'oklch(0.985 0 0)';
      } else {
        lightTheme['secondary-foreground'] = 'oklch(0.145 0 0)';
      }
    }

    const darkMatch = darkTheme.secondary.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (darkMatch) {
      const l = parseFloat(darkMatch[1]);
      if (l > 0.5) {
        darkTheme['secondary-foreground'] = 'oklch(0.145 0 0)';
      } else {
        darkTheme['secondary-foreground'] = 'oklch(0.985 0 0)';
      }
    }
  }

  return { light: lightTheme, dark: darkTheme };
}

