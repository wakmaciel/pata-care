import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { setDbChangeListener } from "@/db";
import { useDataStore } from "@/store/data";
import { initTheme } from "@/store/theme";
import { scheduleDriveBackupAfterChange, driveAutoBackupOnOpen } from "@/services/drive";
import { scheduleNotificationCheck } from "@/services/notifications";
import { registerServiceWorker } from "@/pwa";
import "@/index.css";

initTheme();

// Toda escrita no banco agenda um backup automático no Google Drive (se conectado).
setDbChangeListener(scheduleDriveBackupAfterChange);

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
  });
