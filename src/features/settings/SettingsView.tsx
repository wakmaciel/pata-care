import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { petsSorted } from "@/domain/care";
import { useDataStore } from "@/store/data";
import { useTutorStore } from "@/store/tutor";
import { useThemeStore } from "@/store/theme";
import { useUiStore } from "@/store/ui";
import { navigate } from "@/router";
import { notificationPermission, showSystemNotification } from "@/services/notifications";
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
import {
  DOSE_ALERT_OPTIONS,
  getDoseAlertSettings,
  saveDoseAlertSettings,
} from "@/services/calendar";
import {
  disablePush,
  enablePush,
  isInstalledApp,
  isPushConfigured,
  isPushEnabled,
  pushSupported,
} from "@/services/push";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, SectionTitle, Switch } from "@/components/ui/Field";
import { TutorFormSheet } from "@/features/forms/TutorFormSheet";
import { PetCardSheet } from "@/features/forms/PetCardSheet";
import type { ThemeMode } from "@/types";

/* ── Notificações ────────────────────────────────────────────────────────────
   Um interruptor só, porque só existe um canal: o Web Push. Remédios, vacinas,
   vermífugos, antipulgas e consultas saem todos por ele, na hora marcada e com
   o app fechado.

   O canal que avisava ao abrir o app foi removido na v2.1 — ele repetia o que o
   push já tinha anunciado e, por natureza, só conseguia falar de coisas que já
   tinham passado. */
function NotificationsCard() {
  const { toast } = useUiStore();
  const [enabled, setEnabled] = useState(isPushEnabled());
  const [busy, setBusy] = useState(false);

  const permission = notificationPermission();
  const configured = isPushConfigured();
  const supported = pushSupported();
  const installed = isInstalledApp();
  const available = configured && supported && installed && permission !== "denied";

  const status = !configured
    ? "Servidor de avisos não configurado"
    : !supported
      ? "Indisponível neste navegador"
      : !installed
        ? "Requer o app na Tela de Início"
        : permission === "denied"
          ? "Bloqueadas no navegador"
          : enabled
            ? "Ativadas neste dispositivo"
            : "Desativadas";

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div className="settings-row" style={{ paddingTop: 0, borderBottom: "none" }}>
        <div className="lbl">
          <div className="t">Lembretes do PataCare</div>
          <div className="s">{status}</div>
        </div>
        <Switch
          checked={enabled}
          disabled={busy || !available}
          onChange={async (checked) => {
            setBusy(true);
            if (checked) {
              setEnabled(await enablePush());
            } else {
              await disablePush();
              setEnabled(false);
              toast("Lembretes desativados neste dispositivo");
            }
            setBusy(false);
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
        O aparelho é avisado na hora de cada dose de remédio e às 9h do dia de cada vacina,
        vermífugo, antipulgas ou consulta — repetindo todo dia às 9h enquanto o cuidado seguir
        pendente. Tudo chega com o PataCare fechado. Os dados do seu pet{" "}
        <strong>não saem do aparelho</strong>: o servidor guarda só os horários, e o texto do aviso
        é montado aqui.
      </p>
      {!installed && (
        <p style={{ fontSize: 12.5, color: "var(--peach)", lineHeight: 1.45, marginBottom: 12 }}>
          O iPhone só permite esses avisos no app instalado. Toque em compartilhar → "Adicionar à
          Tela de Início" e abra o PataCare por lá.
        </p>
      )}
      {permission === "denied" && (
        <p style={{ fontSize: 12.5, color: "var(--red)", lineHeight: 1.45, marginBottom: 12 }}>
          Libere as notificações nas configurações do aparelho e volte ao app.
        </p>
      )}
      <Button
        variant="secondary"
        block
        disabled={permission !== "granted"}
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
  );
}

/** Antecedência padrão do alarme gerado para cada dose de medicamento. */
function DoseCalendarCard() {
  const [leadMinutes, setLeadMinutes] = useState(getDoseAlertSettings().leadMinutes);

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 14 }}>
        Ao cadastrar um medicamento, o PataCare gera um arquivo <strong>.ics</strong> com um evento
        por dose. Ao abrir o arquivo, o iPhone adiciona tudo ao Calendário — e o alarme de cada dose
        toca mesmo com o app fechado.
      </p>
      <Field label="Alerta padrão de cada dose">
        <select
          value={leadMinutes}
          onChange={(e) => {
            const minutes = parseInt(e.target.value, 10);
            setLeadMinutes(minutes);
            saveDoseAlertSettings({ leadMinutes: minutes });
          }}
        >
          {DOSE_ALERT_OPTIONS.map((o) => (
            <option key={o.minutes} value={o.minutes}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

export function SettingsView() {
  const { pets, clearAll } = useDataStore();
  const tutor = useTutorStore((s) => s.tutor);
  const { mode, setMode } = useThemeStore();
  const { openSheet, toast, confirm } = useUiStore();
  const importRef = useRef<HTMLInputElement>(null);
  const [vetSelection, setVetSelection] = useState("all");
  const [cardSelection, setCardSelection] = useState("");
  // força re-render após ações que mudam estado fora do React (drive, notificações)
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  // cai no primeiro pet enquanto nada foi escolhido (ou se o escolhido foi excluído)
  const cardPet = petsSorted(pets).find((p) => p.id === cardSelection) ?? petsSorted(pets)[0];

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
      <NotificationsCard />

      <SectionTitle>Doses no calendário</SectionTitle>
      <DoseCalendarCard />

      {pets.length > 0 && (
        <>
          <SectionTitle>Carteirinha do pet</SectionTitle>
          <div className="card" style={{ marginBottom: 18 }}>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              Um cartão de identificação — foto, espécie, raça, nascimento, idade, microchip e seu
              contato — para salvar como imagem ou enviar ao médico-veterinário.
            </p>
            {pets.length > 1 && (
              <div className="field" style={{ marginBottom: 12 }}>
                <select
                  value={cardPet?.id ?? ""}
                  onChange={(e) => setCardSelection(e.target.value)}
                >
                  {petsSorted(pets).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button
              block
              disabled={!cardPet}
              onClick={() => cardPet && openSheet(<PetCardSheet pet={cardPet} />)}
            >
              <Icon name="chip" /> Gerar carteirinha
            </Button>
            {!tutor && (
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--text-muted)",
                  lineHeight: 1.45,
                  margin: "12px 0 0",
                }}
              >
                Cadastre seu perfil acima para incluir os dados do tutor na carteirinha.
              </p>
            )}
          </div>

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
