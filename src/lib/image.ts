import { uid } from "@/lib/utils";
import type { Attachment, AttachmentKind } from "@/types";

export function resizeImageFile(file: File, maxDim = 900, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas indisponível"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/* ------------------------------ Anexos (exames) -------------------------- */
// Tamanho máximo por anexo, para não estourar o IndexedDB (~8MB)
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function classifyMime(mime: string): AttachmentKind {
  if (mime && mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

export async function buildAttachmentFromFile(file: File): Promise<Attachment | "too-large"> {
  const kind = classifyMime(file.type);
  if (kind === "image") {
    const dataUrl = await resizeImageFile(file, 1400, 0.78);
    return { id: uid(), name: file.name, mime: "image/jpeg", kind, dataUrl };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) return "too-large";
  const dataUrl = await readFileAsDataURL(file);
  return {
    id: uid(),
    name: file.name,
    mime: file.type || "application/octet-stream",
    kind,
    dataUrl,
  };
}

export function openAttachment(att: Attachment, onImage: (src: string) => void) {
  if (att.kind === "image") {
    onImage(att.dataUrl);
    return;
  }
  const a = document.createElement("a");
  a.href = att.dataUrl;
  a.target = "_blank";
  a.rel = "noopener";
  if (att.kind === "other") a.download = att.name || "arquivo";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
