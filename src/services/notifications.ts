/* Notificações locais do sistema — funcionam ao abrir ou manter o PWA ativo.
   Push com o app fechado exigiria um servidor; não é simulado aqui. */
import { todayISO, dueStatus } from "@/lib/dates";
import { careRecordsFor } from "@/domain/care";
import { categoryConfig } from "@/domain/categories";
import { isDosePending } from "@/domain/medications";
import { useDataStore } from "@/store/data";
import { toast } from "@/store/ui";
import type { CareRecord, Dose, DueStatusInfo, MedicationRecord, Pet } from "@/types";

const NOTIFICATION_SETTINGS_KEY = "patacare-notification-settings";
const NOTIFICATION_SENT_KEY = "patacare-notification-sent";
let notificationTimer: ReturnType<typeof setTimeout> | null = null;

export interface NotificationSettings {
  enabled: boolean;
}

export function notificationsSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

export function getNotificationSettings(): NotificationSettings {
  try {
    return (
      (JSON.parse(
        localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || "null"
      ) as NotificationSettings) || {
        enabled: false,
      }
    );
  } catch {
    return { enabled: false };
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

function getSentNotifications(): Record<string, number> {
  try {
    return (
      (JSON.parse(localStorage.getItem(NOTIFICATION_SENT_KEY) || "null") as Record<
        string,
        number
      >) || {}
    );
  } catch {
    return {};
  }
}

function wasNotificationSent(key: string): boolean {
  return !!getSentNotifications()[key];
}

function markNotificationSent(key: string) {
  const sent = getSentNotifications();
  sent[key] = Date.now();
  // Mantém somente o histórico recente usado para evitar avisos repetidos.
  const cutoff = Date.now() - 14 * 86400000;
  Object.keys(sent).forEach((id) => {
    if ((sent[id] ?? 0) < cutoff) delete sent[id];
  });
  localStorage.setItem(NOTIFICATION_SENT_KEY, JSON.stringify(sent));
}

export function showSystemNotification(
  title: string,
  options?: NotificationOptions & { data?: { url: string } }
): Promise<boolean> {
  if (notificationPermission() !== "granted") return Promise.resolve(false);
  const payload = Object.assign(
    {
      body: "Abra o PataCare para ver os lembretes.",
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      tag: "patacare-reminder",
      data: { url: "#/lembretes" },
    },
    options || {}
  );
  return navigator.serviceWorker.ready
    .then((registration) => {
      registration.showNotification(title, payload);
      return true;
    })
    .catch(() => {
      try {
        new Notification(title, payload);
        return true;
      } catch {
        return false;
      }
    });
}

interface CareCandidate {
  pet: Pet;
  rec: CareRecord;
  status: DueStatusInfo;
  title: string;
}
interface DoseCandidate {
  pet: Pet;
  med: MedicationRecord;
  dose: Dose;
}

function notificationCandidates(): { care: CareCandidate[]; doses: DoseCandidate[] } {
  const { pets, records } = useDataStore.getState();
  const care: CareCandidate[] = [];
  pets.forEach((pet) => {
    careRecordsFor(records, pets, pet.id).forEach((rec) => {
      if (!rec.nextDate) return;
      const status = dueStatus(rec.nextDate);
      if (status.status === "overdue" || status.status === "soon") {
        const cfg = categoryConfig(rec.category);
        care.push({ pet, rec, status, title: cfg.title || "Lembrete" });
      }
    });
  });
  const doses: DoseCandidate[] = [];
  pets.forEach((pet) => {
    records
      .filter((r): r is MedicationRecord => r.petId === pet.id && r.category === "medication")
      .forEach((med) => {
        const dose = med.doses && med.doses.find(isDosePending);
        if (dose) doses.push({ pet, med, dose });
      });
  });
  return { care, doses };
}

function runNotificationCheck() {
  const settings = getNotificationSettings();
  if (!settings.enabled || notificationPermission() !== "granted") return;
  const now = new Date();
  const today = todayISO();
  const { care, doses } = notificationCandidates();
  const overdue = care.filter((item) => item.status.status === "overdue");
  const soon = care.filter((item) => item.status.status === "soon");
  const dailyKey = "care:" + today;
  if ((overdue.length || soon.length) && !wasNotificationSent(dailyKey)) {
    const parts: string[] = [];
    if (overdue.length) parts.push(`${overdue.length} atraso${overdue.length === 1 ? "" : "s"}`);
    if (soon.length) parts.push(`${soon.length} próximo${soon.length === 1 ? "" : "s"}`);
    showSystemNotification("Cuidados do seu pet", {
      body: parts.join(" e ") + ". Toque para conferir os lembretes.",
      tag: dailyKey,
    });
    markNotificationSent(dailyKey);
  }
  doses.forEach(({ pet, med, dose }) => {
    const dueAt = new Date(dose.scheduledAt).getTime();
    const minutesFromNow = (dueAt - now.getTime()) / 60000;
    // Notifica desde 15 min antes até 24 h depois da dose. O identificador
    // garante um único aviso por dose, mesmo se o app for reaberto.
    const key = "dose:" + med.id + ":" + dose.scheduledAt;
    if (minutesFromNow <= 15 && minutesFromNow >= -1440 && !wasNotificationSent(key)) {
      const when =
        minutesFromNow < -1
          ? "está atrasada"
          : minutesFromNow <= 1
            ? "é agora"
            : `é em ${Math.ceil(minutesFromNow)} min`;
      showSystemNotification(`Hora do remédio de ${pet.name}`, {
        body: `${med.name}: a dose ${when}.`,
        tag: key,
      });
      markNotificationSent(key);
    }
  });
}

export function scheduleNotificationCheck() {
  if (notificationTimer) clearTimeout(notificationTimer);
  runNotificationCheck();
  if (getNotificationSettings().enabled && notificationPermission() === "granted") {
    notificationTimer = setTimeout(scheduleNotificationCheck, 15 * 60000);
  }
}

export function stopNotificationCheck() {
  if (notificationTimer) clearTimeout(notificationTimer);
}

export async function enableSystemNotifications(): Promise<boolean> {
  if (!notificationsSupported()) {
    toast("Este navegador não oferece notificações do sistema");
    return false;
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    toast("Permissão não concedida. Você pode liberar nas configurações do navegador.");
    return false;
  }
  saveNotificationSettings({ enabled: true });
  scheduleNotificationCheck();
  toast("Notificações do sistema ativadas!");
  return true;
}
