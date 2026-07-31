/* Carteirinha de identificação do pet — gera HTML imprimível numa nova aba (PDF via impressão).
   Só dados de identificação do pet e do tutor: é o que se mostra numa primeira consulta. */
import { calcAge, fmtDate } from "@/lib/dates";
import { petsSorted, recordsFor } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useTutorStore } from "@/store/tutor";
import { toast } from "@/store/ui";
import type { Pet, Tutor, WeightRecord } from "@/types";

function escapeHtml(s: unknown): string {
  return String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );
}

/** Número da carteirinha derivado do id do pet — estável entre gerações. */
function cardNumber(pet: Pet): string {
  const clean = (pet.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const tail = clean.slice(-8).padStart(8, "0");
  return `${tail.slice(0, 4)}-${tail.slice(4)}`;
}

export function generatePetCard(selection: string) {
  const { pets: allPets } = useDataStore.getState();
  const pets =
    selection === "all" ? petsSorted(allPets) : allPets.filter((p) => p.id === selection);
  if (pets.length === 0) {
    toast("Selecione um pet");
    return;
  }

  const tutor = useTutorStore.getState().tutor;
  const cards = pets.map((pet) => buildCard(pet, tutor)).join("");
  const title =
    pets.length === 1 && pets[0] ? `Carteirinha — ${pets[0].name}` : "Carteirinhas PataCare";

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  *{ box-sizing: border-box; }
  html{ -webkit-text-size-adjust: 100%; }
  body{ font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color:#2b2b2b; background:#f6f2f4; margin:0; padding:18px 14px 48px; }
  .wrap{ max-width:460px; margin:0 auto; }
  .print-bar{ position:sticky; top:0; z-index:2; background:#f6f2f4; padding:8px 0 14px; text-align:right; }
  .print-bar button{ background:#F2598A; color:#fff; border:none; padding:10px 18px; border-radius:20px; font-weight:700; font-size:13px; cursor:pointer; }
  .card{ background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 6px 24px rgba(90,40,65,.12); border:1px solid #f0e2e8; margin-bottom:22px; }
  .card-head{ background:linear-gradient(135deg,#F2598A,#C23A6B); color:#fff; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .card-head .brand{ font-size:15px; font-weight:800; letter-spacing:.2px; }
  .card-head .sub{ font-size:10.5px; opacity:.9; margin-top:2px; letter-spacing:.6px; text-transform:uppercase; }
  .card-head .num{ font-size:10.5px; font-family: ui-monospace, 'Courier New', monospace; background:rgba(255,255,255,.2); padding:5px 9px; border-radius:20px; white-space:nowrap; }
  .identity{ display:flex; gap:16px; align-items:center; padding:18px 20px 14px; border-bottom:1px solid #f4eef1; }
  .photo{ width:96px; height:96px; border-radius:50%; object-fit:cover; border:3px solid #FFD3E0; flex:none; background:#FFEFF3; }
  .photo.placeholder{ display:flex; align-items:center; justify-content:center; font-size:38px; }
  .identity .name{ font-size:23px; font-weight:800; color:#3A2236; line-height:1.15; word-break:break-word; }
  .identity .tagline{ font-size:12.5px; color:#8a7480; margin-top:5px; line-height:1.45; }
  .chips{ margin-top:8px; display:flex; flex-wrap:wrap; gap:5px; }
  .chip{ font-size:10.5px; font-weight:700; color:#C23A6B; background:#FFEFF3; border-radius:20px; padding:3px 9px; }
  .section{ padding:14px 20px 4px; }
  .section h3{ font-size:10.5px; letter-spacing:.8px; text-transform:uppercase; color:#C23A6B; margin:0 0 10px; }
  .grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px 14px; }
  .grid .full{ grid-column:1 / -1; }
  .lbl{ font-size:10px; letter-spacing:.4px; text-transform:uppercase; color:#a3919b; margin-bottom:2px; }
  .val{ font-size:13.5px; font-weight:600; color:#3A2236; word-break:break-word; }
  .val.mono{ font-family: ui-monospace, 'Courier New', monospace; font-size:13px; letter-spacing:.4px; }
  .tutor{ padding:14px 20px 16px; background:#FDF7F9; border-top:1px solid #f4eef1; }
  .tutor-row{ display:flex; align-items:center; gap:12px; margin-bottom:12px; }
  .tutor-photo{ width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #FFD3E0; flex:none; background:#FFEFF3; }
  .tutor-photo.placeholder{ display:flex; align-items:center; justify-content:center; font-size:18px; }
  .tutor-name{ font-size:15px; font-weight:800; color:#3A2236; word-break:break-word; }
  .tutor-empty{ font-size:12.5px; color:#a3919b; font-style:italic; }
  .card-foot{ padding:11px 20px 14px; font-size:10px; color:#a3919b; line-height:1.5; border-top:1px solid #f4eef1; }
  @media (max-width: 380px){
    .grid{ grid-template-columns:1fr; }
    .photo{ width:78px; height:78px; }
    .identity .name{ font-size:20px; }
  }
  @media print{
    .print-bar{ display:none; }
    body{ background:#fff; padding:0; }
    .wrap{ max-width:100%; }
    .card{ box-shadow:none; break-inside:avoid; page-break-inside:avoid; margin-bottom:0; }
    .card + .card{ page-break-before:always; }
    .card-head, .tutor{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    @page{ margin: 14mm; }
  }
</style></head>
<body>
  <div class="wrap">
    <div class="print-bar"><button onclick="window.print()">Imprimir / Salvar PDF</button></div>
    ${cards}
  </div>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    toast("Permita pop-ups para gerar a carteirinha");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function buildCard(pet: Pet, tutor: Tutor | null): string {
  const { records } = useDataStore.getState();
  const lastWeight = recordsFor<WeightRecord>(records, pet.id, "weight")[0];
  const m = pet.measurements;
  const species = pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Outro";
  const emoji = pet.species === "cat" ? "🐱" : pet.species === "dog" ? "🐶" : "🐾";
  const age = calcAge(pet.birthDate);
  const sex = pet.sex === "F" ? "Fêmea" : "Macho";
  // concorda com o sexo do pet: numa carteirinha "castrado(a)" fica burocrático
  const neutered = pet.neutered
    ? pet.sex === "F"
      ? "Castrada"
      : "Castrado"
    : pet.sex === "F"
      ? "Não castrada"
      : "Não castrado";

  const photo = pet.photo
    ? `<img class="photo" src="${escapeHtml(pet.photo)}" alt="Foto de ${escapeHtml(pet.name)}">`
    : `<div class="photo placeholder">${emoji}</div>`;

  // a espécie já aparece nos chips — a linha de apoio só repete o que agrega
  const tagline = [pet.breed, age].filter(Boolean).join(" · ");

  const chips = [species, sex, neutered]
    .map((c) => `<span class="chip">${escapeHtml(c)}</span>`)
    .join("");

  function field(label: string, value: string, opts?: { full?: boolean; mono?: boolean }): string {
    return `<div${opts?.full ? ' class="full"' : ""}>
        <div class="lbl">${escapeHtml(label)}</div>
        <div class="val${opts?.mono ? " mono" : ""}">${value}</div>
      </div>`;
  }

  const measures = m
    ? [
        m.neck ? `Pescoço ${m.neck} cm` : "",
        m.chest ? `Peito ${m.chest} cm` : "",
        m.length ? `Dorso ${m.length} cm` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  const fields = [
    field("Espécie", escapeHtml(species)),
    field("Raça", escapeHtml(pet.breed || "Não informada")),
    field("Nascimento", pet.birthDate ? fmtDate(pet.birthDate) : "Não informado"),
    field("Idade", age || "Não informada"),
    field("Sexo", `${sex} · ${neutered.toLowerCase()}`),
    field(
      "Peso atual",
      lastWeight
        ? `${lastWeight.weight} kg <span style="font-weight:500;color:#a3919b">(${fmtDate(lastWeight.date)})</span>`
        : "Não informado"
    ),
    field("Microchip", escapeHtml(pet.microchip || "Não informado"), {
      full: true,
      mono: !!pet.microchip,
    }),
    measures ? field("Medidas", escapeHtml(measures), { full: true }) : "",
    pet.notes ? field("Observações", escapeHtml(pet.notes), { full: true }) : "",
  ]
    .filter(Boolean)
    .join("");

  const tutorFields = tutor
    ? [
        tutor.phone ? field("Telefone", escapeHtml(tutor.phone)) : "",
        tutor.city ? field("Cidade", escapeHtml(tutor.city)) : "",
        tutor.email ? field("E-mail", escapeHtml(tutor.email), { full: true }) : "",
      ]
        .filter(Boolean)
        .join("")
    : "";

  const tutorBlock = tutor
    ? `<div class="tutor-row">
        ${
          tutor.photo
            ? `<img class="tutor-photo" src="${escapeHtml(tutor.photo)}" alt="Foto do tutor">`
            : `<div class="tutor-photo placeholder">👤</div>`
        }
        <div style="min-width:0">
          <div class="lbl">Tutor(a) responsável</div>
          <div class="tutor-name">${escapeHtml(tutor.name)}</div>
        </div>
      </div>
      ${tutorFields ? `<div class="grid">${tutorFields}</div>` : ""}`
    : `<div class="lbl" style="margin-bottom:4px">Tutor(a) responsável</div>
       <div class="tutor-empty">Cadastre seus dados em Ajustes › Meu perfil para que apareçam aqui.</div>`;

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <div class="brand">🐾 PataCare</div>
          <div class="sub">Carteirinha de identificação</div>
        </div>
        <div class="num">Nº ${cardNumber(pet)}</div>
      </div>

      <div class="identity">
        ${photo}
        <div style="min-width:0">
          <div class="name">${escapeHtml(pet.name)}</div>
          ${tagline ? `<div class="tagline">${escapeHtml(tagline)}</div>` : ""}
          <div class="chips">${chips}</div>
        </div>
      </div>

      <div class="section">
        <h3>Dados do pet</h3>
        <div class="grid">${fields}</div>
      </div>

      <div class="tutor">${tutorBlock}</div>

      <div class="card-foot">
        Emitida em ${new Date().toLocaleDateString("pt-BR")} pelo app PataCare, a partir dos dados
        informados pelo tutor. Documento de identificação e contato — não substitui a carteira de
        vacinação nem o atestado do médico-veterinário.
      </div>
    </div>`;
}
