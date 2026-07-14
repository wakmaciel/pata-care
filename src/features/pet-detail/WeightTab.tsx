import { useEffect, useRef } from "react";
import { ageMonths, calcAge, fmtDate, MONTHS_ABBR, pad, parseISODate } from "@/lib/dates";
import { recordsFor } from "@/domain/care";
import { ADULT_MIN_MONTHS, findBreedWeightRange } from "@/domain/weight";
import { useDataStore } from "@/store/data";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { GenericRecordFormSheet } from "@/features/forms/GenericRecordFormSheet";
import type { Pet, WeightRecord } from "@/types";

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function hexToRgba(hex: string, alpha: number): string {
  hex = hex.replace("#", "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function WeightChart({ points }: { points: WeightRecord[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.parentElement.clientWidth - 32 || 280;
    const cssH = 140;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);
    if (points.length === 0) return;
    const weights = points.map((p) => p.weight);
    let min = Math.min(...weights);
    let max = Math.max(...weights);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const padY = 16,
      padX = 6;
    const n = points.length;
    const stepX = n > 1 ? (cssW - padX * 2) / (n - 1) : 0;
    const xAt = (i: number) => padX + stepX * i;
    const yAt = (v: number) => padY + (1 - (v - min) / (max - min)) * (cssH - padY * 2);
    const pink = cssVar("--pink") || "#F2598A";

    const grad = ctx.createLinearGradient(0, 0, 0, cssH);
    grad.addColorStop(0, hexToRgba(pink, 0.32));
    grad.addColorStop(1, hexToRgba(pink, 0));
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = xAt(i),
        y = yAt(p.weight);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(xAt(n - 1), cssH - padY);
    ctx.lineTo(xAt(0), cssH - padY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = xAt(i),
        y = yAt(p.weight);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = pink;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    points.forEach((p, i) => {
      const x = xAt(i),
        y = yAt(p.weight);
      ctx.beginPath();
      ctx.arc(x, y, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = cssVar("--surface") || "#fff";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = pink;
      ctx.stroke();
    });
  }, [points]);

  return <canvas id="weightChart" ref={canvasRef} />;
}

function WeightAssessmentCard({ pet, currentWeight }: { pet: Pet; currentWeight: number }) {
  const infoP = (color: string, content: React.ReactNode) => (
    <div className="card weight-assessment" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ display: "flex", flexShrink: 0, color }}>
          <Icon name="info" />
        </span>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{content}</p>
      </div>
    </div>
  );

  if (!pet.birthDate) {
    return infoP(
      "var(--text-faint)",
      <>
        Informe a <strong>data de nascimento</strong> e a <strong>raça</strong> do pet (em "Editar
        pet") para ver aqui se o peso está dentro da faixa esperada.
      </>
    );
  }
  const months = ageMonths(pet.birthDate);
  if (months !== null && months < ADULT_MIN_MONTHS) {
    return infoP(
      "var(--peach)",
      <>
        <strong style={{ color: "var(--text)" }}>Fase de crescimento</strong> — com{" "}
        {calcAge(pet.birthDate)}, ainda não dá pra comparar com o peso ideal de um adulto. Continue
        acompanhando a curva de peso; o ganho deve ser gradual e constante.
      </>
    );
  }
  const range = findBreedWeightRange(pet);
  if (!range) {
    return infoP(
      "var(--text-faint)",
      <>
        Não temos uma faixa de referência para "{pet.breed || "essa raça"}" (comum em pets sem raça
        definida, já que o porte varia muito). Para avaliar o peso, o ideal é o médico-veterinário
        fazer o escore de condição corporal (palpação de costelas e cintura).
      </>
    );
  }

  const { min, max } = range;
  let status: string, color: string, bg: string;
  if (currentWeight < min) {
    status = "Abaixo da faixa esperada para a raça";
    color = "var(--peach)";
    bg = "var(--peach-soft)";
  } else if (currentWeight > max) {
    status = "Acima da faixa esperada para a raça";
    color = "var(--red)";
    bg = "var(--red-soft)";
  } else {
    status = "Dentro da faixa esperada para a raça";
    color = "var(--mint)";
    bg = "var(--mint-soft)";
  }

  const dMin = min * 0.6,
    dMax = max * 1.4;
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - dMin) / (dMax - dMin)) * 100));
  const zoneLeft = pos(min),
    zoneRight = pos(max);
  const markerPos = pos(currentWeight);

  return (
    <div className="card weight-assessment" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            background: bg,
            color,
          }}
        >
          {status}
        </span>
      </div>
      <div className="weight-gauge">
        <div className="weight-gauge-track">
          <div
            className="weight-gauge-zone"
            style={{ left: zoneLeft + "%", width: zoneRight - zoneLeft + "%" }}
          />
          <div
            className="weight-gauge-marker"
            style={{ left: markerPos + "%", background: color }}
          />
        </div>
        <div className="weight-gauge-labels">
          <span>{min} kg</span>
          <span>{max} kg</span>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--text-faint)", lineHeight: 1.4, marginTop: 10 }}>
        Faixa de referência geral para a raça em adultos. Não substitui o escore de condição
        corporal avaliado por um médico-veterinário.
      </p>
    </div>
  );
}

export function WeightTab({ pet }: { pet: Pet }) {
  const { records } = useDataStore();
  const { openSheet } = useUiStore();
  const list = recordsFor<WeightRecord>(records, pet.id, "weight"); // desc
  const openForm = (rec: WeightRecord | null) =>
    openSheet(<GenericRecordFormSheet category="weight" petId={pet.id} existing={rec} />);

  if (list.length === 0) {
    return (
      <EmptyState
        icon="scale"
        title="Nenhum peso registrado"
        text="Acompanhe a evolução do peso do seu pet ao longo do tempo."
        action={
          <Button onClick={() => openForm(null)}>
            <Icon name="plus" /> Registrar peso
          </Button>
        }
      />
    );
  }

  const asc = list.slice().reverse();
  const latest = list[0]!;
  const prev = list[1];
  const delta = prev ? +(latest.weight - prev.weight).toFixed(2) : null;

  return (
    <>
      <div className="chart-wrap">
        <div className="latest">
          <span className="num">{latest.weight}</span>
          <span className="unit">kg</span>
          {delta !== null && (
            <span
              className="delta"
              style={{
                background:
                  delta > 0
                    ? "var(--peach-soft)"
                    : delta < 0
                      ? "var(--mint-soft)"
                      : "var(--surface-2)",
                color: delta > 0 ? "#9C5A12" : delta < 0 ? "var(--mint)" : "var(--text-muted)",
              }}
            >
              {delta > 0 ? "+" : ""}
              {delta} kg
            </span>
          )}
        </div>
        <WeightChart points={asc} />
      </div>

      <WeightAssessmentCard pet={pet} currentWeight={latest.weight} />

      <SectionTitle>Histórico</SectionTitle>
      {list.map((rec) => {
        const d = parseISODate(rec.date);
        return (
          <div key={rec.id} className="record">
            <div className="record-stamp">
              <span className="d">{pad(d.getDate())}</span>
              <span className="m">{MONTHS_ABBR[d.getMonth()]}</span>
            </div>
            <div
              className="record-body"
              style={{ cursor: "pointer" }}
              onClick={() => openForm(rec)}
            >
              <h4>{rec.weight} kg</h4>
              <div className="sub">{fmtDate(rec.date)}</div>
              {rec.notes && <div className="sub">{rec.notes}</div>}
            </div>
            <button className="record-menu-btn" aria-label="Editar" onClick={() => openForm(rec)}>
              <Icon name="dots" />
            </button>
          </div>
        );
      })}
    </>
  );
}
