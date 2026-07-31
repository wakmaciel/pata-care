import { useEffect, useRef, useState } from "react";
import { canvasToBlob, petCardFileName, renderPetCard } from "@/services/petCard";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SheetHeader } from "@/components/ui/OverlayHost";
import type { Pet } from "@/types";

/** Imprime sem abrir aba nova — um iframe oculto evita o beco sem saída de voltar ao app. */
function printImage(src: string, title: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return;
  }
  doc.title = title;
  const style = doc.createElement("style");
  style.textContent =
    "@page{ margin: 16mm; } html,body{ margin:0; padding:0; } img{ width:100%; max-width:150mm; display:block; }";
  doc.head.appendChild(style);
  const img = doc.createElement("img");
  img.alt = title;
  img.src = src;
  doc.body.appendChild(img);

  const cleanup = () => setTimeout(() => frame.remove(), 500);
  win.addEventListener("afterprint", cleanup);
  const go = () => {
    win.focus();
    win.print();
    // nem todo navegador dispara afterprint — a rede de segurança evita iframes órfãos
    setTimeout(cleanup, 60000);
  };
  if (img.complete) go();
  else img.onload = go;
}

export function PetCardSheet({ pet }: { pet: Pet }) {
  const { toast, closeSheet } = useUiStore();
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const fileName = petCardFileName(pet);

  useEffect(() => {
    let active = true;
    renderPetCard(pet)
      .then(async (canvas) => {
        const blob = await canvasToBlob(canvas);
        if (!active) return;
        blobRef.current = blob;
        setSrc(canvas.toDataURL("image/png"));
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [pet]);

  // o arquivo já está pronto no clique: alguns navegadores exigem que o
  // compartilhamento saia direto do gesto do usuário, sem espera no meio
  const file = blobRef.current
    ? new File([blobRef.current], fileName, { type: "image/png" })
    : null;
  const canShare = !!file && !!navigator.canShare?.({ files: [file] });

  const save = () => {
    if (!blobRef.current) return;
    const url = URL.createObjectURL(blobRef.current);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Carteirinha salva na galeria/downloads");
  };

  const share = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: `Carteirinha de ${pet.name}` });
    } catch {
      // usuário cancelou ou o navegador recusou — sem alarde, o botão de salvar continua ali
    }
  };

  return (
    <div>
      <SheetHeader title={`Carteirinha de ${pet.name}`} />
      <p
        style={{
          fontSize: 12.5,
          color: "var(--text-muted)",
          lineHeight: 1.5,
          margin: "-4px 0 14px",
        }}
      >
        Um cartão de identificação para apresentar o pet ao veterinário. Salve como imagem ou envie
        direto pelo WhatsApp.
      </p>

      <div
        style={{
          background: "var(--bg-subtle, #f6f2f4)",
          borderRadius: 14,
          padding: 12,
          marginBottom: 16,
          minHeight: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {error ? (
          <span style={{ fontSize: 13, color: "var(--red)" }}>
            Não foi possível gerar a carteirinha neste navegador.
          </span>
        ) : src ? (
          <img
            src={src}
            alt={`Carteirinha de ${pet.name}`}
            style={{ width: "100%", borderRadius: 10, display: "block" }}
          />
        ) : (
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Gerando carteirinha…</span>
        )}
      </div>

      {canShare && (
        <Button block style={{ marginBottom: 10 }} onClick={share}>
          <Icon name="upload" /> Compartilhar
        </Button>
      )}
      <Button
        variant={canShare ? "secondary" : "primary"}
        block
        style={{ marginBottom: 10 }}
        disabled={!src}
        onClick={save}
      >
        <Icon name="download" /> Salvar como imagem (PNG)
      </Button>
      <Button
        variant="secondary"
        block
        style={{ marginBottom: 10 }}
        disabled={!src}
        onClick={() => src && printImage(src, `Carteirinha de ${pet.name}`)}
      >
        <Icon name="file" /> Imprimir / Salvar PDF
      </Button>
      <Button variant="ghost" block onClick={closeSheet}>
        Fechar
      </Button>
    </div>
  );
}
