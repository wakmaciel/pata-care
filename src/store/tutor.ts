import { create } from "zustand";
import { getTutor, saveTutor as persistTutor } from "@/services/tutor";
import type { Tutor } from "@/types";

interface TutorState {
  tutor: Tutor | null;
  save: (t: Tutor) => void;
  refresh: () => void;
}

export const useTutorStore = create<TutorState>((set) => ({
  tutor: getTutor(),
  save: (t) => {
    persistTutor(t);
    set({ tutor: t });
  },
  refresh: () => set({ tutor: getTutor() }),
}));
