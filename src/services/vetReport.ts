/* Relatório para o veterinário — gera HTML imprimível numa nova aba (PDF via impressão). */
import { calcAge, fmtDate } from "@/lib/dates";
import { petsSorted, recordsFor } from "@/domain/care";
import { isDoseDone, isDoseMissed } from "@/domain/medications";
import { vaccineTypeLabel } from "@/domain/vaccines";
import { useDataStore } from "@/store/data";
import { toast } from "@/store/ui";
import type {
  ApplicationRecord,
  ConsultationRecord,
  ExamRecord,
  HeatRecord,
  MedicationRecord,
  Pet,
  SurgeryRecord,
  VaccineRecord,
  WeightRecord,
} from "@/types";

function escapeHtml(s: unknown): string {
  return String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );
}

export function generateVetReport(selection: string) {
  const { pets: allPets } = useDataStore.getState();
  const pets =
    selection === "all" ? petsSorted(allPets) : allPets.filter((p) => p.id === selection);
  if (pets.length === 0) {
    toast("Selecione um pet");
    return;
  }

  const petsHtml = pets
    .map((pet) => buildVetReportSection(pet))
    .join('<div style="page-break-before:always"></div>');
  const generatedAt = new Date().toLocaleString("pt-BR");

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>Relatório PataCare</title>
<style>
  *{ box-sizing: border-box; }
  html{ -webkit-text-size-adjust: 100%; }
  body{ font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color:#2b2b2b; max-width:780px; width:100%; margin:0 auto; padding:28px 24px 60px; overflow-x:hidden; }
  h1{ font-size:22px; margin:0 0 2px; color:#C23A6B; }
  .gen{ font-size:11.5px; color:#888; margin-bottom:22px; }
  .pet-block{ max-width:100%; }
  .pet-block h2{ font-size:18px; border-bottom:2px solid #F2598A; padding-bottom:6px; margin-top:0; word-wrap:break-word; }
  .pet-meta{ font-size:13px; color:#555; margin-bottom:16px; word-wrap:break-word; }
  h3{ font-size:14px; color:#C23A6B; margin:20px 0 6px; }
  table{ width:100%; max-width:100%; border-collapse: collapse; font-size:12.5px; margin-bottom:6px; table-layout:auto; }
  th{ text-align:left; background:#FFEFF3; padding:6px 8px; font-weight:700; color:#3A2236; border-bottom:1px solid #eee; overflow-wrap:anywhere; }
  td{ padding:6px 8px; border-bottom:1px solid #f0f0f0; vertical-align:top; overflow-wrap:break-word; word-break:break-word; }
  .empty{ font-size:12.5px; color:#999; font-style:italic; padding:4px 8px 14px; }
  .footer{ margin-top:36px; font-size:11px; color:#999; border-top:1px solid #eee; padding-top:12px; line-height:1.5; }
  .print-bar{ position:sticky; top:0; background:#fff; padding:10px 0 16px; text-align:right; }
  .print-bar button{ background:#F2598A; color:#fff; border:none; padding:10px 18px; border-radius:20px; font-weight:700; font-size:13px; cursor:pointer; }
  @media (max-width: 480px){
    body{ padding:18px 14px 48px; }
    h1{ font-size:19px; }
    table{ font-size:11.5px; }
    th, td{ padding:5px 6px; }
  }
  @media print{
    .print-bar{ display:none; }
    body{ padding:0 4mm; max-width:100%; }
    @page{ margin: 12mm; }
  }
</style></head>
<body>
  <div class="print-bar"><button onclick="window.print()">Imprimir / Salvar PDF</button></div>
  <h1>🐾 Relatório PataCare</h1>
  <div class="gen">Gerado em ${generatedAt}</div>
  ${petsHtml}
  <div class="footer">Este relatório foi gerado automaticamente a partir dos registros inseridos pelo tutor no app PataCare. As previsões de próximas doses seguem protocolos veterinários gerais usados no Brasil e não substituem a avaliação de um médico-veterinário.</div>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    toast("Permita pop-ups para gerar o relatório");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function buildVetReportSection(pet: Pet): string {
  const { records } = useDataStore.getState();
  const vac = recordsFor<VaccineRecord>(records, pet.id, "vaccine");
  const anti = recordsFor<ApplicationRecord>(records, pet.id, "antiparasitic");
  const derm = recordsFor<ApplicationRecord>(records, pet.id, "dewormer");
  const weights = recordsFor<WeightRecord>(records, pet.id, "weight");
  const heat = pet.sex === "F" ? recordsFor<HeatRecord>(records, pet.id, "heat") : [];
  const meds = records.filter(
    (r): r is MedicationRecord => r.petId === pet.id && r.category === "medication"
  );
  const consultations = recordsFor<ConsultationRecord>(records, pet.id, "consultation");
  const exams = recordsFor<ExamRecord>(records, pet.id, "exam");
  const surgeries = recordsFor<SurgeryRecord>(records, pet.id, "surgery");

  function table(headers: string[], rows: string[][]): string {
    if (rows.length === 0) return `<div class="empty">Nenhum registro.</div>`;
    return `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("")}</tbody></table>`;
  }
  // valores curtos (datas, doses, pesos) não devem quebrar no meio — só texto livre quebra
  function nw(s: string): string {
    return `<span style="white-space:nowrap">${s}</span>`;
  }

  const vacRows = vac.map((r) => [
    escapeHtml(
      r.vaccineType && r.vaccineType !== "outra"
        ? vaccineTypeLabel(r.vaccineType)
        : r.name || "Vacina"
    ),
    nw(fmtDate(r.date)),
    nw(escapeHtml(r.doseNumber ? (r.isBooster ? "Reforço anual" : `Dose ${r.doseNumber}`) : "—")),
    nw(r.nextDate ? fmtDate(r.nextDate) : "—"),
  ]);
  const antiRows = anti.map((r) => [
    escapeHtml(r.product),
    nw(fmtDate(r.date)),
    nw(r.nextDate ? fmtDate(r.nextDate) : "—"),
  ]);
  const dermRows = derm.map((r) => [
    escapeHtml(r.product),
    nw(fmtDate(r.date)),
    nw(r.nextDate ? fmtDate(r.nextDate) : "—"),
  ]);
  const weightRows = weights
    .slice(0, 12)
    .map((r) => [nw(fmtDate(r.date)), nw(r.weight + " kg"), escapeHtml(r.notes || "")]);
  const heatRows = heat.map((r) => [
    nw(fmtDate(r.startDate)),
    nw(r.endDate ? fmtDate(r.endDate) : "Em andamento"),
  ]);
  const medRows = meds.map((m) => {
    const done = m.doses.filter(isDoseDone).length;
    const missed = m.doses.filter(isDoseMissed).length;
    const progress = `${done}/${m.doses.length} aplicadas${missed > 0 ? ` · ${missed} não aplicada${missed === 1 ? "" : "s"}` : ""}`;
    return [
      escapeHtml(m.name),
      nw(`${m.doseAmount} ${escapeHtml(m.doseUnit || "")} a cada ${m.frequencyHours}h`),
      nw(progress),
    ];
  });
  const consultRows = consultations.map((r) => [
    nw(fmtDate(r.date)),
    escapeHtml(r.vet || "—") +
      (r.crm
        ? ` <span style="white-space:nowrap;color:#999">(CRMV ${escapeHtml(r.crm)})</span>`
        : ""),
    escapeHtml(r.reason || "—"),
    nw(r.hasReturn && r.nextDate ? fmtDate(r.nextDate) : "—"),
  ]);
  const examRows = exams.map((r) => [
    escapeHtml(r.examType || "Exame"),
    nw(fmtDate(r.date)),
    escapeHtml(r.vet || "—") +
      (r.crm
        ? ` <span style="white-space:nowrap;color:#999">(CRMV ${escapeHtml(r.crm)})</span>`
        : ""),
    nw(
      r.attachments && r.attachments.length
        ? `${r.attachments.length} anexo${r.attachments.length === 1 ? "" : "s"} (ver no app)`
        : "—"
    ),
  ]);
  const surgeryRows = surgeries.map((r) => [
    escapeHtml(r.surgeryType || "Cirurgia"),
    nw(fmtDate(r.date)),
    escapeHtml(r.vet || "—") +
      (r.crm
        ? ` <span style="white-space:nowrap;color:#999">(CRMV ${escapeHtml(r.crm)})</span>`
        : ""),
    nw(
      r.attachments && r.attachments.length
        ? `${r.attachments.length} anexo${r.attachments.length === 1 ? "" : "s"} (ver no app)`
        : "—"
    ),
  ]);

  return `
    <div class="pet-block">
      <h2>${escapeHtml(pet.name)}</h2>
      <div class="pet-meta">${pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Outro"} · ${escapeHtml(pet.breed || "Raça não informada")} · ${pet.sex === "F" ? "Fêmea" : "Macho"} · ${pet.neutered ? "Castrado(a)" : "Não castrado(a)"}${pet.birthDate ? " · Nascimento: " + fmtDate(pet.birthDate) + " (" + calcAge(pet.birthDate) + ")" : ""}${pet.microchip ? " · Microchip: " + escapeHtml(pet.microchip) : ""}</div>

      <h3>Vacinas</h3>
      ${table(["Vacina", "Data", "Dose", "Próxima"], vacRows)}

      <h3>Consultas</h3>
      ${table(["Data", "Veterinário(a)", "Motivo", "Retorno"], consultRows)}

      <h3>Exames</h3>
      ${table(["Exame", "Data", "Veterinário(a)/Clínica", "Anexos"], examRows)}

      <h3>Cirurgias</h3>
      ${table(["Cirurgia", "Data", "Veterinário(a)/Clínica", "Anexos"], surgeryRows)}

      <h3>Antipulgas / Carrapatos</h3>
      ${table(["Produto", "Data", "Próxima aplicação"], antiRows)}

      <h3>Vermífugos</h3>
      ${table(["Produto", "Data", "Próxima aplicação"], dermRows)}

      <h3>Peso (últimos registros)</h3>
      ${table(["Data", "Peso", "Observações"], weightRows)}

      ${pet.sex === "F" ? `<h3>Cio</h3>${table(["Início", "Fim"], heatRows)}` : ""}

      <h3>Medicamentos</h3>
      ${table(["Medicamento", "Posologia", "Progresso"], medRows)}
    </div>`;
}
