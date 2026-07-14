import { useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { buildAttachmentFromFile, openAttachment } from "@/lib/image";
import { useUiStore } from "@/store/ui";
import type { Attachment } from "@/types";

export function AttachmentsField({
  value,
  onChange,
  addLabel = "Adicionar imagem ou PDF",
}: {
  value: Attachment[];
  onChange: (list: Attachment[]) => void;
  addLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const showLightbox = useUiStore((s) => s.showLightbox);
  const toast = useUiStore((s) => s.toast);

  const open = (att: Attachment) => openAttachment(att, showLightbox);

  return (
    <>
      <div className="attach-list">
        {value.map((att) => (
          <div key={att.id} className="attach-chip">
            {att.kind === "image" ? (
              <img className="thumb" src={att.dataUrl} alt="Anexo" onClick={() => open(att)} />
            ) : (
              <div className="icon" onClick={() => open(att)}>
                <Icon name="file" />
              </div>
            )}
            <span className="name" onClick={() => open(att)}>
              {att.name || "Arquivo"}
            </span>
            <button
              type="button"
              className="rm"
              aria-label="Remover anexo"
              onClick={() => onChange(value.filter((a) => a.id !== att.id))}
            >
              <Icon name="close" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="attach-add-btn" onClick={() => inputRef.current?.click()}>
        <Icon name="paperclip" /> {addLabel}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="visually-hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          const next = value.slice();
          for (const file of files) {
            const att = await buildAttachmentFromFile(file);
            if (att === "too-large") toast("Arquivo muito grande (máx. 8MB): " + file.name);
            else next.push(att);
          }
          e.target.value = "";
          onChange(next);
        }}
      />
    </>
  );
}

/** Tira de miniaturas exibida nos cards de registro (exames/cirurgias). */
export function AttachStrip({ attachments }: { attachments: Attachment[] }) {
  const showLightbox = useUiStore((s) => s.showLightbox);
  if (!attachments.length) return null;
  return (
    <div className="attach-strip">
      {attachments.map((att) =>
        att.kind === "image" ? (
          <img
            key={att.id}
            className="attach-thumb"
            src={att.dataUrl}
            alt={att.name || "Anexo"}
            onClick={(e) => {
              e.stopPropagation();
              openAttachment(att, showLightbox);
            }}
          />
        ) : (
          <button
            key={att.id}
            type="button"
            className="attach-file"
            title={att.name || "Arquivo"}
            onClick={(e) => {
              e.stopPropagation();
              openAttachment(att, showLightbox);
            }}
          >
            <Icon name="file" />
          </button>
        )
      )}
    </div>
  );
}
