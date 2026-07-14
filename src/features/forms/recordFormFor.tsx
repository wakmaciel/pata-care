import type { ReactNode } from "react";
import { VaccineFormSheet } from "@/features/forms/VaccineFormSheet";
import { ExamFormSheet } from "@/features/forms/ExamFormSheet";
import { SurgeryFormSheet } from "@/features/forms/SurgeryFormSheet";
import { ConsultationFormSheet } from "@/features/forms/ConsultationFormSheet";
import { MedicationFormSheet } from "@/features/forms/MedicationFormSheet";
import { GenericRecordFormSheet } from "@/features/forms/GenericRecordFormSheet";
import type {
  AnyRecord,
  ConsultationRecord,
  ExamRecord,
  MedicationRecord,
  Pet,
  SurgeryRecord,
  VaccineRecord,
} from "@/types";

/** Devolve o sheet de formulário certo para uma categoria de registro. */
export function recordFormSheetFor(
  category: string,
  pet: Pet,
  existing: AnyRecord | null
): ReactNode {
  switch (category) {
    case "vaccine":
      return <VaccineFormSheet pet={pet} existing={existing as VaccineRecord | null} />;
    case "exam":
      return <ExamFormSheet petId={pet.id} existing={existing as ExamRecord | null} />;
    case "surgery":
      return <SurgeryFormSheet pet={pet} existing={existing as SurgeryRecord | null} />;
    case "consultation":
      return (
        <ConsultationFormSheet petId={pet.id} existing={existing as ConsultationRecord | null} />
      );
    case "medication":
      return <MedicationFormSheet petId={pet.id} existing={existing as MedicationRecord | null} />;
    default:
      return (
        <GenericRecordFormSheet
          category={category as "antiparasitic" | "dewormer" | "weight" | "heat"}
          petId={pet.id}
          existing={existing}
        />
      );
  }
}
