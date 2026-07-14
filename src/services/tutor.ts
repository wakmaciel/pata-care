import type { Tutor } from "@/types";

export const TUTOR_KEY = "patacare-tutor";

export function getTutor(): Tutor | null {
  try {
    const t = JSON.parse(localStorage.getItem(TUTOR_KEY) || "null") as Tutor | null;
    return t && typeof t === "object" && t.name ? t : null;
  } catch {
    return null;
  }
}

export function saveTutor(t: Tutor) {
  localStorage.setItem(TUTOR_KEY, JSON.stringify(t));
}

export function clearTutor() {
  localStorage.removeItem(TUTOR_KEY);
}
