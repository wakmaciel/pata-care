/* ----------------------- Protocolos de vacinação (Brasil) ------------------------
   Intervalos baseados em referências veterinárias usuais no Brasil (Zoetis, Petz,
   Pedigree, Cobasi, Covet, World Veterinária). São uma REFERÊNCIA GERAL — o
   médico-veterinário pode ajustar o protocolo conforme raça, risco e histórico do pet. */
import { addDaysISO, parseISODate } from "@/lib/dates";
import type { AnyRecord, VaccineRecord } from "@/types";

export interface VaccineProtocol {
  label: string;
  species: "dog" | "cat" | "any";
  initialDoses: number | null;
  intervalDays: number | null;
  boosterDays: number | null;
  minAgeWeeks: number;
}

export const VACCINE_PROTOCOLS: Record<string, VaccineProtocol> = {
  v8v10: {
    label: "V8/V10 (Polivalente)",
    species: "dog",
    initialDoses: 3,
    intervalDays: 21,
    boosterDays: 365,
    minAgeWeeks: 6,
  },
  antirrabica: {
    label: "Antirrábica",
    species: "any",
    initialDoses: 1,
    intervalDays: 21,
    boosterDays: 365,
    minAgeWeeks: 12,
  },
  giardia: {
    label: "Giárdia",
    species: "any",
    initialDoses: 2,
    intervalDays: 21,
    boosterDays: 365,
    minAgeWeeks: 6,
  },
  gripe: {
    label: "Gripe Canina/Tosse dos Canis",
    species: "dog",
    initialDoses: 2,
    intervalDays: 21,
    boosterDays: 365,
    minAgeWeeks: 8,
  },
  leishmaniose: {
    label: "Leishmaniose",
    species: "dog",
    initialDoses: 3,
    intervalDays: 21,
    boosterDays: 365,
    minAgeWeeks: 16,
  },
  v3v4v5: {
    label: "V3/V4/V5 (Felina)",
    species: "cat",
    initialDoses: 3,
    intervalDays: 21,
    boosterDays: 365,
    minAgeWeeks: 8,
  },
  felv: {
    label: "Leucemia Felina (FeLV)",
    species: "cat",
    initialDoses: 2,
    intervalDays: 21,
    boosterDays: 365,
    minAgeWeeks: 8,
  },
  outra: {
    label: "Outra (personalizada)",
    species: "any",
    initialDoses: null,
    intervalDays: null,
    boosterDays: null,
    minAgeWeeks: 0,
  },
};

export function vaccineTypeLabel(type: string | undefined): string {
  return (type && VACCINE_PROTOCOLS[type]?.label) || "Vacina";
}

export function vaccineGroupKey(rec: VaccineRecord): string {
  if (rec.vaccineType && rec.vaccineType !== "outra") return "vaccine:" + rec.vaccineType;
  return "vaccine:outra:" + (rec.name || rec.id);
}

export function vaccineTitle(rec: VaccineRecord): string {
  return rec.vaccineType && rec.vaccineType !== "outra"
    ? vaccineTypeLabel(rec.vaccineType)
    : rec.name || "Vacina";
}

/** Quantas doses desse tipo o pet já tem registradas até (e incluindo) essa data,
    sem contar o próprio registro em edição. */
export function priorDoseCount(
  records: AnyRecord[],
  petId: string,
  vaccineType: string,
  dateISO: string,
  excludeId: string | null
): number {
  return records.filter(
    (r) =>
      r.petId === petId &&
      r.category === "vaccine" &&
      r.vaccineType === vaccineType &&
      r.id !== excludeId &&
      r.date <= dateISO
  ).length;
}

export interface VaccineSchedule {
  nextDate: string | null;
  doseNumber: number | null;
  isBooster: boolean;
  protocol: VaccineProtocol | null;
}

export function computeVaccineSchedule(
  records: AnyRecord[],
  petId: string,
  vaccineType: string,
  dateISO: string,
  excludeId: string | null
): VaccineSchedule {
  const protocol = VACCINE_PROTOCOLS[vaccineType];
  if (!protocol || !protocol.initialDoses) {
    return { nextDate: null, doseNumber: null, isBooster: false, protocol: null };
  }
  const doseNumber = priorDoseCount(records, petId, vaccineType, dateISO, excludeId) + 1;
  const isBooster = doseNumber > protocol.initialDoses; // classifica esta dose (badge exibido)
  const nextIsBooster = doseNumber + 1 > protocol.initialDoses; // define o intervalo até a PRÓXIMA dose
  const intervalDays = (nextIsBooster ? protocol.boosterDays : protocol.intervalDays) ?? 0;
  const nextDate = addDaysISO(dateISO, intervalDays);
  return { nextDate, doseNumber, isBooster, protocol };
}

export function stepProtocolForward(
  protocol: VaccineProtocol,
  doseNumber: number,
  dateISO: string
): { doseNumber: number; date: string; isBooster: boolean } {
  const nextDoseNumber = doseNumber + 1;
  const isBooster = nextDoseNumber > (protocol.initialDoses ?? 0);
  const intervalDays = (isBooster ? protocol.boosterDays : protocol.intervalDays) ?? 0;
  return { doseNumber: nextDoseNumber, date: addDaysISO(dateISO, intervalDays), isBooster };
}

export function vaccineDoseLabel(
  doseNumber: number | null,
  isBooster: boolean,
  dateISO: string
): string {
  if (!isBooster) return `Dose ${doseNumber}`;
  return `Dose ${parseISODate(dateISO).getFullYear()}`;
}

export interface VaccineGroup {
  key: string;
  title: string;
  vaccineType: string;
  records: VaccineRecord[];
}

export function vaccineGroupsList(records: AnyRecord[], petId: string): VaccineGroup[] {
  const all = records.filter(
    (r): r is VaccineRecord => r.petId === petId && r.category === "vaccine"
  );
  const map = new Map<string, VaccineGroup>();
  all.forEach((r) => {
    const key = vaccineGroupKey(r);
    if (!map.has(key)) {
      map.set(key, { key, title: vaccineTitle(r), vaccineType: r.vaccineType, records: [] });
    }
    map.get(key)!.records.push(r);
  });
  const groups = [...map.values()];
  groups.forEach((g) => g.records.sort((a, b) => a.date.localeCompare(b.date))); // asc
  groups.sort((a, b) => {
    const lastA = a.records[a.records.length - 1]!.date;
    const lastB = b.records[b.records.length - 1]!.date;
    return lastB.localeCompare(lastA); // grupos com aplicação mais recente primeiro
  });
  return groups;
}
