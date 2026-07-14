import { useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { resizeImageFile } from "@/lib/image";

export function PhotoUpload({
  value,
  onChange,
  maxDim = 800,
  quality = 0.72,
}: {
  value: string | null;
  onChange: (dataUrl: string) => void;
  maxDim?: number;
  quality?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="photo-upload" onClick={() => inputRef.current?.click()}>
        {value ? (
          <img src={value} alt="Pré-visualização" />
        ) : (
          <div className="ph-icon">
            <Icon name="camera" />
          </div>
        )}
        <span className="txt">
          {value ? "Toque para alterar a foto" : "Toque para escolher uma foto"}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const data = await resizeImageFile(file, maxDim, quality);
          onChange(data);
          e.target.value = "";
        }}
      />
    </>
  );
}
