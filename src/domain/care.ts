/* Regras de status de cuidados (atrasado / em breve / em dia) — portadas 1:1 da v1. */
import { dueStatus } from "@/lib/dates";
import { vaccineGroupKey } from "@/domain/vaccines";
import type { AnyRecord, CareRecord, Pet, RecordCategory } from "@/types";

export function petsSorted(pets: Pet[]): Pet[] {
  return pets.slice().sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

export function recordsFor<T extends AnyRecord>(
  records: AnyRecord[],
  petId: string,
  category: RecordCategory
): T[] {
  return records
    .filter((r): r is T => r.petId === petId && r.category === category)
    .sort((a, b) => {
      const da = ("date" in a ? a.date : "startDate" in a ? a.startDate : "") || "";
      const db = ("date" in b ? b.date : "startDate" in b ? b.startDate : "") || "";
      return db.localeCompare(da);
    });
}

/** Só o registro mais recente de cada vacina/categoria vale para status de atraso —
    um reforço aplicado mais novo "substitui" o aviso de atraso da dose anterior. */
export function careRecordsFor(records: AnyRecord[], pets: Pet[], petId: string): CareRecord[] {
  const pet = pets.find((p) => p.id === petId);
  const disabled = pet?.disabledVaccineTypes || [];
  const all = records
    .filter(
      (r): r is CareRecord =>
        r.petId === petId &&
        (r.category === "vaccine" ||
          r.category === "antiparasitic" ||
          r.category === "dewormer" ||
          r.category === "consultation")
    )
    .filter(
      (r) => !(r.category === "vaccine" && r.vaccineType && disabled.includes(r.vaccineType))
    );
  const latestByKey = new Map<string, CareRecord>();
  all.forEach((r) => {
    const key = r.category === "vaccine" ? vaccineGroupKey(r) : r.category;
    const cur = latestByKey.get(key);
    if (!cur || r.date > cur.date) latestByKey.set(key, r);
  });
  return [...latestByKey.values()];
}

export interface PetBadge {
  status: "overdue" | "soon" | "ok";
  count?: number;
}

export function petBadgeStatus(records: AnyRecord[], pets: Pet[], petId: string): PetBadge | null {
  const recs = careRecordsFor(records, pets, petId);
  let overdueCount = 0;
  let soonCount = 0;
  let hasAny = false;
  recs.forEach((r) => {
    if (!r.nextDate) return;
    hasAny = true;
    const s = dueStatus(r.nextDate).status;
    if (s === "overdue") overdueCount++;
    else if (s === "soon") soonCount++;
  });
  if (!hasAny) return null;
  if (overdueCount > 0) return { status: "overdue", count: overdueCount };
  if (soonCount > 0) return { status: "soon", count: soonCount };
  return { status: "ok" };
}

export function latestRecordIdsForCategory(
  records: AnyRecord[],
  petId: string,
  category: RecordCategory
): Set<string> {
  const all = records.filter((r) => r.petId === petId && r.category === category);
  const map = new Map<string, AnyRecord>();
  all.forEach((r) => {
    const key = r.category === "vaccine" ? vaccineGroupKey(r) : category;
    const cur = map.get(key);
    const rDate = "date" in r ? r.date : "";
    const curDate = cur && "date" in cur ? cur.date : "";
    if (!cur || rDate > curDate) map.set(key, r);
  });
  return new Set([...map.values()].map((r) => r.id));
}

/** Sugestões de preenchimento: valores já usados antes para o mesmo campo/categoria. */
export function distinctValues(
  records: AnyRecord[],
  category: RecordCategory,
  key: string
): string[] {
  const recs = records
    .filter((r) => r.category === category && (r as unknown as Record<string, unknown>)[key])
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const seen = new Set<string>();
  const out: string[] = [];
  recs.forEach((r) => {
    const v = String((r as unknown as Record<string, unknown>)[key]);
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  });
  return out;
}
