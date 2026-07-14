import { create } from "zustand";
import { db } from "@/db";
import type { AnyRecord, Pet } from "@/types";

interface DataState {
  pets: Pet[];
  records: AnyRecord[];
  loaded: boolean;
  reload: () => Promise<void>;
  putPet: (pet: Pet) => Promise<void>;
  putRecord: (rec: AnyRecord) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  /** Exclui o pet e todos os seus registros. */
  deletePetCascade: (petId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  pets: [],
  records: [],
  loaded: false,
  reload: async () => {
    const [pets, records] = await Promise.all([db.getAllPets(), db.getAllRecords()]);
    set({ pets, records, loaded: true });
  },
  putPet: async (pet) => {
    await db.putPet(pet);
    await get().reload();
  },
  putRecord: async (rec) => {
    await db.putRecord(rec);
    await get().reload();
  },
  deleteRecord: async (id) => {
    await db.deleteRecord(id);
    await get().reload();
  },
  deletePetCascade: async (petId) => {
    await db.deletePet(petId);
    const toRemove = get().records.filter((r) => r.petId === petId);
    for (const r of toRemove) await db.deleteRecord(r.id);
    await get().reload();
  },
  clearAll: async () => {
    await db.clearPets();
    await db.clearRecords();
    await get().reload();
  },
}));
