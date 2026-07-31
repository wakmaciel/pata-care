/* Carteirinha do pet — cartão de identificação no formato de um RG, desenhado em <canvas>
   para poder ser salvo e compartilhado como imagem (e não só impresso). */
import { calcAge, fmtDate } from "@/lib/dates";
import { recordsFor } from "@/domain/care";
import { normalizeText } from "@/lib/utils";
import { useDataStore } from "@/store/data";
import { useTutorStore } from "@/store/tutor";
import type { Pet, WeightRecord } from "@/types";

/** Medidas em px de projeto — a proporção de um cartão de identidade (85,6 × 54 mm). */
const W = 340;
const H = 214;
/** Exportamos em 3x para a imagem ficar nítida em tela cheia e impressa. */
const SCALE = 3;

const FONT = "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
const MONO = "ui-monospace, 'Courier New', monospace";

const INK = "#3A2236";
const MUTED = "#8a7480";
const LABEL = "#a3919b";
const PINK = "#F2598A";
const PINK_DARK = "#C23A6B";
const PINK_SOFT = "#FFEFF3";
const LINE = "#F1E4EA";

type Ctx = CanvasRenderingContext2D;

function font(weight: number, size: number, family = FONT): string {
  return `${weight} ${size}px ${family}`;
}

function roundRectPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function ellipsize(ctx: Ctx, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

/** Rótulo pequeno em caixa alta + valor, como nos campos de um documento. */
function drawField(
  ctx: Ctx,
  label: string,
  value: string,
  x: number,
  y: number,
  maxW: number,
  opts?: { mono?: boolean; valueSize?: number }
) {
  ctx.textBaseline = "top";
  ctx.fillStyle = LABEL;
  ctx.font = font(700, 7);
  ctx.fillText(ellipsize(ctx, label.toUpperCase(), maxW), x, y);
  ctx.fillStyle = INK;
  ctx.font = font(600, opts?.valueSize ?? 11, opts?.mono ? MONO : FONT);
  ctx.fillText(ellipsize(ctx, value, maxW), x, y + 10);
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Desenha a imagem preenchendo o quadrado (recorte central), como object-fit: cover. */
function drawPhotoCover(ctx: Ctx, img: HTMLImageElement, x: number, y: number, size: number) {
  const ratio = Math.max(size / img.width, size / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, x + (size - dw) / 2, y + (size - dh) / 2, dw, dh);
}

function speciesLabel(pet: Pet): string {
  return pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Outro";
}

function speciesEmoji(pet: Pet): string {
  return pet.species === "cat" ? "🐱" : pet.species === "dog" ? "🐶" : "🐾";
}

function neuteredLabel(pet: Pet): string {
  // concorda com o sexo do pet: "castrado(a)" fica burocrático num documento
  if (pet.neutered) return pet.sex === "F" ? "castrada" : "castrado";
  return pet.sex === "F" ? "não castrada" : "não castrado";
}

/** Número da carteirinha derivado do id do pet — estável entre gerações. */
function cardNumber(pet: Pet): string {
  const clean = (pet.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const tail = clean.slice(-8).padStart(8, "0");
  return `${tail.slice(0, 4)}-${tail.slice(4)}`;
}

export function petCardFileName(pet: Pet): string {
  const slug = normalizeText(pet.name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `carteirinha-${slug || "pet"}.png`;
}

export async function renderPetCard(pet: Pet): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível neste navegador");
  ctx.scale(SCALE, SCALE);

  const tutor = useTutorStore.getState().tutor;
  const lastWeight = recordsFor<WeightRecord>(useDataStore.getState().records, pet.id, "weight")[0];
  const photo = pet.photo ? await loadImage(pet.photo) : null;

  const pad = 14;
  const headH = 34;
  const footH = 36;

  // fundo do cartão (tudo é desenhado dentro do recorte arredondado)
  ctx.save();
  roundRectPath(ctx, 0, 0, W, H, 14);
  ctx.clip();
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);

  /* ------------------------------- cabeçalho ------------------------------- */
  const grad = ctx.createLinearGradient(0, 0, W, headH);
  grad.addColorStop(0, PINK);
  grad.addColorStop(1, PINK_DARK);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, headH);

  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.font = font(800, 12);
  ctx.fillText("🐾 PataCare", pad, headH / 2 - 5);
  ctx.font = font(600, 7);
  ctx.globalAlpha = 0.9;
  ctx.fillText("CARTEIRINHA DE IDENTIFICAÇÃO", pad, headH / 2 + 7);
  ctx.globalAlpha = 1;

  const num = `Nº ${cardNumber(pet)}`;
  ctx.font = font(600, 8, MONO);
  const numW = ctx.measureText(num).width;
  ctx.fillStyle = "rgba(255,255,255,.22)";
  roundRectPath(ctx, W - pad - numW - 14, headH / 2 - 8, numW + 14, 16, 8);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(num, W - pad - numW - 7, headH / 2);

  /* ---------------------------------- foto --------------------------------- */
  const photoSize = 80;
  const photoY = headH + 12;
  ctx.save();
  roundRectPath(ctx, pad, photoY, photoSize, photoSize, 12);
  ctx.clip();
  ctx.fillStyle = PINK_SOFT;
  ctx.fillRect(pad, photoY, photoSize, photoSize);
  if (photo) {
    drawPhotoCover(ctx, photo, pad, photoY, photoSize);
  } else {
    ctx.font = font(400, 40);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = PINK_DARK;
    ctx.fillText(speciesEmoji(pet), pad + photoSize / 2, photoY + photoSize / 2 + 2);
    ctx.textAlign = "left";
  }
  ctx.restore();
  ctx.strokeStyle = "#FFD3E0";
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, pad, photoY, photoSize, photoSize, 12);
  ctx.stroke();

  /* ------------------------------ dados do pet ----------------------------- */
  const colX = pad + photoSize + 14;
  const colW = W - colX - pad;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // o nome é o elemento dominante do cartão: diminui a fonte antes de cortar
  let nameSize = 21;
  ctx.font = font(800, nameSize);
  while (nameSize > 14 && ctx.measureText(pet.name).width > colW) {
    nameSize -= 1;
    ctx.font = font(800, nameSize);
  }
  ctx.fillStyle = INK;
  ctx.fillText(ellipsize(ctx, pet.name, colW), colX, photoY - 2 + (21 - nameSize));

  ctx.font = font(500, 10);
  ctx.fillStyle = MUTED;
  const subtitle = [speciesLabel(pet), pet.breed].filter(Boolean).join(" · ");
  ctx.fillText(ellipsize(ctx, subtitle, colW), colX, photoY + 22);

  const halfW = (colW - 8) / 2;
  const rowY = photoY + 40;
  drawField(ctx, "Nascimento", pet.birthDate ? fmtDate(pet.birthDate) : "—", colX, rowY, halfW);
  drawField(ctx, "Idade", calcAge(pet.birthDate) || "—", colX + halfW + 8, rowY, halfW);
  drawField(
    ctx,
    "Sexo",
    `${pet.sex === "F" ? "Fêmea" : "Macho"} · ${neuteredLabel(pet)}`,
    colX,
    rowY + 26,
    halfW,
    { valueSize: 10 }
  );
  drawField(
    ctx,
    "Peso",
    lastWeight ? `${lastWeight.weight.toLocaleString("pt-BR")} kg` : "—",
    colX + halfW + 8,
    rowY + 26,
    halfW
  );

  /* -------------------------------- microchip ------------------------------ */
  const chipY = photoY + photoSize + 12;
  ctx.fillStyle = PINK_SOFT;
  roundRectPath(ctx, pad, chipY, W - pad * 2, 28, 8);
  ctx.fill();
  drawField(
    ctx,
    "Microchip",
    pet.microchip || "Não informado",
    pad + 10,
    chipY + 5,
    W - pad * 2 - 20,
    {
      mono: !!pet.microchip,
      valueSize: 11,
    }
  );

  /* ---------------------------------- tutor -------------------------------- */
  ctx.fillStyle = "#FDF7F9";
  ctx.fillRect(0, H - footH, W, footH);
  ctx.fillStyle = LINE;
  ctx.fillRect(0, H - footH, W, 1);
  const tutorLine = tutor
    ? [tutor.name, tutor.phone].filter(Boolean).join(" · ")
    : "Cadastre seu perfil no PataCare";
  drawField(ctx, "Tutor(a) responsável", tutorLine, pad, H - footH + 9, W - pad * 2, {
    valueSize: 11,
  });

  ctx.restore();
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Não foi possível gerar a imagem"));
    }, "image/png");
  });
}
