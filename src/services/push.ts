/* ── Avisos com o app fechado (Web Push) ────────────────────────────────────
   O iOS congela o JavaScript do app assim que ele sai da frente, então nenhum
   timer nosso sobrevive. O único caminho é o Web Push: um Worker na Cloudflare
   cutuca o aparelho na hora certa (veja `worker/`).

   O que sai daqui é só a inscrição de push e uma lista de instantes — nenhum
   dado do pet vai para o servidor. O texto da notificação é montado pelo
   service worker lendo o IndexedDB local (`public/sw.js`).

   Exige o app instalado na Tela de Início: em aba do Safari o iOS não expõe
   PushManager. */
import { isDosePending } from "@/domain/medications";
import { getDoseAlertSettings } from "@/services/calendar";
import { useDataStore } from "@/store/data";
import { toast } from "@/store/ui";
import type { MedicationRecord } from "@/types";

/* Preencha os dois depois de publicar o Worker (veja worker/README.md). */
const PUSH_WORKER_URL = "";
const VAPID_PUBLIC_KEY = "";

const PUSH_ENABLED_KEY = "patacare-push-enabled";
/** Teto igual ao do Worker — mais que isso ele descarta mesmo. */
const MAX_SCHEDULE = 500;

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function isPushConfigured(): boolean {
  return !!PUSH_WORKER_URL && !!VAPID_PUBLIC_KEY;
}

export function pushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** iOS só dá Push API para web app na Tela de Início — em aba, nem adianta pedir. */
export function isInstalledApp(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return iosStandalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

export function isPushEnabled(): boolean {
  return localStorage.getItem(PUSH_ENABLED_KEY) === "1";
}

/** A chave VAPID pública em bytes crus, como o PushManager espera. */
function urlBase64ToBuffer(base64: string): ArrayBuffer {
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const buffer = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return buffer;
}

/** Instantes em que o aparelho deve ser acordado: uma dose pendente futura por vez. */
export function buildPushSchedule(): number[] {
  const { pets, records } = useDataStore.getState();
  const petIds = new Set(pets.map((p) => p.id));
  const lead = getDoseAlertSettings().leadMinutes * 60000;
  const now = Date.now();

  return records
    .filter((r): r is MedicationRecord => r.category === "medication" && petIds.has(r.petId))
    .flatMap((med) => med.doses || [])
    .filter(isDosePending)
    .map((dose) => new Date(dose.scheduledAt).getTime() - lead)
    .filter((ts) => Number.isFinite(ts) && ts > now)
    .sort((a, b) => a - b)
    .slice(0, MAX_SCHEDULE);
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

/** Reenvia a agenda ao Worker. Silencioso: é chamado a cada escrita no banco. */
export async function syncPushSchedule(): Promise<void> {
  if (!isPushConfigured() || !isPushEnabled()) return;
  const sub = await currentSubscription();
  if (!sub) return;
  try {
    await fetch(PUSH_WORKER_URL + "/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), schedule: buildPushSchedule() }),
    });
  } catch {
    // sem rede agora: a próxima escrita (ou a reabertura do app) tenta de novo
  }
}

/** Agrupa as escritas em rajada numa única chamada ao Worker. */
export function schedulePushSync() {
  if (!isPushConfigured() || !isPushEnabled()) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => void syncPushSchedule(), 3000);
}

export async function enablePush(): Promise<boolean> {
  if (!isPushConfigured()) {
    toast("Os avisos com o app fechado ainda não foram configurados");
    return false;
  }
  if (!pushSupported()) {
    toast("Este navegador não oferece Web Push");
    return false;
  }
  if (!isInstalledApp()) {
    toast("Adicione o PataCare à Tela de Início primeiro — o iOS exige isso");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    toast("Permissão não concedida. Você pode liberar nas configurações do aparelho.");
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToBuffer(VAPID_PUBLIC_KEY),
      }));
    const res = await fetch(PUSH_WORKER_URL + "/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), schedule: buildPushSchedule() }),
    });
    if (!res.ok) throw new Error("worker respondeu " + res.status);
    localStorage.setItem(PUSH_ENABLED_KEY, "1");
    toast("Avisos com o app fechado ativados!");
    return true;
  } catch {
    toast("Não foi possível ativar agora. Tente de novo mais tarde.");
    return false;
  }
}

export async function disablePush(): Promise<void> {
  localStorage.removeItem(PUSH_ENABLED_KEY);
  const sub = await currentSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => {});
  try {
    await fetch(PUSH_WORKER_URL + "/unsync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });
  } catch {
    // o Worker também descarta sozinho quando o push service retorna 410
  }
}
