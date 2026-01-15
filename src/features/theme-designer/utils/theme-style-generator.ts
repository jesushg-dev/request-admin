import { ThemeEditorState } from "@/types/editor";
import { colorFormatter } from "./color-converter";
import { ColorFormat } from "@/types";
import { getShadowMap } from "./shadows";
import { defaultLightThemeStyles } from "@/config/theme";
import { ThemeStyles } from "@/features/theme-designer/types/theme";

type ThemeMode = "light" | "dark";

const generateColorVariables = (
  themeStyles: ThemeStyles,
  mode: ThemeMode,
  formatColor: (color: string) => string
): string => {
  const styles = themeStyles[mode];
  return `
  --background: ${formatColor(styles.background || "")};
  --foreground: ${formatColor(styles.foreground || "")};
  ${styles.card ? `--card: ${formatColor(styles.card)};` : ""}
  ${styles["card-foreground"] ? `--card-foreground: ${formatColor(styles["card-foreground"])};` : ""}
  ${styles.popover ? `--popover: ${formatColor(styles.popover)};` : ""}
  ${styles["popover-foreground"] ? `--popover-foreground: ${formatColor(styles["popover-foreground"])};` : ""}
  ${styles.primary ? `--primary: ${formatColor(styles.primary)};` : ""}
  ${styles["primary-foreground"] ? `--primary-foreground: ${formatColor(styles["primary-foreground"])};` : ""}
  ${styles.secondary ? `--secondary: ${formatColor(styles.secondary)};` : ""}
  ${styles["secondary-foreground"] ? `--secondary-foreground: ${formatColor(styles["secondary-foreground"])};` : ""}
  ${styles.muted ? `--muted: ${formatColor(styles.muted)};` : ""}
  ${styles["muted-foreground"] ? `--muted-foreground: ${formatColor(styles["muted-foreground"])};` : ""}
  ${styles.accent ? `--accent: ${formatColor(styles.accent)};` : ""}
  ${styles["accent-foreground"] ? `--accent-foreground: ${formatColor(styles["accent-foreground"])};` : ""}
  ${styles.destructive ? `--destructive: ${formatColor(styles.destructive)};` : ""}
  ${styles["destructive-foreground"] ? `--destructive-foreground: ${formatColor(styles["destructive-foreground"])};` : ""}
  ${styles.border ? `--border: ${formatColor(styles.border)};` : ""}
  ${styles.input ? `--input: ${formatColor(styles.input)};` : ""}
  ${styles.ring ? `--ring: ${formatColor(styles.ring)};` : ""}
  ${styles["chart-1"] ? `--chart-1: ${formatColor(styles["chart-1"])};` : ""}
  ${styles["chart-2"] ? `--chart-2: ${formatColor(styles["chart-2"])};` : ""}
  ${styles["chart-3"] ? `--chart-3: ${formatColor(styles["chart-3"])};` : ""}
  ${styles["chart-4"] ? `--chart-4: ${formatColor(styles["chart-4"])};` : ""}
  ${styles["chart-5"] ? `--chart-5: ${formatColor(styles["chart-5"])};` : ""}
  ${styles.sidebar ? `--sidebar: ${formatColor(styles.sidebar)};` : ""}
  ${styles["sidebar-foreground"] ? `--sidebar-foreground: ${formatColor(styles["sidebar-foreground"])};` : ""}
  ${styles["sidebar-primary"] ? `--sidebar-primary: ${formatColor(styles["sidebar-primary"])};` : ""}
  ${styles["sidebar-primary-foreground"] ? `--sidebar-primary-foreground: ${formatColor(styles["sidebar-primary-foreground"])};` : ""}
  ${styles["sidebar-accent"] ? `--sidebar-accent: ${formatColor(styles["sidebar-accent"])};` : ""}
  ${styles["sidebar-accent-foreground"] ? `--sidebar-accent-foreground: ${formatColor(styles["sidebar-accent-foreground"])};` : ""}
  ${styles["sidebar-border"] ? `--sidebar-border: ${formatColor(styles["sidebar-border"])};` : ""}
  ${styles["sidebar-ring"] ? `--sidebar-ring: ${formatColor(styles["sidebar-ring"])};` : ""}`;
};

const generateFontVariables = (themeStyles: ThemeStyles, mode: ThemeMode): string => {
  const styles = themeStyles[mode];
  return `
  ${styles["font-sans"] ? `--font-sans: ${styles["font-sans"]};` : ""}
  ${styles["font-serif"] ? `--font-serif: ${styles["font-serif"]};` : ""}
  ${styles["font-mono"] ? `--font-mono: ${styles["font-mono"]};` : ""}`;
};

const generateShadowVariables = (shadowMap: Record<string, string>): string => {
  return `
  ${shadowMap["shadow-2xs"] ? `--shadow-2xs: ${shadowMap["shadow-2xs"]};` : ""}
  ${shadowMap["shadow-xs"] ? `--shadow-xs: ${shadowMap["shadow-xs"]};` : ""}
  ${shadowMap["shadow-sm"] ? `--shadow-sm: ${shadowMap["shadow-sm"]};` : ""}
  ${shadowMap["shadow"] ? `--shadow: ${shadowMap["shadow"]};` : ""}
  ${shadowMap["shadow-md"] ? `--shadow-md: ${shadowMap["shadow-md"]};` : ""}
  ${shadowMap["shadow-lg"] ? `--shadow-lg: ${shadowMap["shadow-lg"]};` : ""}
  ${shadowMap["shadow-xl"] ? `--shadow-xl: ${shadowMap["shadow-xl"]};` : ""}
  ${shadowMap["shadow-2xl"] ? `--shadow-2xl: ${shadowMap["shadow-2xl"]};` : ""}`;
};

const generateRawShadowVariables = (themeStyles: ThemeStyles, mode: ThemeMode): string => {
  const styles = themeStyles[mode];
  return `
  ${styles["shadow-offset-x"] ? `--shadow-x: ${styles["shadow-offset-x"]};` : ""}
  ${styles["shadow-offset-y"] ? `--shadow-y: ${styles["shadow-offset-y"]};` : ""}
  ${styles["shadow-blur"] ? `--shadow-blur: ${styles["shadow-blur"]};` : ""}
  ${styles["shadow-spread"] ? `--shadow-spread: ${styles["shadow-spread"]};` : ""}
  ${styles["shadow-opacity"] ? `--shadow-opacity: ${styles["shadow-opacity"]};` : ""}
  ${styles["shadow-color"] ? `--shadow-color: ${styles["shadow-color"]};` : ""}`;
};

const generateTrackingVariables = (themeStyles: ThemeStyles): string => {
  const styles = themeStyles["light"];
  if (styles["letter-spacing"] === "0em" || !styles["letter-spacing"]) {
    return "";
  }
  return `

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em)`;
};

const generateThemeVariables = (
  themeStyles: ThemeStyles,
  mode: ThemeMode,
  formatColor: (color: string) => string
): string => {
  const selector = mode === "dark" ? ".dark" : ":root";
  const colorVars = generateColorVariables(themeStyles, mode, formatColor);
  const fontVars = generateFontVariables(themeStyles, mode);
  const radiusVar = `\n  --radius: ${themeStyles[mode].radius || "0.5rem"};`;
  const shadowVars = generateShadowVariables(
    getShadowMap({ styles: themeStyles, currentMode: mode })
  );
  const rawShadowVars = generateRawShadowVariables(themeStyles, mode);
  const spacingVar =
    mode === "light"
      ? `\n  --spacing: ${themeStyles["light"].spacing ?? defaultLightThemeStyles.spacing ?? "0.5rem"};`
      : "";

  const trackingVars =
    mode === "light"
      ? `\n  --tracking-normal: ${themeStyles["light"]["letter-spacing"] ?? defaultLightThemeStyles["letter-spacing"] ?? "0em"};`
      : "";

  return (
    selector +
    " {" +
    colorVars +
    fontVars +
    radiusVar +
    rawShadowVars +
    shadowVars +
    trackingVars +
    spacingVar +
    "\n}"
  );
};

const generateTailwindV4ThemeInline = (themeStyles: ThemeStyles): string => {
  return `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);${generateTrackingVariables(themeStyles)}
}`;
};

const generateTailwindV3Config = (
  _themeStyles: ThemeStyles,
  colorFormat: ColorFormat = "hsl"
): string => {
  const colorToken = (key: string) => {
    return colorFormat === "hsl" ? `"hsl(var(--${key}))"` : `"var(--${key})"`;
  };

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: ${colorToken("border")},
        input: ${colorToken("input")},
        ring: ${colorToken("ring")},
        background: ${colorToken("background")},
        foreground: ${colorToken("foreground")},
        primary: {
          DEFAULT: ${colorToken("primary")},
          foreground: ${colorToken("primary-foreground")},
        },
        secondary: {
          DEFAULT: ${colorToken("secondary")},
          foreground: ${colorToken("secondary-foreground")},
        },
        destructive: {
          DEFAULT: ${colorToken("destructive")},
          foreground: ${colorToken("destructive-foreground")},
        },
        muted: {
            DEFAULT: ${colorToken("muted")},
          foreground: ${colorToken("muted-foreground")},
        },
        accent: {
          DEFAULT: ${colorToken("accent")},
          foreground: ${colorToken("accent-foreground")},
        },
        popover: {
          DEFAULT: ${colorToken("popover")},
          foreground: ${colorToken("popover-foreground")},
        },
        card: {
          DEFAULT: ${colorToken("card")},
          foreground: ${colorToken("card-foreground")},
        },
        sidebar: {
          DEFAULT: ${colorToken("sidebar")},
          foreground: ${colorToken("sidebar-foreground")},
          primary: ${colorToken("sidebar-primary")},
          "primary-foreground": ${colorToken("sidebar-primary-foreground")},
          accent: ${colorToken("sidebar-accent")},
          "accent-foreground": ${colorToken("sidebar-accent-foreground")},
          border: ${colorToken("sidebar-border")},
          ring: ${colorToken("sidebar-ring")},
        },
        chart: {
          1: ${colorToken("chart-1")},
          2: ${colorToken("chart-2")},
          3: ${colorToken("chart-3")},
          4: ${colorToken("chart-4")},
          5: ${colorToken("chart-5")},
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
}`;
};

export const generateThemeCode = (
  themeEditorState: ThemeEditorState,
  colorFormat: ColorFormat = "hsl",
  tailwindVersion: "3" | "4" = "3"
): string => {
  if (
    !themeEditorState ||
    !("light" in themeEditorState.styles) ||
    !("dark" in themeEditorState.styles)
  ) {
    throw new Error("Invalid theme styles: missing light or dark mode");
  }

  const themeStyles = themeEditorState.styles as ThemeStyles;
  const formatColor = (color: string) => colorFormatter(color, colorFormat, tailwindVersion);

  const lightTheme = generateThemeVariables(themeStyles, "light", formatColor);
  const darkTheme = generateThemeVariables(themeStyles, "dark", formatColor);
  const tailwindV4Theme =
    tailwindVersion === "4" ? `\n\n${generateTailwindV4ThemeInline(themeStyles)}` : "";

  const bodyLetterSpacing =
    themeStyles["light"]["letter-spacing"] !== "0em" && themeStyles["light"]["letter-spacing"]
      ? "\n\nbody {\n  letter-spacing: var(--tracking-normal);\n}"
      : "";

  return `${lightTheme}\n\n${darkTheme}${tailwindV4Theme}${bodyLetterSpacing}`;
};

export const generateTailwindConfigCode = (
  themeEditorState: ThemeEditorState,
  colorFormat: ColorFormat = "hsl",
  _tailwindVersion: "3" | "4" = "3"
): string => {
  if (
    !themeEditorState ||
    !("light" in themeEditorState.styles) ||
    !("dark" in themeEditorState.styles)
  ) {
    throw new Error("Invalid theme styles: missing light or dark mode");
  }

  const themeStyles = themeEditorState.styles as ThemeStyles;
  return generateTailwindV3Config(themeStyles, colorFormat);
};

