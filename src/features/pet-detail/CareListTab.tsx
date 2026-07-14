import { dueStatus, fmtDate, MONTHS_ABBR, pad, parseISODate } from "@/lib/dates";
import {
  stepProtocolForward,
  vaccineDoseLabel,
  vaccineGroupsList,
  VACCINE_PROTOCOLS,
  type VaccineGroup,
} from "@/domain/vaccines";
import { latestRecordIdsForCategory, recordsFor } from "@/domain/care";
import { categoryConfig } from "@/domain/categories";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecordCard } from "@/features/records/RecordCard";
import { recordFormSheetFor } from "@/features/forms/recordFormFor";
import { VaccineGroupHistorySheet } from "@/features/forms/VaccineGroupHistorySheet";
import { CalendarSheet } from "@/features/forms/CalendarSheet";
import type { Pet, VaccineRecord } from "@/types";

type CareCategory = "vaccine" | "antiparasitic" | "dewormer" | "exam" | "surgery" | "consultation";

function VaccineForecast({ pet }: { pet: Pet }) {
  const { records, putPet } = useDataStore();
  const { openSheet } = useUiStore();
  const disabled = pet.disabledVaccineTypes || [];
  const all = recordsFor<VaccineRecord>(records, pet.id, "vaccine"); // desc by date
  const types = [...new Set(all.map((r) => r.vaccineType).filter((t) => t && t !== "outra"))];
  if (types.length === 0) return null;

  return (
    <>
      <SectionTitle>Previsão de vacinas</SectionTitle>
      {types.map((type) => {
        const protocol = VACCINE_PROTOCOLS[type];
        if (!protocol) return null;
        const isOff = disabled.includes(type);
        const recsAsc = all
          .filter((r) => r.vaccineType === type)
          .sort((a, b) => a.date.localeCompare(b.date));
        const last = recsAsc[recsAsc.length - 1];
        const nodes: { date: string; label: string; done: boolean; faded?: boolean }[] = recsAsc
          .slice(-2)
          .map((r) => ({
            date: r.date,
            label: vaccineDoseLabel(r.doseNumber, r.isBooster, r.date),
            done: true,
          }));
        if (last && last.nextDate) {
          const lastDoseNum = last.doseNumber || recsAsc.length;
          const lastIsBooster = !!last.isBooster;
          const predicted = lastIsBooster
            ? { doseNumber: lastDoseNum + 1, date: last.nextDate, isBooster: true }
            : lastDoseNum + 1 > (protocol.initialDoses ?? 0)
              ? { doseNumber: lastDoseNum + 1, date: last.nextDate, isBooster: true }
              : { doseNumber: lastDoseNum + 1, date: last.nextDate, isBooster: false };
          nodes.push({
            date: predicted.date,
            label: vaccineDoseLabel(predicted.doseNumber, predicted.isBooster, predicted.date),
            done: false,
          });
          const future = stepProtocolForward(protocol, predicted.doseNumber, predicted.date);
          nodes.push({
            date: future.date,
            label: vaccineDoseLabel(future.doseNumber, future.isBooster, future.date),
            done: false,
            faded: true,
          });
        }
        const shown = nodes.slice(-3);
        const edgeColor = (a: number, b: number) => {
          if (shown[a]!.done) return "var(--mint)";
          if (shown[b]!.faded) return "var(--border)";
          return "var(--pink)";
        };

        const toggle = async () => {
          const set = new Set(pet.disabledVaccineTypes || []);
          if (set.has(type)) set.delete(type);
          else set.add(type);
          await putPet({ ...pet, disabledVaccineTypes: [...set] });
        };

        const openHistory = () => {
          openSheet(<VaccineGroupHistorySheet pet={pet} groupKey={"vaccine:" + type} />);
        };

        return (
          <div
            key={type}
            className={"card vaccine-forecast" + (isOff ? " is-off" : "")}
            style={{ marginBottom: 12 }}
          >
            <div className="vf-head">
              <span className="vf-icon">
                <Icon name="syringe" />
              </span>
              <h4>{protocol.label}</h4>
              <button
                className="vf-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
              >
                <Icon name={isOff ? "check" : "close"} /> {isOff ? "Habilitar" : "Desabilitar"}
              </button>
            </div>
            <div className="vf-row" onClick={openHistory}>
              {shown.map((n, i) => {
                const dotColor = n.done ? "var(--mint)" : n.faded ? "var(--border)" : "var(--pink)";
                const legLeft = i === 0 ? "transparent" : edgeColor(i - 1, i);
                const legRight = i === shown.length - 1 ? "transparent" : edgeColor(i, i + 1);
                return (
                  <div key={i} className="vf-col">
                    <div className="vf-date">{fmtDate(n.date)}</div>
                    <div className="vf-line">
                      <span className="vf-seg" style={{ background: legLeft }} />
                      <span className="vf-dot" style={{ background: dotColor }} />
                      <span className="vf-seg" style={{ background: legRight }} />
                    </div>
                    <div className="vf-label">{n.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function VaccineGroupRow({ group, pet }: { group: VaccineGroup; pet: Pet }) {
  const { openSheet } = useUiStore();
  const last = group.records[group.records.length - 1]!;
  const st = dueStatus(last.nextDate);
  const d = parseISODate(last.date);
  const openHistory = () => openSheet(<VaccineGroupHistorySheet pet={pet} groupKey={group.key} />);

  let next: React.ReactNode = null;
  if (last.nextDate) {
    const color =
      st.status === "overdue"
        ? "var(--red)"
        : st.status === "soon"
          ? "var(--peach)"
          : "var(--mint)";
    const txt =
      st.status === "overdue"
        ? `Atrasado há ${st.days} dia${st.days === 1 ? "" : "s"}`
        : st.status === "soon"
          ? `Em ${st.days} dia${st.days === 1 ? "" : "s"}`
          : `Próxima em ${fmtDate(last.nextDate)}`;
    next = (
      <>
        <hr className="record-divider" />
        <div
          className="record-next"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
        >
          <span style={{ color, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="calendar" /> {txt}
          </span>
          <button
            className="btn btn-sm btn-secondary"
            style={{ padding: "5px 8px", fontSize: 14, flexShrink: 0 }}
            aria-label="Agendar no calendário"
            onClick={(e) => {
              e.stopPropagation();
              openSheet(
                <CalendarSheet
                  petName={pet.name}
                  title={group.title}
                  dateISO={last.nextDate!}
                  notes=""
                />
              );
            }}
          >
            📅
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="record" style={{ cursor: "pointer" }}>
      <div className="record-stamp">
        <span className="d">{pad(d.getDate())}</span>
        <span className="m">{MONTHS_ABBR[d.getMonth()]}</span>
      </div>
      <div className="record-body" style={{ flex: 1 }} onClick={openHistory}>
        <h4>{group.title}</h4>
        <span className="sub">
          {group.records.length} dose{group.records.length === 1 ? "" : "s"} · última em{" "}
          {fmtDate(last.date)}
        </span>
        {next}
      </div>
      <span className="chevron" onClick={openHistory}>
        <Icon name="chevronRight" />
      </span>
    </div>
  );
}

export function CareListTab({ pet, category }: { pet: Pet; category: CareCategory }) {
  const { records } = useDataStore();
  const { openSheet } = useUiStore();
  const cfg = categoryConfig(category);
  const list = recordsFor(records, pet.id, category);
  const openForm = (rec: (typeof list)[number] | null) =>
    openSheet(recordFormSheetFor(category, pet, rec));

  return (
    <>
      {category === "vaccine" && <VaccineForecast pet={pet} />}

      {list.length === 0 ? (
        <EmptyState
          icon={cfg.icon}
          title={cfg.emptyTitle}
          text={cfg.emptyText}
          action={
            <Button onClick={() => openForm(null)}>
              <Icon name="plus" /> Adicionar
            </Button>
          }
        />
      ) : category === "vaccine" ? (
        <>
          <SectionTitle>Histórico (por vacina)</SectionTitle>
          {vaccineGroupsList(records, pet.id).map((group) => (
            <VaccineGroupRow key={group.key} group={group} pet={pet} />
          ))}
        </>
      ) : (
        (() => {
          const latestIds = latestRecordIdsForCategory(records, pet.id, category);
          return list.map((rec) => (
            <RecordCard
              key={rec.id}
              rec={rec}
              cfg={cfg}
              pet={pet}
              isLatest={latestIds.has(rec.id)}
              onEdit={() => openForm(rec)}
            />
          ));
        })()
      )}
    </>
  );
}
