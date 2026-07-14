import { calcAge, dueStatus, fmtDate } from "@/lib/dates";
import { careRecordsFor, recordsFor } from "@/domain/care";
import { isDosePending } from "@/domain/medications";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { navigate } from "@/router";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/Field";
import { MeasurementsFormSheet } from "@/features/forms/MeasurementsFormSheet";
import { speciesLabel } from "@/features/pets/PetAvatar";
import type { MedicationRecord, Pet, WeightRecord } from "@/types";

function SettingsRow({
  icon,
  title,
  sub,
  style,
}: {
  icon: IconName;
  title: React.ReactNode;
  sub?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="settings-row" style={style}>
      <div className="ic">
        <Icon name={icon} />
      </div>
      <div className="lbl">
        <div className="t">{title}</div>
        {sub && <div className="s">{sub}</div>}
      </div>
    </div>
  );
}

export function OverviewTab({ pet }: { pet: Pet }) {
  const { pets, records } = useDataStore();
  const { openSheet } = useUiStore();

  const vac = recordsFor(records, pet.id, "vaccine");
  const anti = recordsFor(records, pet.id, "antiparasitic");
  const derm = recordsFor(records, pet.id, "dewormer");
  const weights = recordsFor<WeightRecord>(records, pet.id, "weight");
  const lastWeight = weights[0];
  const careLatest = careRecordsFor(records, pets, pet.id);

  const m: Partial<import("@/types").Measurements> = pet.measurements ?? {};
  const hasMeasurements = !!(m.neck || m.chest || m.length);

  function careRow(icon: IconName, label: string, count: number, category: string, hash: string) {
    const latestOfCategory = careLatest.filter((x) => x.category === category && x.nextDate);
    let worst: "overdue" | "soon" | null = null;
    latestOfCategory.forEach((x) => {
      const s = dueStatus(x.nextDate);
      if (s.status === "overdue") worst = "overdue";
      else if (s.status === "soon" && worst !== "overdue") worst = "soon";
    });
    let status: React.ReactNode = (
      <span className="s">
        {count} registro{count === 1 ? "" : "s"}
      </span>
    );
    if (worst === "overdue")
      status = (
        <span className="s" style={{ color: "var(--red)", fontWeight: 700 }}>
          Atrasado
        </span>
      );
    else if (worst === "soon")
      status = (
        <span className="s" style={{ color: "var(--peach)", fontWeight: 700 }}>
          Próxima em breve
        </span>
      );
    return (
      <div className="settings-row" style={{ cursor: "pointer" }} onClick={() => navigate(hash)}>
        <div className="ic">
          <Icon name={icon} />
        </div>
        <div className="lbl">
          <div className="t">{label}</div>
          {status}
        </div>
        <span className="chevron">
          <Icon name="chevronRight" />
        </span>
      </div>
    );
  }

  const meds = records.filter(
    (r): r is MedicationRecord => r.petId === pet.id && r.category === "medication"
  );
  const medActive = meds.filter((mrec) => mrec.doses.some(isDosePending));

  return (
    <>
      <div className="card">
        <SettingsRow
          icon="calendar"
          title="Nascimento"
          sub={
            pet.birthDate
              ? fmtDate(pet.birthDate) + " · " + calcAge(pet.birthDate)
              : "Não informado"
          }
          style={{ paddingTop: 0 }}
        />
        <SettingsRow
          icon={pet.species === "cat" ? "cat" : "dog"}
          title="Espécie e raça"
          sub={`${speciesLabel(pet)} · ${pet.breed || "—"}`}
        />
        <SettingsRow icon="heart" title="Castrado(a)" sub={pet.neutered ? "Sim" : "Não"} />
        {pet.microchip && <SettingsRow icon="chip" title="Microchip" sub={pet.microchip} />}
        {pet.notes && <SettingsRow icon="info" title="Observações" sub={pet.notes} />}
      </div>

      <SectionTitle>Medidas (para roupas)</SectionTitle>
      <div
        className="card"
        style={{ cursor: "pointer" }}
        onClick={() => openSheet(<MeasurementsFormSheet pet={pet} />)}
      >
        <SettingsRow
          icon="ruler"
          title="Pescoço"
          sub={m.neck ? m.neck + " cm" : "Não informado"}
          style={{ paddingTop: 0 }}
        />
        <SettingsRow
          icon="ruler"
          title="Peito/Tórax"
          sub={m.chest ? m.chest + " cm" : "Não informado"}
        />
        <SettingsRow
          icon="ruler"
          title="Comprimento do dorso"
          sub={m.length ? m.length + " cm" : "Não informado"}
        />
        {m.notes && <SettingsRow icon="info" title="Observações" sub={m.notes} />}
        <div className="settings-row">
          <div className="ic">
            <Icon name="edit" />
          </div>
          <div className="lbl">
            <div className="t" style={{ color: "var(--pink-strong)" }}>
              {hasMeasurements ? "Editar medidas" : "Adicionar medidas"}
            </div>
            {m.updatedAt && <div className="s">Atualizado em {fmtDate(m.updatedAt)}</div>}
          </div>
          <span className="chevron">
            <Icon name="chevronRight" />
          </span>
        </div>
      </div>

      <SectionTitle>Resumo de cuidados</SectionTitle>
      <div className="card">
        {careRow("syringe", "Vacinas", vac.length, "vaccine", `#/pet/${pet.id}/vaccine`)}
        <div
          className="settings-row"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`#/pet/${pet.id}/medication`)}
        >
          <div className="ic">
            <Icon name="medkit" />
          </div>
          <div className="lbl">
            <div className="t">Medicamentos</div>
            {medActive.length > 0 ? (
              <span className="s" style={{ color: "var(--pink-strong)", fontWeight: 700 }}>
                {medActive.length} em andamento
              </span>
            ) : (
              <span className="s">
                {meds.length} registrado{meds.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <span className="chevron">
            <Icon name="chevronRight" />
          </span>
        </div>
        {careRow(
          "bug",
          "Antipulgas/Carrapatos",
          anti.length,
          "antiparasitic",
          `#/pet/${pet.id}/antiparasitic`
        )}
        {careRow("pill", "Vermífugos", derm.length, "dewormer", `#/pet/${pet.id}/dewormer`)}
        {careRow(
          "stethoscope",
          "Consultas",
          recordsFor(records, pet.id, "consultation").length,
          "consultation",
          `#/pet/${pet.id}/consultation`
        )}
        {careRow(
          "clipboard",
          "Exames",
          recordsFor(records, pet.id, "exam").length,
          "exam",
          `#/pet/${pet.id}/exam`
        )}
        {careRow(
          "scissors",
          "Cirurgias",
          recordsFor(records, pet.id, "surgery").length,
          "surgery",
          `#/pet/${pet.id}/surgery`
        )}
        <div
          className="settings-row"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`#/pet/${pet.id}/weight`)}
        >
          <div className="ic">
            <Icon name="scale" />
          </div>
          <div className="lbl">
            <div className="t">Peso</div>
            <span className="s">
              {lastWeight
                ? lastWeight.weight + " kg em " + fmtDate(lastWeight.date)
                : "Sem registros"}
            </span>
          </div>
          <span className="chevron">
            <Icon name="chevronRight" />
          </span>
        </div>
      </div>
    </>
  );
}
