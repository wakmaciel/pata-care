import type { Dose, DoseStatus, MedicationForm } from "@/types";

export const MED_FORM_UNITS: Record<MedicationForm, string> = {
  comprimido: "comprimido(s)",
  gota: "gota(s)",
  liquido: "ml",
  injecao: "aplicação(ões)",
  outro: "dose(s)",
};

export function buildMedicationDoses(
  startDateTimeISO: string,
  frequencyHours: number,
  totalDoses: number
): Dose[] {
  const doses: Dose[] = [];
  const start = new Date(startDateTimeISO);
  for (let i = 0; i < totalDoses; i++) {
    const t = new Date(start.getTime() + i * frequencyHours * 3600000);
    doses.push({ scheduledAt: t.toISOString(), status: "pending", doneAt: null });
  }
  return doses;
}

// "pending" | "done" | "missed" — d.done é mantido apenas para compatibilidade com dados antigos
export function doseStatus(d: Dose): DoseStatus {
  return d.status || (d.done ? "done" : "pending");
}
export function isDosePending(d: Dose): boolean {
  return doseStatus(d) === "pending";
}
export function isDoseDone(d: Dose): boolean {
  return doseStatus(d) === "done";
}
export function isDoseMissed(d: Dose): boolean {
  return doseStatus(d) === "missed";
}
/** Versão imutável — usada nas atualizações do estado React. */
export function withDoseStatus(d: Dose, status: DoseStatus): Dose {
  return {
    ...d,
    status,
    done: status === "done", // compatibilidade
    doneAt: status === "done" ? new Date().toISOString() : null,
  };
}
export function setDoseStatus(d: Dose, status: DoseStatus): void {
  d.status = status;
  d.done = status === "done"; // compatibilidade
  d.doneAt = status === "done" ? new Date().toISOString() : null;
}
export function hoursLate(dose: Dose): number {
  return (Date.now() - new Date(dose.scheduledAt).getTime()) / 3600000;
}
export function isPendingExpired(dose: Dose, frequencyHours: number): boolean {
  return isDosePending(dose) && hoursLate(dose) > frequencyHours;
}
