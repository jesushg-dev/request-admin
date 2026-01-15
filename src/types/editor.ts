import { ThemeStyles } from "@/features/theme-designer/types/theme";

export type ThemeMode = "light" | "dark";

export interface HslAdjustments {
    hueShift: number;
    saturationScale: number;
    lightnessScale: number;
}

export interface ThemeEditorState {
    id?: string;
    name?: string;
    preset?: string;
    currentMode: ThemeMode;
    hslAdjustments?: HslAdjustments;
    styles: ThemeStyles;
}
