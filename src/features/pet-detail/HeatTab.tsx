import { daysBetween, fmtDate, MONTHS_ABBR, pad, parseISODate, todayISO } from "@/lib/dates";
import { recordsFor } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { GenericRecordFormSheet } from "@/features/forms/GenericRecordFormSheet";
import type { HeatRecord, Pet } from "@/types";

export function HeatTab({ pet }: { pet: Pet }) {
  const { records } = useDataStore();
  const { openSheet } = useUiStore();
  const list = recordsFor<HeatRecord>(records, pet.id, "heat"); // desc by startDate
  const readOnly = !!pet.neutered;
  const openForm = (rec: HeatRecord | null) =>
    openSheet(<GenericRecordFormSheet category="heat" petId={pet.id} existing={rec} />);

  const banners: React.ReactNode[] = [];
  if (readOnly) {
    banners.push(
      <div key="neutered" className="heat-banner mint">
        <Icon name="check" />
        <div>
          <div className="t">Pet castrada</div>
          <div className="s">
            Não são esperados novos ciclos de cio. O histórico abaixo é só para consulta.
          </div>
        </div>
      </div>
    );
  }
  if (list.length > 0 && !readOnly) {
    const last = list[0]!;
    const sinceDays = daysBetween(last.startDate, todayISO());
    let intervalTxt = "";
    if (list.length >= 2) {
      const win = list.slice(0, Math.min(list.length, 4));
      const avg = Math.round(
        win.reduce((acc, r, idx, arr) => {
          if (idx === arr.length - 1) return acc;
          return acc + Math.abs(daysBetween(arr[idx + 1]!.startDate, r.startDate));
        }, 0) /
          (win.length - 1)
      );
      intervalTxt = ` · intervalo médio de ${avg} dias`;
    }
    banners.push(
      <div key="last" className="heat-banner">
        <Icon name="heart" />
        <div>
          <div className="t">
            {sinceDays} dia{sinceDays === 1 ? "" : "s"} desde o último início
          </div>
          <div className="s">
            Último cio em {fmtDate(last.startDate)}
            {intervalTxt}
          </div>
        </div>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <>
        {banners}
        {readOnly ? (
          <EmptyState
            icon="check"
            iconClass="mint"
            title="Nenhum ciclo registrado"
            text="Este pet está marcado como castrado — não há histórico de cio para mostrar."
          />
        ) : (
          <EmptyState
            icon="heart"
            title="Nenhum ciclo registrado"
            text="Registre as datas de cio para acompanhar o ciclo da sua pet."
            action={
              <Button onClick={() => openForm(null)}>
                <Icon name="plus" /> Registrar cio
              </Button>
            }
          />
        )}
      </>
    );
  }

  return (
    <>
      {banners}
      {readOnly && <SectionTitle>Histórico (somente visualização)</SectionTitle>}
      {list.map((rec) => {
        const d = parseISODate(rec.startDate);
        const dur = rec.endDate ? daysBetween(rec.startDate, rec.endDate) + 1 : null;
        return (
          <div key={rec.id} className="record">
            <div className="record-stamp">
              <span className="d">{pad(d.getDate())}</span>
              <span className="m">{MONTHS_ABBR[d.getMonth()]}</span>
            </div>
            <div
              className="record-body"
              style={readOnly ? undefined : { cursor: "pointer" }}
              onClick={readOnly ? undefined : () => openForm(rec)}
            >
              <h4>Início em {fmtDate(rec.startDate)}</h4>
              <div className="sub">
                {rec.endDate
                  ? "Fim em " + fmtDate(rec.endDate) + (dur ? " · " + dur + " dias" : "")
                  : "Em andamento"}
              </div>
              {rec.notes && <div className="sub">{rec.notes}</div>}
            </div>
            {!readOnly && (
              <button className="record-menu-btn" aria-label="Editar" onClick={() => openForm(rec)}>
                <Icon name="dots" />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
