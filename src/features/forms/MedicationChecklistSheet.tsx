import { fmtDateTime } from "@/lib/dates";
import {
  doseStatus,
  isDoseDone,
  isDoseMissed,
  isPendingExpired,
  withDoseStatus,
} from "@/domain/medications";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MedicationFormSheet } from "@/features/forms/MedicationFormSheet";
import type { DoseStatus, MedicationRecord, Pet } from "@/types";

export function MedicationChecklistSheet({ medId, pet }: { medId: string; pet: Pet }) {
  const { records, putRecord } = useDataStore();
  const { toast, openSheet } = useUiStore();
  const med = records.find(
    (r): r is MedicationRecord => r.id === medId && r.category === "medication"
  );
  if (!med) return null;

  const doneCount = med.doses.filter(isDoseDone).length;
  const missedCount = med.doses.filter(isDoseMissed).length;

  const setStatus = async (index: number, status: DoseStatus) => {
    const updated: MedicationRecord = {
      ...med,
      doses: med.doses.map((d, i) => (i === index ? withDoseStatus(d, status) : d)),
    };
    await putRecord(updated);
    toast(
      status === "done"
        ? "Dose marcada como aplicada!"
        : status === "missed"
          ? "Dose marcada como não aplicada"
          : "Dose voltou para pendente"
    );
  };

  return (
    <div>
      <div className="sheet-header">
        <h3>{med.name}</h3>
        <button
          className="icon-btn"
          aria-label="Fechar"
          onClick={() => useUiStore.getState().closeSheet()}
        >
          <Icon name="close" />
        </button>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
        {med.doseAmount} {med.doseUnit} · a cada {med.frequencyHours}h · {doneCount} de{" "}
        {med.doses.length} aplicadas
        {missedCount > 0 && ` · ${missedCount} não aplicada${missedCount === 1 ? "" : "s"}`}
      </p>
      <div className="card" style={{ padding: "6px 12px", marginBottom: 16 }}>
        {med.doses.map((d, i) => {
          const status = doseStatus(d);
          const overdue = status === "pending" && new Date(d.scheduledAt) < new Date();
          const expired = isPendingExpired(d, med.frequencyHours);
          let iconBg: string;
          let iconColor: string;
          let iconName: "check" | "close" | "clock";
          let subText: string;
          let subStyle: React.CSSProperties = {};
          if (status === "done") {
            iconBg = "var(--mint-soft)";
            iconColor = "var(--mint)";
            iconName = "check";
            subText = "Aplicada em " + fmtDateTime(d.doneAt);
          } else if (status === "missed") {
            iconBg = "var(--red-soft)";
            iconColor = "var(--red)";
            iconName = "close";
            subText = "Marcada como não aplicada";
            subStyle = { color: "var(--red)", fontWeight: 700 };
          } else {
            iconBg = expired
              ? "var(--red-soft)"
              : overdue
                ? "var(--peach-soft)"
                : "var(--surface-2)";
            iconColor = expired ? "var(--red)" : overdue ? "var(--peach)" : "var(--pink-strong)";
            iconName = "clock";
            subText =
              (expired
                ? "Provavelmente não aplicada — prevista "
                : overdue
                  ? "Atrasada — prevista "
                  : "Prevista para ") + fmtDateTime(d.scheduledAt);
            if (expired) subStyle = { color: "var(--red)", fontWeight: 700 };
            else if (overdue) subStyle = { color: "var(--peach)", fontWeight: 700 };
          }
          return (
            <div key={d.scheduledAt + i} className="settings-row med-dose-row">
              <div className="ic" style={{ background: iconBg }}>
                <span style={{ color: iconColor, display: "flex" }}>
                  <Icon name={iconName} />
                </span>
              </div>
              <div className="lbl">
                <div className="t">
                  Dose {i + 1} de {med.doses.length}
                </div>
                <div className="s" style={subStyle}>
                  {subText}
                </div>
              </div>
              <div className="dose-actions">
                {status === "pending" ? (
                  <>
                    <button
                      className="dose-act-btn ok"
                      aria-label="Marcar como aplicada"
                      onClick={() => setStatus(i, "done")}
                    >
                      <Icon name="check" />
                    </button>
                    <button
                      className="dose-act-btn bad"
                      aria-label="Marcar como não aplicada"
                      onClick={() => setStatus(i, "missed")}
                    >
                      <Icon name="close" />
                    </button>
                  </>
                ) : (
                  <button className="dose-undo-btn" onClick={() => setStatus(i, "pending")}>
                    Desfazer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Button
        variant="secondary"
        block
        onClick={() => openSheet(<MedicationFormSheet petId={pet.id} existing={med} />)}
      >
        <Icon name="edit" /> Editar medicamento
      </Button>
    </div>
  );
}
