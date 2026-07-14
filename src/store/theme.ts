import { create } from "zustand";
import type { ThemeMode } from "@/types";

const THEME_KEY = "patacare-theme";

function effectiveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = effectiveTheme(mode);
}

function storedMode(): ThemeMode {
  const v = localStorage.getItem(THEME_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: storedMode(),
  setMode: (mode) => {
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
    set({ mode });
  },
}));

export function initTheme() {
  applyTheme(storedMode());
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (useThemeStore.getState().mode === "system") applyTheme("system");
  });
}
