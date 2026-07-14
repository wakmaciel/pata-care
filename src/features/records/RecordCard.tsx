import { dueStatus, fmtDate, MONTHS_ABBR, pad, parseISODate } from "@/lib/dates";
import { recordDisplayTitle, type CategoryConfig } from "@/domain/categories";
import { useUiStore } from "@/store/ui";
import { Icon } from "@/components/ui/Icon";
import { AttachStrip } from "@/components/ui/AttachmentsField";
import { CalendarSheet } from "@/features/forms/CalendarSheet";
import type { AnyRecord, Pet } from "@/types";

export function RecordStamp({ dateISO }: { dateISO: string }) {
  const d = parseISODate(dateISO);
  return (
    <div className="record-stamp">
      <span className="d">{pad(d.getDate())}</span>
      <span className="m">{MONTHS_ABBR[d.getMonth()]}</span>
    </div>
  );
}

export function RecordCard({
  rec,
  cfg,
  pet,
  isLatest,
  onEdit,
}: {
  rec: AnyRecord;
  cfg: CategoryConfig;
  pet: Pet;
  isLatest: boolean;
  onEdit: () => void;
}) {
  const { openSheet, showLightbox } = useUiStore();
  const date = "date" in rec ? rec.date : "";
  const nextDate = "nextDate" in rec ? rec.nextDate : null;
  const st = dueStatus(nextDate);
  const title = recordDisplayTitle(rec, cfg);
  const badge = cfg.getBadge ? cfg.getBadge(rec) : null;
  const photo = "photo" in rec ? rec.photo : null;
  const attachments = "attachments" in rec ? rec.attachments : undefined;

  let next: React.ReactNode = null;
  if (nextDate && isLatest) {
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
          ? `Em ${st.days} dia${st.days === 1 ? "" : "s"} (${fmtDate(nextDate)})`
          : `Próxima em ${fmtDate(nextDate)}`;
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
                  title={title}
                  dateISO={nextDate}
                  notes={rec.notes || ""}
                />
              );
            }}
          >
            📅
          </button>
        </div>
      </>
    );
  } else if (nextDate && !isLatest) {
    next = (
      <>
        <hr className="record-divider" />
        <div className="record-next" style={{ color: "var(--text-faint)" }}>
          <Icon name="check" /> Substituída por um registro mais novo
        </div>
      </>
    );
  }

  return (
    <div className="record">
      <RecordStamp dateISO={date} />
      <div className="record-body">
        <h4 onClick={onEdit} style={{ cursor: "pointer" }}>
          {title}
        </h4>
        <div className="sub" onClick={onEdit} style={{ cursor: "pointer" }}>
          {fmtDate(date)}
          {badge ? " · " + badge : ""}
        </div>
        {rec.notes && <div className="sub">{rec.notes}</div>}
        {attachments && attachments.length > 0 && <AttachStrip attachments={attachments} />}
        {next}
      </div>
      {photo && (
        <img
          className="record-thumb"
          src={photo}
          alt="Etiqueta"
          onClick={(e) => {
            e.stopPropagation();
            showLightbox(photo);
          }}
        />
      )}
      <button className="record-menu-btn" aria-label="Editar" onClick={onEdit}>
        <Icon name="dots" />
      </button>
    </div>
  );
}
