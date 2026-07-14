import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/store/ui";
import { Button, IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const overlayRoot = () => document.getElementById("overlay-root") ?? document.body;

function SheetHost() {
  const sheet = useUiStore((s) => s.sheet);
  const closeSheet = useUiStore((s) => s.closeSheet);
  return (
    <AnimatePresence>
      {sheet && (
        <motion.div
          key={sheet.key}
          className="sheet-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSheet();
          }}
        >
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.26, ease: [0.2, 0.8, 0.3, 1] }}
          >
            <div className="sheet-handle" />
            {sheet.content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmHost() {
  const confirmState = useUiStore((s) => s.confirmState);
  const resolveConfirm = useUiStore((s) => s.resolveConfirm);
  return (
    <AnimatePresence>
      {confirmState && (
        <motion.div
          className="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) resolveConfirm(false);
          }}
        >
          <motion.div
            className="confirm-box"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <h4>{confirmState.title}</h4>
            <p>{confirmState.message}</p>
            <div className="row">
              <Button variant="ghost" block onClick={() => resolveConfirm(false)}>
                Cancelar
              </Button>
              <Button
                variant={confirmState.danger ? "danger" : "primary"}
                block
                onClick={() => resolveConfirm(true)}
              >
                {confirmState.confirmLabel || "Confirmar"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToastHost() {
  const toastMsg = useUiStore((s) => s.toastMsg);
  const toastKey = useUiStore((s) => s.toastKey);
  return (
    <AnimatePresence>
      {toastMsg && (
        <motion.div
          key={toastKey}
          className="toast"
          initial={{ opacity: 0, y: 10, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 6, x: "-50%" }}
          transition={{ duration: 0.22 }}
        >
          {toastMsg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LightboxHost() {
  const src = useUiStore((s) => s.lightboxSrc);
  const close = useUiStore((s) => s.closeLightbox);
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={close}
        >
          <motion.img
            src={src}
            alt="Foto ampliada"
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.18 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OverlayHost() {
  return createPortal(
    <>
      <SheetHost />
      <ConfirmHost />
      <ToastHost />
      <LightboxHost />
    </>,
    overlayRoot()
  );
}

/** Cabeçalho padrão dos bottom sheets, com botão de fechar. */
export function SheetHeader({ title }: { title: string }) {
  const closeSheet = useUiStore((s) => s.closeSheet);
  return (
    <div className="sheet-header">
      <h3>{title}</h3>
      <IconButton aria-label="Fechar" onClick={closeSheet}>
        <Icon name="close" />
      </IconButton>
    </div>
  );
}
