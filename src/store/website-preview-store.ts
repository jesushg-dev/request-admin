import { create } from "zustand";

interface WebsitePreviewStore {
  inputUrl: string;
  currentUrl: string | null;
  setInputUrl: (url: string) => void;
  setCurrentUrl: (url: string | null) => void;
  reset: () => void;
}

export const useWebsitePreviewStore = create<WebsitePreviewStore>((set) => ({
  inputUrl: "",
  currentUrl: null,
  setInputUrl: (url: string) => set({ inputUrl: url }),
  setCurrentUrl: (url: string | null) => set({ currentUrl: url }),
  reset: () => set({ inputUrl: "", currentUrl: null }),
}));

