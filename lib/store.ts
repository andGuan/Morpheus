import { create } from "zustand";
import type { SelectionKind } from "@/lib/catalog";

export type AtelierStage = "login" | "welcome" | "selection" | "confirmation";

type AtelierStore = {
  stage: AtelierStage;
  guestName: string;
  plate: string;
  cutlery: string;
  glass: string;
  confirmed: boolean;
  setStage: (stage: AtelierStage) => void;
  setGuestName: (guestName: string) => void;
  choose: (kind: SelectionKind, id: string) => void;
  setConfirmed: (confirmed: boolean) => void;
  reset: () => void;
};

const initialSelection = {
  stage: "login" as AtelierStage,
  guestName: "",
  plate: "",
  cutlery: "",
  glass: "",
  confirmed: false,
};

export const useAtelierStore = create<AtelierStore>((set) => ({
  ...initialSelection,
  setStage: (stage) => set({ stage }),
  setGuestName: (guestName) => set({ guestName }),
  choose: (kind, id) => set({ [kind]: id }),
  setConfirmed: (confirmed) => set({ confirmed }),
  reset: () => set(initialSelection),
}));