import { fmtDateTime, MONTHS_ABBR, pad } from "@/lib/dates";
import {
  isDoseDone,
  isDoseMissed,
  isDosePending,
  isPendingExpired,
  MED_FORM_UNITS,
} from "@/domain/medications";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { MedicationFormSheet } from "@/features/forms/MedicationFormSheet";
import { MedicationChecklistSheet } from "@/features/forms/MedicationChecklistSheet";
import type { MedicationRecord, Pet } from "@/types";

function MedicationCard({ med, pet }: { med: MedicationRecord; pet: Pet }) {
  const { openSheet } = useUiStore();
  const doneCount = med.doses.filter(isDoseDone).length;
  const missedCount = med.doses.filter(isDoseMissed).length;
  const total = med.doses.length;
  const next = med.doses.find(isDosePending);
  const unit = med.doseUnit || MED_FORM_UNITS[med.form] || "dose(s)";
  const pct = Math.round((doneCount / total) * 100);
  const startD = new Date(med.startDateTime);
  const openIt = () => openSheet(<MedicationChecklistSheet medId={med.id} pet={pet} />);

  let next2: React.ReactNode;
  if (next) {
    const expired = isPendingExpired(next, med.frequencyHours);
    const overdue = new Date(next.scheduledAt) < new Date();
    const color = expired ? "var(--red)" : overdue ? "var(--peach)" : "var(--pink-strong)";
    const txt = expired
      ? "Pendente, provavelmente não aplicada — "
      : overdue
        ? "Atrasada — "
        : "Próxima dose: ";
    next2 = (
      <>
        <hr className="record-divider" />
        <div className="record-next" style={{ color }}>
          <Icon name="clock" /> {txt}
          {fmtDateTime(next.scheduledAt)}
        </div>
      </>
    );
  } else {
    const extra =
      missedCount > 0 ? ` (${missedCount} não aplicada${missedCount === 1 ? "" : "s"})` : "";
    next2 = (
      <>
        <hr className="record-divider" />
        <div className="record-next" style={{ color: "var(--mint)" }}>
          <Icon name="check" /> Tratamento concluído{extra}
        </div>
      </>
    );
  }

  return (
    <div className="record">
      <div className="record-stamp">
        <span className="d">{pad(startD.getDate())}</span>
        <span className="m">{MONTHS_ABBR[startD.getMonth()]}</span>
      </div>
      <div className="record-body" onClick={openIt} style={{ cursor: "pointer" }}>
        <h4>{med.name}</h4>
        <div className="sub">
          {med.doseAmount} {unit} · a cada {med.frequencyHours}h
        </div>
        <div className="sub">
          {doneCount} de {total} doses aplicadas ({pct}%)
          {missedCount > 0 && ` · ${missedCount} não aplicada${missedCount === 1 ? "" : "s"}`}
        </div>
        {med.notes && <div className="sub">{med.notes}</div>}
        {next2}
      </div>
      <button className="record-menu-btn" aria-label="Abrir" onClick={openIt}>
        <Icon name="dots" />
      </button>
    </div>
  );
}

export function MedicationTab({ pet }: { pet: Pet }) {
  const { records } = useDataStore();
  const { openSheet } = useUiStore();
  const meds = records
    .filter((r): r is MedicationRecord => r.petId === pet.id && r.category === "medication")
    .sort((a, b) => b.startDateTime.localeCompare(a.startDateTime));

  if (meds.length === 0) {
    return (
      <EmptyState
        icon="medkit"
        title="Nenhum medicamento registrado"
        text="Registre remédios com horário certo: comprimidos, gotas, líquidos ou injeções, e marque cada dose conforme for aplicando."
        action={
          <Button onClick={() => openSheet(<MedicationFormSheet petId={pet.id} existing={null} />)}>
            <Icon name="plus" /> Adicionar medicamento
          </Button>
        }
      />
    );
  }

  const active = meds.filter((m) => m.doses.some(isDosePending));
  const done = meds.filter((m) => !m.doses.some(isDosePending));

  return (
    <>
      {active.length > 0 && (
        <>
          <SectionTitle>Em andamento</SectionTitle>
          {active.map((m) => (
            <MedicationCard key={m.id} med={m} pet={pet} />
          ))}
        </>
      )}
      {done.length > 0 && (
        <>
          <SectionTitle>Concluídos</SectionTitle>
          {done.map((m) => (
            <MedicationCard key={m.id} med={m} pet={pet} />
          ))}
        </>
      )}
    </>
  );
}
