import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { petsSorted } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useTutorStore } from "@/store/tutor";
import { useThemeStore } from "@/store/theme";
import { useUiStore } from "@/store/ui";
import { navigate } from "@/router";
import {
  enableSystemNotifications,
  getNotificationSettings,
  notificationPermission,
  notificationsSupported,
  saveNotificationSettings,
  showSystemNotification,
  stopNotificationCheck,
} from "@/services/notifications";
import {
  driveConnect,
  driveDisconnect,
  driveRestoreFlow,
  driveUploadBackup,
  getDriveLastBackup,
  isDriveConfigured,
  isDriveConnected,
} from "@/services/drive";
import { exportBackup, importBackup } from "@/services/backup";
import { generateVetReport } from "@/services/vetReport";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle, Switch } from "@/components/ui/Field";
import { TutorFormSheet } from "@/features/forms/TutorFormSheet";
import type { ThemeMode } from "@/types";

export function SettingsView() {
  const { pets, clearAll } = useDataStore();
  const tutor = useTutorStore((s) => s.tutor);
  const { mode, setMode } = useThemeStore();
  const { openSheet, toast, confirm } = useUiStore();
  const importRef = useRef<HTMLInputElement>(null);
  const [vetSelection, setVetSelection] = useState("all");
  // força re-render após ações que mudam estado fora do React (drive, notificações)
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const supported = notificationsSupported();
  const permission = notificationPermission();
  const notificationEnabled = getNotificationSettings().enabled && permission === "granted";
  const notificationStatus = !supported
    ? "Indisponível neste navegador"
    : permission === "denied"
      ? "Bloqueadas no navegador"
      : notificationEnabled
        ? "Ativadas neste dispositivo"
        : "Desativadas";

  const driveConnected = isDriveConnected();
  const driveLast = getDriveLastBackup();
  const driveLastText = driveLast
    ? `Último backup: ${new Date(driveLast).toLocaleString("pt-BR")}`
    : "Ainda sem backup enviado";

  const profSub = tutor
    ? [tutor.city, tutor.email, tutor.phone].filter(Boolean).join(" · ") ||
      "Toque para editar seus dados"
    : "Adicione seu nome e sua foto";

  const themeModes: { mode: ThemeMode; icon: "sun" | "moon" | "monitor" }[] = [
    { mode: "light", icon: "sun" },
    { mode: "dark", icon: "moon" },
    { mode: "system", icon: "monitor" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <SectionTitle>Meu perfil</SectionTitle>
      <div className="card" style={{ marginBottom: 18 }}>
        <div
          className="profile-row"
          role="button"
          aria-label={tutor ? "Editar perfil" : "Criar meu perfil"}
          onClick={() => openSheet(<TutorFormSheet />)}
        >
          {tutor?.photo ? (
            <img className="profile-avatar" src={tutor.photo} alt="Foto do tutor" />
          ) : (
            <div className="profile-avatar placeholder">
              <Icon name="user" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {tutor ? tutor.name : "Criar meu perfil"}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--text-muted)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profSub}
            </div>
          </div>
          <span className="chevron">
            <Icon name="chevronRight" />
          </span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="settings-row" style={{ paddingTop: 0, borderBottom: "none" }}>
          <div className="lbl">
            <div className="t">Aparência</div>
            <div className="s">Escolha como o app deve ser exibido</div>
          </div>
        </div>
        <div className="theme-toggle" style={{ marginTop: 6 }}>
          {themeModes.map((t) => (
            <button
              key={t.mode}
              className={mode === t.mode ? "active" : ""}
              onClick={() => setMode(t.mode)}
              aria-label={"Tema " + t.mode}
            >
              <Icon name={t.icon} />
            </button>
          ))}
        </div>
      </div>

      <SectionTitle>Notificações</SectionTitle>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="settings-row" style={{ paddingTop: 0, borderBottom: "none" }}>
          <div className="lbl">
            <div className="t">Lembretes no sistema</div>
            <div className="s">{notificationStatus}</div>
          </div>
          <Switch
            checked={notificationEnabled}
            disabled={!supported || permission === "denied"}
            onChange={async (checked) => {
              if (checked) {
                await enableSystemNotifications();
              } else {
                saveNotificationSettings({ enabled: false });
                stopNotificationCheck();
                toast("Notificações desativadas neste dispositivo");
              }
              refresh();
            }}
          />
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: "var(--text-muted)",
            lineHeight: 1.5,
            margin: "10px 0 14px",
          }}
        >
          Você recebe avisos de cuidados próximos, atrasados e horários de medicamento ao abrir ou
          deixar o PataCare ativo. Para avisos com o app totalmente fechado, é necessário configurar
          um serviço de push.
        </p>
        {supported && permission === "denied" && (
          <p style={{ fontSize: 12.5, color: "var(--red)", lineHeight: 1.45, marginBottom: 12 }}>
            Libere as notificações nas configurações do navegador e volte ao app.
          </p>
        )}
        <Button
          variant="secondary"
          block
          disabled={!notificationEnabled}
          onClick={() =>
            showSystemNotification("PataCare está pronto!", {
              body: "Você receberá lembretes dos cuidados do seu pet neste dispositivo.",
              tag: "patacare-test",
            })
          }
        >
          <Icon name="bell" /> Enviar notificação de teste
        </Button>
      </div>

      {pets.length > 0 && (
        <>
          <SectionTitle>Exportar para o veterinário</SectionTitle>
          <div className="card">
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              Gere um resumo em PDF com vacinas, consultas, exames, cirurgias, antipulgas,
              vermífugos, peso e medicamentos — pronto para mostrar ou enviar ao médico-veterinário.
            </p>
            <div className="field" style={{ marginBottom: 12 }}>
              <select value={vetSelection} onChange={(e) => setVetSelection(e.target.value)}>
                <option value="all">Todos os pets</option>
                {petsSorted(pets).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Button block onClick={() => generateVetReport(vetSelection)}>
              <Icon name="vet" /> Gerar relatório
            </Button>
          </div>
        </>
      )}

      <SectionTitle>Backup dos dados</SectionTitle>
      <div className="card">
        <p
          style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 14 }}
        >
          Seus dados ficam salvos apenas neste navegador/dispositivo. Exporte um backup
          periodicamente para não perder nada — e poder restaurar em outro aparelho.
        </p>
        <Button block style={{ marginBottom: 10 }} onClick={exportBackup}>
          <Icon name="download" /> Exportar backup (.json)
        </Button>
        <Button variant="secondary" block onClick={() => importRef.current?.click()}>
          <Icon name="upload" /> Importar backup
        </Button>
        <input
          ref={importRef}
          type="file"
          accept="application/json"
          className="visually-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importBackup(file);
            e.target.value = "";
          }}
        />
      </div>

      <SectionTitle>Backup automático (Google Drive)</SectionTitle>
      <div className="card">
        {!isDriveConfigured() ? (
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Esse recurso ainda não foi configurado (falta o Client ID do Google no código). Veja o
            README do projeto para ativar em poucos minutos.
          </p>
        ) : (
          <>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              Conecte sua conta Google para o PataCare proteger seus dados no Drive automaticamente
              ao abrir o app e depois de cada alteração.
            </p>
            {driveConnected && (
              <p style={{ fontSize: 13, color: "var(--mint)", marginBottom: 12 }}>
                ✓ Conectado — {driveLastText}
              </p>
            )}
            <Button
              block
              style={{ marginBottom: 10 }}
              onClick={async () => {
                if (driveConnected) await driveDisconnect();
                else await driveConnect();
                refresh();
              }}
            >
              {driveConnected ? (
                "Desconectar Google Drive"
              ) : (
                <>
                  <Icon name="backup" /> Conectar Google Drive
                </>
              )}
            </Button>
            {driveConnected && (
              <>
                <Button
                  variant="secondary"
                  block
                  style={{ marginBottom: 10 }}
                  onClick={async () => {
                    try {
                      await driveUploadBackup(false);
                      toast("Backup enviado ao Google Drive!");
                    } catch {
                      toast("Não foi possível enviar o backup");
                    }
                    refresh();
                  }}
                >
                  Fazer backup agora
                </Button>
                <Button variant="secondary" block onClick={driveRestoreFlow}>
                  Restaurar do Google Drive
                </Button>
              </>
            )}
          </>
        )}
      </div>

      <SectionTitle>Zona de risco</SectionTitle>
      <div className="card">
        <Button
          variant="danger"
          block
          onClick={async () => {
            const ok = await confirm({
              title: "Excluir tudo?",
              message:
                "Isso vai remover todos os pets e registros deste dispositivo. Essa ação não pode ser desfeita.",
              confirmLabel: "Excluir tudo",
              danger: true,
            });
            if (!ok) return;
            await clearAll();
            toast("Todos os dados foram excluídos");
            navigate("#/");
          }}
        >
          <Icon name="trash" /> Excluir todos os dados
        </Button>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "26px 10px",
          color: "var(--text-faint)",
          fontSize: 12.5,
        }}
      >
        PataCare v2.0 🐾
        <br />
        Feito com carinho para cuidar de quem cuida da gente.
      </div>
    </motion.div>
  );
}
