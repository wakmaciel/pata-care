/* Banco local (IndexedDB) — MESMO nome/versão/stores da v1, para que os dados
   existentes dos usuários continuem carregando sem qualquer migração. */
import type { AnyRecord, Pet } from "@/types";

const DB_NAME = "patacare-db";
const DB_VERSION = 1;
let dbInstance: IDBDatabase | null = null;

/** Chamado após qualquer escrita — usado para agendar o backup do Drive. */
let onChangeCallback: (() => void) | null = null;
export function setDbChangeListener(cb: () => void) {
  onChangeCallback = cb;
}

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("pets")) {
        db.createObjectStore("pets", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("records")) {
        const store = db.createObjectStore("records", { keyPath: "id" });
        store.createIndex("petId", "petId", { unique: false });
      }
    };
    req.onsuccess = () => {
      dbInstance = req.result;
      resolve(dbInstance);
    };
    req.onerror = () => reject(req.error);
  });
}

type StoreName = "pets" | "records";

function tx(storeName: StoreName, mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function dbGetAll<T>(storeName: StoreName): Promise<T[]> {
  return tx(storeName, "readonly").then(
    (store) =>
      new Promise<T[]>((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as T[]) || []);
        req.onerror = () => reject(req.error);
      })
  );
}

function dbPutRaw<T>(storeName: StoreName, obj: T): Promise<T> {
  return tx(storeName, "readwrite").then(
    (store) =>
      new Promise<T>((resolve, reject) => {
        const req = store.put(obj);
        req.onsuccess = () => {
          onChangeCallback?.();
          resolve(obj);
        };
        req.onerror = () => reject(req.error);
      })
  );
}

function dbDeleteRaw(storeName: StoreName, id: string): Promise<void> {
  return tx(storeName, "readwrite").then(
    (store) =>
      new Promise<void>((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => {
          onChangeCallback?.();
          resolve();
        };
        req.onerror = () => reject(req.error);
      })
  );
}

function dbClearRaw(storeName: StoreName): Promise<void> {
  return tx(storeName, "readwrite").then(
    (store) =>
      new Promise<void>((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = () => {
          onChangeCallback?.();
          resolve();
        };
        req.onerror = () => reject(req.error);
      })
  );
}

export const db = {
  getAllPets: () => dbGetAll<Pet>("pets"),
  getAllRecords: () => dbGetAll<AnyRecord>("records"),
  putPet: (pet: Pet) => dbPutRaw("pets", pet),
  putRecord: (rec: AnyRecord) => dbPutRaw("records", rec),
  deletePet: (id: string) => dbDeleteRaw("pets", id),
  deleteRecord: (id: string) => dbDeleteRaw("records", id),
  clearPets: () => dbClearRaw("pets"),
  clearRecords: () => dbClearRaw("records"),
};
