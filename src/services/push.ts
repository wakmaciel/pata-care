/* ── Avisos com o app fechado (Web Push) ────────────────────────────────────
   Canal único de notificação do PataCare: remédios, vacinas, vermífugos,
   antipulgas e consultas saem todos por aqui. O iOS congela o JavaScript do app
   assim que ele sai da frente, então nenhum timer nosso sobrevive — o único
   caminho é o Web Push, com um Worker na Cloudflare cutucando o aparelho na
   hora certa (veja `worker/`).

   O que sai daqui é só a inscrição de push e uma lista de instantes — nenhum
   dado do pet vai para o servidor. O texto da notificação é montado pelo
   service worker lendo o IndexedDB local (`public/sw.js`).

   Exige o app instalado na Tela de Início: em aba do Safari o iOS não expõe
   PushManager. */
import { careRecordsFor } from "@/domain/care";
import { isDosePending } from "@/domain/medications";
import { addDaysISO, parseISODate, todayISO } from "@/lib/dates";
import { getDoseAlertSettings } from "@/services/calendar";
import { useDataStore } from "@/store/data";
import { toast } from "@/store/ui";
import type { MedicationRecord } from "@/types";

/* Worker publicado na Cloudflare — veja worker/README.md.
   A URL vai sem barra no fim; a chave é a pública do par VAPID (a privada
   fica só nos segredos do Worker). */
const PUSH_WORKER_URL = "https://patacare-push.macielwak.workers.dev";
const VAPID_PUBLIC_KEY =
  "BIYcNiVGjGYxnqRNWpFCICu8XL_KAMEs8hm-CLgMYViqVM77B9awM9RCeQXChdMSNS3gWRS7RzKR3xYgq3Wwyz4";

const PUSH_ENABLED_KEY = "patacare-push-enabled";
/** Assinatura da última agenda aceita pelo Worker — ver `sendSchedule`. */
const PUSH_SYNCED_KEY = "patacare-push-synced";
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

/** Hora em que avisam os cuidados que só têm data, sem horário marcado. */
const CARE_HOUR = 9;
/** Até onde a agenda de cuidados é pré-calculada, em dias. */
const CARE_HORIZON_DAYS = 30;

/** Dose de remédio: acorda na hora marcada, menos a antecedência dos Ajustes. */
function doseWakeups(): number[] {
  const { pets, records } = useDataStore.getState();
  const petIds = new Set(pets.map((p) => p.id));
  const lead = getDoseAlertSettings().leadMinutes * 60000;

  return records
    .filter((r): r is MedicationRecord => r.category === "medication" && petIds.has(r.petId))
    .flatMap((med) => med.doses || [])
    .filter(isDosePending)
    .map((dose) => new Date(dose.scheduledAt).getTime() - lead);
}

/**
 * Vacina, vermífugo, antipulgas e consulta têm data, não hora — então avisam às
 * 9h do dia marcado e às 9h de todo dia seguinte enquanto ninguém resolver.
 *
 * A agenda é montada por dia, não por registro: basta saber o vencimento mais
 * próximo para decidir em que dias vale acordar o aparelho. Quem descobre o que
 * ainda está pendente (e se ainda há algo a dizer) é o service worker, na hora,
 * lendo o banco local — aqui só marcamos os horários.
 */
function careWakeups(now: number): number[] {
  const { pets, records } = useDataStore.getState();
  const dueDates: string[] = [];
  pets.forEach((pet) => {
    careRecordsFor(records, pets, pet.id).forEach((rec) => {
      if (rec.nextDate) dueDates.push(rec.nextDate);
    });
  });
  if (dueDates.length === 0) return [];

  const earliest = dueDates.reduce((a, b) => (a < b ? a : b));
  const today = todayISO();
  const wakeups: number[] = [];
  for (let i = 0; i <= CARE_HORIZON_DAYS; i++) {
    const dayISO = addDaysISO(today, i);
    if (dayISO < earliest) continue; // nada vencido nem vencendo nesse dia
    const at = parseISODate(dayISO);
    at.setHours(CARE_HOUR, 0, 0, 0);
    if (at.getTime() > now) wakeups.push(at.getTime());
  }
  return wakeups;
}

/** Todos os instantes em que o aparelho deve ser acordado, já sem repetições. */
export function buildPushSchedule(): number[] {
  const now = Date.now();
  const all = [...doseWakeups(), ...careWakeups(now)]
    .filter((ts) => Number.isFinite(ts) && ts > now)
    .sort((a, b) => a - b);
  return all.filter((ts, i) => i === 0 || ts !== all[i - 1]).slice(0, MAX_SCHEDULE);
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

/**
 * Manda a agenda ao Worker, pulando o envio quando nada mudou desde o último.
 * Cada `/sync` é uma escrita no KV, e o plano gratuito dá mil por dia — abrir o
 * app e mexer nos cadastros não pode consumir cota à toa.
 */
async function sendSchedule(sub: PushSubscription, skipIfUnchanged: boolean): Promise<void> {
  const schedule = buildPushSchedule();
  const fingerprint = sub.endpoint + "|" + schedule.join(",");
  if (skipIfUnchanged && localStorage.getItem(PUSH_SYNCED_KEY) === fingerprint) return;

  const res = await fetch(PUSH_WORKER_URL + "/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub.toJSON(), schedule }),
  });
  if (!res.ok) throw new Error("worker respondeu " + res.status);
  localStorage.setItem(PUSH_SYNCED_KEY, fingerprint);
}

/** Reenvia a agenda ao Worker. Silencioso: é chamado a cada escrita no banco. */
export async function syncPushSchedule(): Promise<void> {
  if (!isPushConfigured() || !isPushEnabled()) return;
  const sub = await currentSubscription();
  if (!sub) return;
  try {
    await sendSchedule(sub, true);
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
    // Sem pular: ao ligar, a inscrição precisa chegar ao Worker mesmo que a
    // agenda seja idêntica à de uma ativação anterior.
    await sendSchedule(sub, false);
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
  localStorage.removeItem(PUSH_SYNCED_KEY);
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
