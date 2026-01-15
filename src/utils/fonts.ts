import { FontInfo } from "@/types/fonts";

export function buildFontFamily(family: string, category: string): string {
    return `'${family}', ${category}`;
}

const SYSTEM_FONTS = [
  "system-ui",
  "-apple-system",
  "blinkmacsystemfont",
  "segoe ui",
  "roboto",
  "helvetica neue",
  "arial",
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
];

// Extract font family name from CSS font-family value
// e.g., "Inter, ui-sans-serif, system-ui, sans-serif" -> "Inter"
export function extractFontFamily(fontFamilyValue: string): string | null {
  if (!fontFamilyValue) return null;

  // Split by comma and get the first font
  const firstFont = fontFamilyValue.split(",")[0].trim();

  // Remove quotes if present
  const cleanFont = firstFont.replace(/['"]/g, "");

  // Skip system fonts
  if (SYSTEM_FONTS.includes(cleanFont.toLowerCase())) return null;
  return cleanFont;
}

// Get default weights for a font based on available variants
export function getDefaultWeights(variants: string[]): string[] {
  const weightMap = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
  const availableWeights = variants.filter((variant) => weightMap.includes(variant));

  if (availableWeights.length === 0) return ["400"]; // Fallback to normal weight

  const preferredWeights = ["400", "500", "600", "700"];
  const selectedWeights = preferredWeights.filter((weight) => availableWeights.includes(weight));

  // If none of the preferred weights are available, use the first two available
  if (selectedWeights.length === 0) {
    const fallbackWeights = availableWeights.slice(0, 2);
    return fallbackWeights.sort((a, b) => parseInt(a) - parseInt(b));
  }

  // Return up to 4 weights, starting with preferred ones
  const finalWeights = [
    ...selectedWeights,
    ...availableWeights.filter((w) => !selectedWeights.includes(w)),
  ].slice(0, 4);

  // Sort weights numerically for Google Fonts API requirement
  return finalWeights.sort((a, b) => parseInt(a) - parseInt(b));
}

// Check if a font is available using the native document.fonts API
export function isFontLoaded(family: string, weight = "400"): boolean {
  if (typeof document === "undefined" || !document.fonts) return false;

  // Use the native FontFaceSet.check() method
  return document.fonts.check(`${weight} 16px "${family}"`);
}

// Wait for a font to load using the native document.fonts API
export async function waitForFont(
  family: string,
  weight = "400",
  timeout = 3000
): Promise<boolean> {
  if (typeof document === "undefined" || !document.fonts) return false;

  const font = `${weight} 16px "${family}"`;
  const startTime = Date.now();

  return new Promise((resolve) => {
    const checkFont = () => {
      if (document.fonts.check(font)) {
        resolve(true);
        return;
      }

      if (Date.now() - startTime >= timeout) {
        resolve(false);
        return;
      }

      setTimeout(checkFont, 100);
    };

    checkFont();
  });
}