import { create } from "zustand";

interface GetProDialogStore {
  isOpen: boolean;
  openGetProDialog: () => void;
  closeGetProDialog: () => void;
}

export const useGetProDialogStore = create<GetProDialogStore>()((set) => ({
  isOpen: false,
  openGetProDialog: () => set({ isOpen: true }),
  closeGetProDialog: () => set({ isOpen: false }),
}));

