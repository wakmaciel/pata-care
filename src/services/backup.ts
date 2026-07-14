import { pad } from "@/lib/dates";
import { useDataStore } from "@/store/data";
import { confirmDialog, toast } from "@/store/ui";
import { navigate } from "@/router";
import { applyBackupData, buildBackupData, isValidBackup } from "@/services/drive";

export function exportBackup() {
  useDataStore
    .getState()
    .reload()
    .then(() => {
      const data = buildBackupData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const d = new Date();
      a.href = url;
      a.download = `patacare-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast("Backup exportado!");
    });
}

export function importBackup(file: File) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(String(reader.result)) as unknown;
      if (!isValidBackup(data)) throw new Error("formato inválido");
      const ok = await confirmDialog({
        title: "Importar backup?",
        message:
          "Isso vai substituir todos os dados atuais deste dispositivo pelos dados do arquivo selecionado.",
        confirmLabel: "Importar e substituir",
        danger: true,
      });
      if (!ok) return;
      await applyBackupData(data);
      toast("Backup importado com sucesso!");
      navigate("#/");
    } catch {
      toast("Não foi possível ler esse arquivo de backup");
    }
  };
  reader.readAsText(file);
}
