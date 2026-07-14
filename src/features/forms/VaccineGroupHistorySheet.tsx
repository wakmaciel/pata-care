import { dueStatus, fmtDate } from "@/lib/dates";
import { vaccineGroupsList } from "@/domain/vaccines";
import { categoryConfig } from "@/domain/categories";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Icon } from "@/components/ui/Icon";
import { SheetHeader } from "@/components/ui/OverlayHost";
import { VaccineFormSheet } from "@/features/forms/VaccineFormSheet";
import type { Pet } from "@/types";

export function VaccineGroupHistorySheet({ pet, groupKey }: { pet: Pet; groupKey: string }) {
  const { records } = useDataStore();
  const { openSheet, showLightbox } = useUiStore();
  const group = vaccineGroupsList(records, pet.id).find((g) => g.key === groupKey);
  if (!group) return null;

  const cfg = categoryConfig("vaccine");
  const last = group.records[group.records.length - 1]!;
  const st = dueStatus(last.nextDate);

  let nextBanner: React.ReactNode = null;
  if (last.nextDate) {
    const color =
      st.status === "overdue"
        ? "var(--red)"
        : st.status === "soon"
          ? "var(--peach)"
          : "var(--mint)";
    const bg =
      st.status === "overdue"
        ? "var(--red-soft)"
        : st.status === "soon"
          ? "var(--peach-soft)"
          : "var(--mint-soft)";
    const txt =
      st.status === "overdue"
        ? `Próxima dose atrasada há ${st.days} dia${st.days === 1 ? "" : "s"} (prevista para ${fmtDate(last.nextDate)})`
        : st.status === "soon"
          ? `Próxima dose em ${st.days} dia${st.days === 1 ? "" : "s"} (${fmtDate(last.nextDate)})`
          : `Próxima dose prevista para ${fmtDate(last.nextDate)}`;
    nextBanner = (
      <div className="vtl-next" style={{ background: bg, color }}>
        <Icon name="calendar" /> {txt}
      </div>
    );
  }

  return (
    <div>
      <SheetHeader title={group.title} />
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
        Ordem cronológica · toque em uma dose para editar
      </p>
      <div className="vtl">
        {group.records.map((r) => (
          <div key={r.id} className="vtl-row">
            <div className="vtl-date">{fmtDate(r.date)}</div>
            <div className="vtl-spine">
              <span className="vtl-dot" />
            </div>
            <div
              className="vtl-card"
              onClick={() => openSheet(<VaccineFormSheet pet={pet} existing={r} />)}
            >
              <h4>{cfg.getBadge?.(r) ?? group.title}</h4>
              {r.notes && <div className="sub">{r.notes}</div>}
              {r.photo && (
                <img
                  className="vtl-thumb"
                  src={r.photo}
                  alt="Etiqueta"
                  onClick={(e) => {
                    e.stopPropagation();
                    showLightbox(r.photo!);
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      {nextBanner}
    </div>
  );
}
