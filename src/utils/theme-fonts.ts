import { ThemeEditorState } from "@/types/editor";
import { FontInfo } from "@/types/fonts";

export function getAppliedThemeFont(state: ThemeEditorState, type: string): FontInfo | null {
    const fontValue = state.styles[state.currentMode][type];
    if (!fontValue) return null;

    // Basic parsing assuming format "'Family Name', category"
    const match = fontValue.match(/'([^']+)'.*?,\s*(\w+)/);
    if (match) {
        return {
            family: match[1],
            category: match[2],
            variants: [],
            subsets: []
        };
    }
    return null;
}
