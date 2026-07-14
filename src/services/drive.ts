/* ======================= BACKUP AUTOMÁTICO — GOOGLE DRIVE ======================
   Google Identity Services (GIS) para autenticar no navegador (sem servidor
   próprio) e Drive API v3 com o escopo "drive.file", que só dá acesso a
   arquivos/pastas que o próprio PataCare cria.
   O backup fica numa pasta "PataCare Backups"; cada envio gera uma cópia nova,
   com histórico curto — uma falha local nunca sobrescreve a última cópia boa. */
import { useDataStore } from "@/store/data";
import { getTutor, saveTutor, clearTutor } from "@/services/tutor";
import { confirmDialog, toast } from "@/store/ui";
import { navigate } from "@/router";
import { db } from "@/db";
import type { AnyRecord, Pet, Tutor } from "@/types";

const GOOGLE_CLIENT_ID = "696715565459-hs6qitu4aqok7410ual5agq54o4s7igo.apps.googleusercontent.com";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const DRIVE_FOLDER_NAME = "PataCare Backups";
const DRIVE_FILE_NAME = "patacare-backup.json";
const DRIVE_FILE_PREFIX = "patacare-backup-";
const DRIVE_MAX_BACKUPS = 10;
const DRIVE_CONNECTED_KEY = "patacare-drive-connected";
const DRIVE_LAST_BACKUP_KEY = "patacare-drive-last-backup";

/* Tipagem mínima do Google Identity Services carregado via <script>. */
interface GisTokenResponse {
  access_token: string;
  expires_in?: number | string;
  error?: string;
}
interface GisTokenClient {
  callback: (resp: GisTokenResponse) => void;
  requestAccessToken: (opts: { prompt: string }) => void;
}
interface GoogleGlobal {
  accounts?: {
    oauth2?: {
      initTokenClient: (opts: {
        client_id: string;
        scope: string;
        callback: (resp: GisTokenResponse) => void;
      }) => GisTokenClient;
      revoke: (token: string, cb: () => void) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}

interface DriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
  size?: string;
}

export interface BackupData {
  app: string;
  version: number;
  exportedAt: string;
  pets: Pet[];
  records: AnyRecord[];
  tutor: Tutor | null;
}

let gTokenClient: GisTokenClient | null = null;
let gAccessToken: string | null = null;
let gTokenExpiresAt = 0;
let gTokenRequest: Promise<string> | null = null;
let driveBackupTimer: ReturnType<typeof setTimeout> | null = null;

export function isDriveConfigured(): boolean {
  return !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith("SEU_CLIENT_ID");
}
export function isDriveConnected(): boolean {
  return localStorage.getItem(DRIVE_CONNECTED_KEY) === "1";
}
export function getDriveLastBackup(): string | null {
  return localStorage.getItem(DRIVE_LAST_BACKUP_KEY);
}

/* Aguarda a conclusão de uma sequência de edições antes de enviar. Isso evita
   muitos uploads ao preencher um formulário, sem deixar a cópia só para o dia seguinte. */
export function scheduleDriveBackupAfterChange() {
  if (!isDriveConfigured() || !isDriveConnected()) return;
  if (driveBackupTimer) clearTimeout(driveBackupTimer);
  driveBackupTimer = setTimeout(() => {
    if (!isDriveConnected()) return;
    driveUploadBackup(true).catch(() => {});
  }, 30000);
}

async function waitForGoogleIdentity(): Promise<boolean> {
  const until = Date.now() + 10000;
  while (!window.google?.accounts?.oauth2 && Date.now() < until) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return !!window.google?.accounts?.oauth2;
}

async function ensureGTokenClient(): Promise<GisTokenClient | null> {
  if (gTokenClient) return gTokenClient;
  if (!(await waitForGoogleIdentity())) return null;
  gTokenClient = window.google!.accounts!.oauth2!.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: DRIVE_SCOPE,
    callback: () => {}, // sobrescrito a cada chamada de requestDriveToken
  });
  return gTokenClient;
}

function requestDriveToken(silent: boolean): Promise<string> {
  if (gTokenRequest) return gTokenRequest;
  gTokenRequest = new Promise<string>((resolve, reject) => {
    (async () => {
      const client = await ensureGTokenClient();
      if (!client) {
        reject(new Error("Google Identity Services ainda não carregou"));
        return;
      }
      client.callback = (resp) => {
        if (resp && resp.error) {
          reject(new Error(resp.error));
          return;
        }
        gAccessToken = resp.access_token;
        gTokenExpiresAt = Date.now() + (Number(resp.expires_in) || 3500) * 1000;
        resolve(gAccessToken);
      };
      try {
        // "select_account" permite reconectar/trocar de conta sem pedir uma
        // autorização completa a cada vez. O token não é persistido pelo GIS.
        client.requestAccessToken({ prompt: silent ? "" : "select_account" });
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    })();
  }).finally(() => {
    gTokenRequest = null;
  });
  return gTokenRequest;
}

async function getDriveToken(silent: boolean): Promise<string> {
  if (gAccessToken && Date.now() < gTokenExpiresAt - 30000) return gAccessToken;
  return requestDriveToken(silent);
}

async function driveApiFetch(
  url: string,
  options?: RequestInit,
  silent?: boolean,
  retried?: boolean
): Promise<Response> {
  const doFetch = async () => {
    const token = await getDriveToken(!!silent);
    return fetch(url, {
      ...(options || {}),
      headers: { ...((options && options.headers) || {}), Authorization: `Bearer ${token}` },
    });
  };
  let res = await doFetch();
  // Tokens expiram durante uso prolongado do app. Renova uma vez antes de
  // considerar que a conta foi desconectada.
  if (res.status === 401 && !retried) {
    gAccessToken = null;
    gTokenExpiresAt = 0;
    res = await driveApiFetch(url, options, silent, true);
    return res;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Drive API ${res.status}: ${text}`);
  }
  return res;
}

async function driveFindOrCreateFolder(silent: boolean): Promise<string> {
  const q = encodeURIComponent(
    `name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const listRes = await driveApiFetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=10&fields=files(id,name,modifiedTime)`,
    {},
    silent
  );
  const listData = (await listRes.json()) as { files?: DriveFile[] };
  if (listData.files && listData.files.length > 0) return listData.files[0]!.id;
  const createRes = await driveApiFetch(
    `https://www.googleapis.com/drive/v3/files`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: DRIVE_FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      }),
    },
    silent
  );
  const createData = (await createRes.json()) as { id: string };
  return createData.id;
}

async function driveListBackups(folderId: string, silent: boolean): Promise<DriveFile[]> {
  const q = encodeURIComponent(
    `'${folderId}' in parents and trashed=false and (name='${DRIVE_FILE_NAME}' or name contains '${DRIVE_FILE_PREFIX}')`
  );
  const res = await driveApiFetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=${DRIVE_MAX_BACKUPS + 1}&fields=files(id,name,modifiedTime,size)`,
    {},
    silent
  );
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files || [];
}

export function buildBackupData(): BackupData {
  const { pets, records } = useDataStore.getState();
  return {
    app: "patacare",
    version: 2,
    exportedAt: new Date().toISOString(),
    pets,
    records,
    tutor: getTutor(),
  };
}

export function isValidBackup(data: unknown): data is BackupData {
  const d = data as BackupData | null;
  return !!d && Array.isArray(d.pets) && Array.isArray(d.records);
}
export function hasBackupContent(data: BackupData): boolean {
  return isValidBackup(data) && (data.pets.length > 0 || data.records.length > 0);
}
function driveBackupFileName(): string {
  return `${DRIVE_FILE_PREFIX}${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
}

async function driveReadBackup(file: DriveFile, silent: boolean): Promise<BackupData> {
  const res = await driveApiFetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    {},
    silent
  );
  const data = (await res.json()) as unknown;
  if (!isValidBackup(data)) throw new Error("Backup inválido no Google Drive");
  return data;
}

async function driveLatestUsableBackup(
  files: DriveFile[],
  silent: boolean
): Promise<{ file: DriveFile; data: BackupData } | null> {
  let emptyBackup: { file: DriveFile; data: BackupData } | null = null;
  for (const file of files) {
    try {
      const data = await driveReadBackup(file, silent);
      if (hasBackupContent(data)) return { file, data };
      emptyBackup = emptyBackup || { file, data };
    } catch {
      /* tenta uma cópia anterior */
    }
  }
  return emptyBackup;
}

export async function driveUploadBackup(silent: boolean): Promise<void> {
  const folderId = await driveFindOrCreateFolder(silent);
  await useDataStore.getState().reload(); // nunca usa um estado potencialmente desatualizado
  const data = buildBackupData();
  const existing = await driveListBackups(folderId, silent);
  if (!hasBackupContent(data) && existing.length) {
    const remote = await driveLatestUsableBackup(existing, silent);
    if (remote && hasBackupContent(remote.data)) throw new Error("Proteção contra backup vazio");
  }
  const metadata = { name: driveBackupFileName(), parents: [folderId] };
  const boundary = "patacare-" + Date.now();
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n` +
    `--${boundary}--`;
  await driveApiFetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
    silent
  );
  const allBackups = await driveListBackups(folderId, silent);
  // Mantém um histórico curto para recuperação, sem deixar a pasta crescer sem limite.
  await Promise.all(
    allBackups
      .slice(DRIVE_MAX_BACKUPS)
      .map((file) =>
        driveApiFetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}`,
          { method: "DELETE" },
          silent
        ).catch(() => {})
      )
  );
  localStorage.setItem(DRIVE_LAST_BACKUP_KEY, new Date().toISOString());
}

async function driveDownloadBackup(silent: boolean): Promise<BackupData> {
  const folderId = await driveFindOrCreateFolder(silent);
  const backups = await driveListBackups(folderId, silent);
  const backup = await driveLatestUsableBackup(backups, silent);
  if (!backup) throw new Error("Nenhum backup válido encontrado no Google Drive.");
  return backup.data;
}

export async function driveConnect(): Promise<void> {
  try {
    await getDriveToken(false); // abre o consentimento do Google
    await driveUploadBackup(false);
    localStorage.setItem(DRIVE_CONNECTED_KEY, "1");
    toast("Google Drive conectado e backup enviado!");
  } catch (err) {
    toast(
      err instanceof Error && err.message === "Proteção contra backup vazio"
        ? "Backup local está vazio; a cópia existente no Drive foi preservada"
        : "Não foi possível conectar ao Google Drive"
    );
  }
}

export async function driveDisconnect(): Promise<void> {
  const ok = await confirmDialog({
    title: "Desconectar Google Drive?",
    message:
      "O backup automático será desativado neste aparelho. O arquivo que já está salvo no seu Google Drive não será apagado.",
    confirmLabel: "Desconectar",
    danger: true,
  });
  if (!ok) return;
  if (gAccessToken && window.google?.accounts?.oauth2) {
    try {
      window.google.accounts.oauth2.revoke(gAccessToken, () => {});
    } catch {
      /* noop */
    }
  }
  gAccessToken = null;
  gTokenExpiresAt = 0;
  localStorage.removeItem(DRIVE_CONNECTED_KEY);
  toast("Google Drive desconectado");
}

export async function applyBackupData(data: BackupData): Promise<void> {
  await db.clearPets();
  await db.clearRecords();
  for (const p of data.pets) await db.putPet(p);
  for (const r of data.records) await db.putRecord(r);
  if (data.tutor && typeof data.tutor === "object" && data.tutor.name) saveTutor(data.tutor);
  else clearTutor();
  await useDataStore.getState().reload();
}

export async function driveRestoreFlow(): Promise<void> {
  try {
    const data = await driveDownloadBackup(false);
    if (!isValidBackup(data)) throw new Error("formato inválido");
    const ok = await confirmDialog({
      title: "Restaurar do Google Drive?",
      message:
        "Isso vai substituir todos os dados atuais deste dispositivo pelos dados do backup salvo no Google Drive.",
      confirmLabel: "Restaurar e substituir",
      danger: true,
    });
    if (!ok) return;
    await applyBackupData(data);
    toast("Dados restaurados do Google Drive!");
    navigate("#/");
  } catch {
    toast("Não foi possível restaurar do Google Drive");
  }
}

/* Chamado uma vez ao abrir o app: se já estiver conectado, faz backup silencioso
   (sem popup) no máximo uma vez por dia. */
export async function driveAutoBackupOnOpen(): Promise<void> {
  if (!isDriveConfigured() || !isDriveConnected()) return;
  const last = getDriveLastBackup();
  const today = new Date().toDateString();
  if (last && new Date(last).toDateString() === today) return;
  try {
    await driveUploadBackup(true);
  } catch {
    // Silencioso: se a sessão expirou ou não há rede, apenas não faz nada agora.
    // O usuário pode tocar em "Fazer backup agora" nos Ajustes quando quiser.
  }
}
