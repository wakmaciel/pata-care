/* Tipos de domínio do PataCare.
   Os campos espelham exatamente o formato salvo no IndexedDB pela v1 —
   dados antigos precisam continuar carregando sem migração. */

export type Species = "dog" | "cat" | "other";
export type Sex = "M" | "F";
export type ThemeMode = "light" | "dark" | "system";

export interface Measurements {
  neck: number | null;
  chest: number | null;
  length: number | null;
  notes: string;
  updatedAt: string;
}

export interface Pet {
  id: string;
  createdAt: number;
  name: string;
  species: Species;
  sex: Sex;
  neutered: boolean;
  breed: string;
  birthDate: string;
  microchip: string;
  notes: string;
  photo: string | null;
  disabledVaccineTypes?: string[];
  measurements?: Measurements;
}

export type AttachmentKind = "image" | "pdf" | "other";

export interface Attachment {
  id: string;
  name: string;
  mime: string;
  kind: AttachmentKind;
  dataUrl: string;
}

export type RecordCategory =
  | "vaccine"
  | "antiparasitic"
  | "dewormer"
  | "weight"
  | "heat"
  | "exam"
  | "surgery"
  | "consultation"
  | "medication";

interface BaseRecord {
  id: string;
  petId: string;
  createdAt: number;
  notes?: string;
}

export interface VaccineRecord extends BaseRecord {
  category: "vaccine";
  vaccineType: string;
  name: string;
  date: string;
  nextDate: string | null;
  photo: string | null;
  doseNumber: number | null;
  isBooster: boolean;
}

export interface ApplicationRecord extends BaseRecord {
  category: "antiparasitic" | "dewormer";
  product: string;
  date: string;
  nextDate: string | null;
}

export interface WeightRecord extends BaseRecord {
  category: "weight";
  date: string;
  weight: number;
}

export interface HeatRecord extends BaseRecord {
  category: "heat";
  startDate: string;
  endDate: string | null;
}

export interface ExamRecord extends BaseRecord {
  category: "exam";
  examType: string;
  date: string;
  vet: string;
  crm: string;
  attachments: Attachment[];
}

export interface SurgeryRecord extends BaseRecord {
  category: "surgery";
  surgeryType: string;
  date: string;
  vet: string;
  crm: string;
  markedNeutered: boolean;
  attachments: Attachment[];
}

export interface ConsultationRecord extends BaseRecord {
  category: "consultation";
  date: string;
  vet: string;
  crm: string;
  reason: string;
  hasReturn: boolean;
  nextDate: string | null;
}

export type DoseStatus = "pending" | "done" | "missed";

export interface Dose {
  scheduledAt: string;
  status?: DoseStatus;
  /** mantido apenas para compatibilidade com dados da v1 */
  done?: boolean;
  doneAt: string | null;
}

export type MedicationForm = "comprimido" | "gota" | "liquido" | "injecao" | "outro";

export interface MedicationRecord extends BaseRecord {
  category: "medication";
  name: string;
  form: MedicationForm;
  doseAmount: number;
  doseUnit: string;
  frequencyHours: number;
  startDateTime: string;
  durationDays: number | null;
  totalDoses: number;
  doses: Dose[];
}

export type AnyRecord =
  | VaccineRecord
  | ApplicationRecord
  | WeightRecord
  | HeatRecord
  | ExamRecord
  | SurgeryRecord
  | ConsultationRecord
  | MedicationRecord;

/** Registros com data "principal" simples (usados em listas de cuidados). */
export type DatedRecord = Exclude<AnyRecord, HeatRecord | MedicationRecord>;

/** Registros que participam do status de cuidados (nextDate). */
export type CareRecord = VaccineRecord | ApplicationRecord | ConsultationRecord;

export interface Tutor {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  photo?: string | null;
  updatedAt?: number;
}

export type DueState = "overdue" | "soon" | "ok" | "none";

export interface DueStatusInfo {
  status: DueState;
  days: number | null;
}
