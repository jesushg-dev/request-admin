import { create } from "zustand";
import { ThemePreset } from "@/features/theme-designer/types/theme";
import { defaultPresets } from "@/features/theme-designer/utils/theme-presets";
import { getThemes } from "@/features/theme-designer/actions/themes";

interface ThemePresetStore {
  presets: Record<string, ThemePreset>;
  registerPreset: (name: string, preset: ThemePreset) => void;
  unregisterPreset: (name: string) => void;
  updatePreset: (name: string, preset: ThemePreset) => void;
  getPreset: (name: string) => ThemePreset | undefined;
  getAllPresets: () => Record<string, ThemePreset>;
  loadSavedPresets: () => Promise<void>;
  unloadSavedPresets: () => void;
}

export const useThemePresetStore = create<ThemePresetStore>()((set, get) => ({
  presets: defaultPresets,
  registerPreset: (name: string, preset: ThemePreset) => {
    set((state) => ({
      presets: {
        ...state.presets,
        [name]: preset,
      },
    }));
  },
  unregisterPreset: (name: string) => {
    set((state) => {
      const { [name]: _, ...remainingPresets } = state.presets;
      return {
        presets: remainingPresets,
      };
    });
  },
  loadSavedPresets: async () => {
    try {
      const savedThemes = await getThemes();
      const savedPresets = savedThemes.reduce((acc: Record<string, any>, theme: any) => {
        acc[theme.id] = {
          label: theme.name,
          styles: theme.styles,
          source: "SAVED",
          createdAt: theme.createdAt.toISOString(),
        };
        return acc;
      }, {} as Record<string, ThemePreset>);

      set((state) => ({
        presets: {
          ...state.presets,
          ...savedPresets,
        },
      }));
    } catch (error) {
      console.error("Failed to load saved presets:", error);
    }
  },
  unloadSavedPresets: () => {
    set({ presets: defaultPresets });
  },
  updatePreset: (name: string, preset: ThemePreset) => {
    set((state) => ({
      presets: {
        ...state.presets,
        [name]: preset,
      },
    }));
  },
  getPreset: (name: string) => {
    return get().presets[name];
  },
  getAllPresets: () => {
    return get().presets;
  },
}));

