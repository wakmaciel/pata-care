import { motion } from "framer-motion";
import { daysBetween, dueStatus, fmtDate, fmtDateTime, todayISO } from "@/lib/dates";
import { careRecordsFor } from "@/domain/care";
import { categoryConfig, recordDisplayTitle, type CategoryConfig } from "@/domain/categories";
import { isDosePending, isPendingExpired, withDoseStatus } from "@/domain/medications";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { navigate } from "@/router";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { PetAvatar } from "@/features/pets/PetAvatar";
import { CalendarSheet } from "@/features/forms/CalendarSheet";
import type { CareRecord, Dose, DueStatusInfo, MedicationRecord, Pet } from "@/types";

interface CareItem {
  pet: Pet;
  rec: CareRecord;
  cfg: CategoryConfig;
  st: DueStatusInfo;
}

function MedReminderRow({ pet, med, next }: { pet: Pet; med: MedicationRecord; next: Dose }) {
  const { putRecord } = useDataStore();
  const { toast } = useUiStore();
  const overdue = new Date(next.scheduledAt) < new Date();
  const expired = isPendingExpired(next, med.frequencyHours);
  const metaStyle: React.CSSProperties = expired
    ? { color: "var(--red)", fontWeight: 700 }
    : overdue
      ? { color: "var(--peach)", fontWeight: 700 }
      : {};
  const metaTxt = expired ? "Provavelmente não aplicada — " : overdue ? "Atrasada — " : "";

  const mark = async (status: "done" | "missed") => {
    const idx = med.doses.indexOf(next);
    const updated: MedicationRecord = {
      ...med,
      doses: med.doses.map((d, i) => (i === idx ? withDoseStatus(d, status) : d)),
    };
    await putRecord(updated);
    toast(status === "done" ? "Dose marcada como aplicada!" : "Dose marcada como não aplicada");
  };

  return (
    <div className="pet-card">
      <PetAvatar pet={pet} style={{ width: 46, height: 46 }} />
      <div
        className="pet-card-info"
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`#/pet/${pet.id}/medication`)}
      >
        <h3 style={{ fontSize: 15 }}>{med.name}</h3>
        <div className="meta" style={metaStyle}>
          {pet.name} · {metaTxt}
          {fmtDateTime(next.scheduledAt)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          className="btn btn-sm btn-primary"
          aria-label="Marcar como aplicada"
          onClick={(e) => {
            e.stopPropagation();
            mark("done");
          }}
        >
          <Icon name="check" />
        </button>
        <button
          className="btn btn-sm btn-danger"
          aria-label="Marcar como não aplicada"
          onClick={(e) => {
            e.stopPropagation();
            mark("missed");
          }}
        >
          <Icon name="close" />
        </button>
      </div>
    </div>
  );
}

function ReminderRow({ item }: { item: CareItem }) {
  const { openSheet } = useUiStore();
  const { pet, rec, cfg, st } = item;
  const color =
    st.status === "overdue" ? "var(--red)" : st.status === "soon" ? "var(--peach)" : "var(--mint)";
  const txt = st.status === "overdue" ? `Atrasado há ${st.days}d` : `Em ${st.days}d`;
  const title = recordDisplayTitle(rec, cfg);
  return (
    <div className="pet-card">
      <PetAvatar pet={pet} style={{ width: 46, height: 46 }} />
      <div
        className="pet-card-info"
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`#/pet/${pet.id}/${rec.category}`)}
      >
        <h3 style={{ fontSize: 15 }}>{title}</h3>
        <div className="meta">
          {pet.name} · {cfg.title} · {fmtDate(rec.nextDate)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        <span className="chip" style={{ background: "transparent", color, fontWeight: 800 }}>
          {txt}
        </span>
        <button
          className="btn btn-sm btn-secondary"
          aria-label="Agendar no calendário"
          style={{ padding: "6px 8px", fontSize: 16 }}
          onClick={(e) => {
            e.stopPropagation();
            openSheet(
              <CalendarSheet
                petName={pet.name}
                title={title}
                dateISO={rec.nextDate!}
                notes={rec.notes || ""}
              />
            );
          }}
        >
          📅
        </button>
      </div>
    </div>
  );
}

export function RemindersView() {
  const { pets, records } = useDataStore();

  const items: CareItem[] = [];
  pets.forEach((pet) => {
    careRecordsFor(records, pets, pet.id).forEach((rec) => {
      if (!rec.nextDate) return;
      items.push({ pet, rec, cfg: categoryConfig(rec.category), st: dueStatus(rec.nextDate) });
    });
  });

  const medItems: { pet: Pet; med: MedicationRecord; next: Dose }[] = [];
  pets.forEach((pet) => {
    records
      .filter((r): r is MedicationRecord => r.petId === pet.id && r.category === "medication")
      .forEach((med) => {
        const next = med.doses.find(isDosePending);
        if (!next) return;
        medItems.push({ pet, med, next });
      });
  });
  medItems.sort(
    (a, b) => new Date(a.next.scheduledAt).getTime() - new Date(b.next.scheduledAt).getTime()
  );

  if (items.length === 0 && medItems.length === 0) {
    return (
      <EmptyState
        icon="bell"
        title="Tudo certo por aqui!"
        text='Quando você definir a "próxima dose" de uma vacina, antipulgas, vermífugo ou medicamento, ela vai aparecer aqui.'
      />
    );
  }

  items.sort(
    (a, b) => daysBetween(todayISO(), a.rec.nextDate!) - daysBetween(todayISO(), b.rec.nextDate!)
  );
  const overdue = items.filter((i) => i.st.status === "overdue");
  const soon = items.filter((i) => i.st.status === "soon");
  const later = items.filter((i) => i.st.status === "ok");

  const section = (title: string, arr: CareItem[]) =>
    arr.length > 0 && (
      <>
        <SectionTitle>{title}</SectionTitle>
        {arr.map((it) => (
          <ReminderRow key={it.rec.id} item={it} />
        ))}
      </>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {medItems.length > 0 && (
        <>
          <SectionTitle>Medicamentos</SectionTitle>
          {medItems.map((it) => (
            <MedReminderRow key={it.med.id} pet={it.pet} med={it.med} next={it.next} />
          ))}
        </>
      )}
      {section("Atrasados", overdue)}
      {section("Próximos 7 dias", soon)}
      {section("Mais adiante", later)}
    </motion.div>
  );
}
