import { create } from "zustand";
import type { ReactNode } from "react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

interface SheetState {
  key: number;
  content: ReactNode;
}

interface UiState {
  toastMsg: string | null;
  toastKey: number;
  lightboxSrc: string | null;
  confirmState: ConfirmState | null;
  sheet: SheetState | null;
  toast: (msg: string) => void;
  clearToast: () => void;
  showLightbox: (src: string) => void;
  closeLightbox: () => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  resolveConfirm: (ok: boolean) => void;
  openSheet: (content: ReactNode) => void;
  closeSheet: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let sheetKey = 0;

export const useUiStore = create<UiState>((set, get) => ({
  toastMsg: null,
  toastKey: 0,
  lightboxSrc: null,
  confirmState: null,
  sheet: null,
  toast: (msg) => {
    if (toastTimer) clearTimeout(toastTimer);
    set((s) => ({ toastMsg: msg, toastKey: s.toastKey + 1 }));
    toastTimer = setTimeout(() => set({ toastMsg: null }), 2400);
  },
  clearToast: () => set({ toastMsg: null }),
  showLightbox: (src) => set({ lightboxSrc: src }),
  closeLightbox: () => set({ lightboxSrc: null }),
  confirm: (opts) =>
    new Promise<boolean>((resolve) => {
      set({ confirmState: { ...opts, resolve } });
    }),
  resolveConfirm: (ok) => {
    const st = get().confirmState;
    if (st) st.resolve(ok);
    set({ confirmState: null });
  },
  openSheet: (content) => set({ sheet: { key: ++sheetKey, content } }),
  closeSheet: () => set({ sheet: null }),
}));

/** Atalhos para uso fora de componentes React (serviços). */
export const toast = (msg: string) => useUiStore.getState().toast(msg);
export const confirmDialog = (opts: ConfirmOptions) => useUiStore.getState().confirm(opts);
