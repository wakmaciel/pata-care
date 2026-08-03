import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { setDbChangeListener } from "@/db";
import { useDataStore } from "@/store/data";
import { initTheme } from "@/store/theme";
import { scheduleDriveBackupAfterChange, driveAutoBackupOnOpen } from "@/services/drive";
import { scheduleNotificationCheck } from "@/services/notifications";
import { schedulePushSync, syncPushSchedule } from "@/services/push";
import { registerServiceWorker } from "@/pwa";
import "@/index.css";

initTheme();

// Remove o splash screen (index.html) com fade, garantindo um tempo mínimo
// de exibição para a animação não "piscar" quando o carregamento é rápido.
const SPLASH_MIN_MS = 700;
function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  const shownAt = (window as unknown as { __splashShownAt?: number }).__splashShownAt ?? 0;
  const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - shownAt));
  setTimeout(() => {
    splash.classList.add("splash-hide");
    splash.addEventListener("transitionend", () => splash.remove(), { once: true });
    setTimeout(() => splash.remove(), 600);
  }, wait);
}

// Toda escrita no banco agenda um backup automático no Google Drive (se conectado)
// e reenvia ao Worker os horários das próximas doses (se o push estiver ligado).
setDbChangeListener(() => {
  scheduleDriveBackupAfterChange();
  schedulePushSync();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

useDataStore
  .getState()
  .reload()
  .then(() => {
    registerServiceWorker();
    scheduleNotificationCheck();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") scheduleNotificationCheck();
    });
    driveAutoBackupOnOpen();
    // Reafirma a agenda a cada abertura: cobre doses marcadas em outro aparelho
    // e inscrições que o iOS renovou por conta própria.
    void syncPushSchedule();
  })
  .finally(hideSplash);
