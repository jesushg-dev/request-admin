import { z } from "zod";

export const themeStylePropsSchema = z.object({
  background: z.string().describe("The default background color, paired with `foreground`."),
  foreground: z.string().describe("Paired with `background`."),
  card: z.string().optional().describe("The background color for cards, paired with `card-foreground`."),
  "card-foreground": z.string().optional().describe("Paired with `card`."),
  popover: z.string().optional().describe("The background color for popovers, paired with `popover-foreground`."),
  "popover-foreground": z.string().optional().describe("Paired with `popover`."),
  primary: z.string().optional().describe("The main color, paired with `primary-foreground`."),
  "primary-foreground": z.string().optional().describe("Paired with `primary`."),
  secondary: z.string().optional().describe("A secondary color, paired with `secondary-foreground`."),
  "secondary-foreground": z.string().optional().describe("Paired with `secondary`."),
  muted: z.string().optional().describe("A muted background color, paired with `muted-foreground`."),
  "muted-foreground": z.string().optional().describe("Paired with `muted`."),
  accent: z.string().optional().describe("Subtle color for hover or highlight, paired with `accent-foreground`."),
  "accent-foreground": z.string().optional().describe("Paired with `accent`."),
  destructive: z.string().optional().describe("Color for destructive actions, paired with `destructive-foreground`."),
  "destructive-foreground": z.string().optional().describe("Paired with `destructive`."),
  border: z.string().optional().describe("The color for borders."),
  input: z.string().optional().describe("The background color for input fields."),
  ring: z.string().optional().describe("The color for focus rings."),
  "chart-1": z.string().optional(),
  "chart-2": z.string().optional(),
  "chart-3": z.string().optional(),
  "chart-4": z.string().optional(),
  "chart-5": z.string().optional(),
  sidebar: z.string().optional().describe("The background color for the sidebar, paired with `sidebar-foreground`."),
  "sidebar-foreground": z.string().optional().describe("Paired with `sidebar`."),
  "sidebar-primary": z.string().optional().describe("The primary color for sidebar elements, paired with `sidebar-primary-foreground`."),
  "sidebar-primary-foreground": z.string().optional().describe("Paired with `sidebar-primary`."),
  "sidebar-accent": z.string().optional().describe("An accent color for the sidebar, paired with `sidebar-accent-foreground`."),
  "sidebar-accent-foreground": z.string().optional().describe("Paired with `sidebar-accent`."),
  "sidebar-border": z.string().optional().describe("The color for borders within the sidebar."),
  "sidebar-ring": z.string().optional().describe("The color for focus rings within the sidebar."),
  "font-sans": z.string().optional().describe("Primary UI font. May be serif, sans, monospace, or display depending on the theme vibe."),
  "font-serif": z.string().optional().describe("The preferred serif font family."),
  "font-mono": z.string().optional().describe("The preferred monospace font family. Used for code blocks."),
  radius: z.string().optional().describe("The global border-radius for components. Use 0rem for sharp corners."),
  "shadow-color": z.string().optional(),
  "shadow-opacity": z.string().optional(),
  "shadow-blur": z.string().optional(),
  "shadow-spread": z.string().optional(),
  "shadow-offset-x": z.string().optional(),
  "shadow-offset-y": z.string().optional(),
  "letter-spacing": z.string().optional().describe("The global letter spacing for text."),
  spacing: z.string().optional(),
}).catchall(z.string().optional());

export const themeStylesSchema = z.object({
  light: themeStylePropsSchema,
  dark: themeStylePropsSchema,
});

export type ThemeStyleProps = z.infer<typeof themeStylePropsSchema>;
export type ThemeStyles = z.infer<typeof themeStylesSchema>;

export const themeStylePropsSchemaWithoutSpacing = themeStylePropsSchema.omit({
  spacing: true,
});

export const themeStylesSchemaWithoutSpacing = z.object({
  light: themeStylePropsSchemaWithoutSpacing,
  dark: themeStylePropsSchemaWithoutSpacing,
});

export type ThemeStylesWithoutSpacing = z.infer<typeof themeStylesSchemaWithoutSpacing>;

export interface ThemeEditorPreviewProps {
  styles: ThemeStyles;
  currentMode: "light" | "dark";
}

export interface ThemeEditorControlsProps {
  styles: ThemeStyles;
  currentMode: "light" | "dark";
  onChange: (styles: ThemeStyles) => void;
  themePromise: Promise<Theme | null>;
}

export type ThemePreset = {
  source?: "SAVED" | "BUILT_IN";
  createdAt?: string;
  label?: string;
  styles: {
    light: Partial<ThemeStyleProps>;
    dark: Partial<ThemeStyleProps>;
  };
};

// Theme type based on database model
export type Theme = {
  id: string;
  userId: string;
  name: string;
  styles: ThemeStyles;
  createdAt: Date;
  updatedAt: Date;
};
