/* =========================================================================
   PataCare — Caderneta digital de pets
   Tudo roda no navegador. Os dados ficam salvos localmente (IndexedDB).
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------- Ícones (SVG) --------------------------- */
  const ICONS = {
    paw: '<svg viewBox="0 0 24 24"><circle cx="12" cy="15.5" r="4.2"/><circle cx="5.2" cy="10" r="2.3"/><circle cx="9.6" cy="6.3" r="2.3"/><circle cx="14.4" cy="6.3" r="2.3"/><circle cx="18.8" cy="10" r="2.3"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9.5a.5.5 0 0 0 .5.5H9.5a.5.5 0 0 0 .5-.5V15a2 2 0 0 1 4 0v4.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V10"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10a6 6 0 1 1 12 0c0 3 1 4.5 2 6H4c1-1.5 2-3 2-6Z"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6.3"/><circle cx="12" cy="12" r="2.3"/><path d="M18.5 12L20.7 12M16.6 16.6L18.15 18.15M12 18.5L12 20.7M7.4 16.6L5.85 18.15M5.5 12L3.3 12M7.4 7.4L5.85 5.85M12 5.5L12 3.3M16.6 7.4L18.15 5.85"/></svg>',
    medkit: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="6" width="17" height="14" rx="2.2"/><path d="M8 6V4.8c0-.4.4-.8.9-.8h6.2c.5 0 .9.4.9.8V6"/><path d="M12 10v6M9 13h6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.2 2"/></svg>',
    vet: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6M9 6h6"/><circle cx="12" cy="14.5" r="6.5"/><path d="M9.3 14.5h5.4M12 11.8v5.4"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19.5 8.5a2 2 0 0 0 0-2.8L18.3 4.5a2 2 0 0 0-2.8 0L4 16v4Z"/><path d="M13.5 6.5l3.5 3.5"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7M6.5 7l.7 12c.05.9.8 1.5 1.6 1.5h6.4c.85 0 1.55-.6 1.6-1.5l.7-12"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5C4 7.7 4.7 7 5.5 7H8l1-1.7c.2-.3.5-.5.9-.5h4.2c.4 0 .7.2.9.5L16 7h2.5c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z"/><circle cx="12" cy="13" r="3.3"/></svg>',
    syringe: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3l-3 3M11.5 6.5l6 6M9.5 8.5l7 7-1.6 1.6-2-1.1-1.7 1.7 1.1 2-1.6 1.6-7-7 1.6-1.6 2 1.1 1.7-1.7-1.1-2 1.6-1.6Z"/><path d="M3 21l3.5-3.5"/></svg>',
    bug: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 6.5a2.5 2.5 0 1 1 5 0"/><path d="M7.5 10.5h9c0 5-2 8-4.5 8s-4.5-3-4.5-8Z"/><path d="M4.5 8l3 1.6M19.5 8l-3 1.6M4 13.5h3.5M20 13.5h-3.5M5 19l3-2.4M19 19l-3-2.4M9 5l-1.7-2M15 5l1.7-2"/></svg>',
    pill: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9.5" width="17" height="5" rx="2.5" transform="rotate(-35 12 12)"/><path d="M11 7l2 2"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M7 6h10l2 9a2 2 0 0 1-2 2.4H7A2 2 0 0 1 5 15Z"/><path d="M9 11h6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z"/></svg>',
    monitor: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="12" rx="1.6"/><path d="M8 20h8M12 16.5V20"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v12M7.5 11l4.5 4.5L16.5 11"/><path d="M4.5 19h15"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16.5v-12M7.5 8.5 12 4l4.5 4.5"/><path d="M4.5 19h15"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 21.5 20H2.5Z"/><path d="M12 10v4M12 17v.1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 9.5 17 19 6.5"/></svg>',
    dog: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9c0-2.5 1-4.5 2.5-4.5S9 7 9 9M19 9c0-2.5-1-4.5-2.5-4.5S15 7 15 9"/><path d="M5.5 9.2C5.5 7 8 6 12 6s6.5 1 6.5 3.2c0 4-1 8.3-6.5 8.3S5.5 13.2 5.5 9.2Z"/><circle cx="9.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/></svg>',
    cat: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5 8 10M18 5l-2 5"/><path d="M5.8 9.5c0-2 2.7-3 6.2-3s6.2 1 6.2 3c0 4.5-1.3 8-6.2 8s-6.2-3.5-6.2-8Z"/><circle cx="9.7" cy="11" r=".8" fill="currentColor" stroke="none"/><circle cx="14.3" cy="11" r=".8" fill="currentColor" stroke="none"/><path d="M11 13.2h2l-1 1.1Z"/></svg>',
    cog_small: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/></svg>',
    backup: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8a7 7 0 1 1 1.8 8.4"/><path d="M3.5 12.5 5 8l4 1.4"/><path d="M12 8v4.3l3 1.7"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.2M12 8v.1"/></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 6V3.5M15 6V3.5M9 20.5V18M15 20.5V18M6 9H3.5M6 15H3.5M20.5 9H18M20.5 15H18"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5.5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18.5" r="1.6"/></svg>'
  };
  /* ------------------------------ Util ----------------------------------- */
  const MONTHS_ABBR = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  const MONTHS_FULL = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }
  function todayISO() {
    const d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function parseISODate(s) {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  function fmtDate(s) {
    if (!s) return "—";
    const d = parseISODate(s);
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
  }
  function fmtTime(t) { return t ? t : ""; }
  function daysBetween(aISO, bISO) {
    const a = parseISODate(aISO), b = parseISODate(bISO);
    return Math.round((b - a) / 86400000);
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function calcAge(birthISO) {
    if (!birthISO) return "";
    const b = parseISODate(birthISO), now = new Date();
    let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
    if (now.getDate() < b.getDate()) months--;
    if (months < 0) return "";
    if (months < 1) {
      const days = Math.max(0, Math.round((now - b) / 86400000));
      return days <= 1 ? "Recém-nascido" : days + " dias";
    }
    if (months < 24) {
      if (months === 0) return "menos de 1 mês";
      return months + (months === 1 ? " mês" : " meses");
    }
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return years + (years === 1 ? " ano" : " anos") + (rem > 0 ? " e " + rem + (rem === 1 ? " mês" : " meses") : "");
  }
  function dueStatus(nextISO) {
    if (!nextISO) return { status: "none", days: null };
    const d = daysBetween(todayISO(), nextISO);
    if (d < 0) return { status: "overdue", days: -d };
    if (d <= 7) return { status: "soon", days: d };
    return { status: "ok", days: d };
  }
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function hexToRgba(hex, alpha) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function resizeImageFile(file, maxDim, quality) {
    maxDim = maxDim || 900; quality = quality || 0.72;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
            else { width = Math.round(width * (maxDim / height)); height = maxDim; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ------------------------------ Banco (IndexedDB) ----------------------- */
  const DB_NAME = "patacare-db";
  const DB_VERSION = 1;
  let dbInstance = null;

  function openDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("pets")) {
          db.createObjectStore("pets", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("records")) {
          const store = db.createObjectStore("records", { keyPath: "id" });
          store.createIndex("petId", "petId", { unique: false });
        }
      };
      req.onsuccess = () => { dbInstance = req.result; resolve(dbInstance); };
      req.onerror = () => reject(req.error);
    });
  }
  function tx(storeName, mode) {
    return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
  }
  function dbGetAll(storeName) {
    return tx(storeName, "readonly").then((store) => new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    }));
  }
  function dbPut(storeName, obj) {
    return tx(storeName, "readwrite").then((store) => new Promise((resolve, reject) => {
      const req = store.put(obj);
      req.onsuccess = () => resolve(obj);
      req.onerror = () => reject(req.error);
    }));
  }
  function dbDelete(storeName, id) {
    return tx(storeName, "readwrite").then((store) => new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }));
  }
  function dbClear(storeName) {
    return tx(storeName, "readwrite").then((store) => new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }));
  }

  /* --------------------------- Estado em memória --------------------------- */
  const STATE = { pets: [], records: [] };

  function loadAll() {
    return Promise.all([dbGetAll("pets"), dbGetAll("records")]).then(([pets, records]) => {
      STATE.pets = pets;
      STATE.records = records;
    });
  }
  function petsSorted() {
    return STATE.pets.slice().sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }
  function getPet(id) { return STATE.pets.find((p) => p.id === id); }
  function recordsFor(petId, category) {
    return STATE.records.filter((r) => r.petId === petId && r.category === category)
      .sort((a, b) => (b.date || b.startDate || "").localeCompare(a.date || a.startDate || ""));
  }
  function careRecordsFor(petId) {
    const pet = getPet(petId);
    const disabled = (pet && pet.disabledVaccineTypes) || [];
    return STATE.records.filter((r) => r.petId === petId && (r.category === "vaccine" || r.category === "antiparasitic" || r.category === "dewormer"))
      .filter((r) => !(r.category === "vaccine" && r.vaccineType && disabled.includes(r.vaccineType)));
  }
  function petBadgeStatus(petId) {
    const recs = careRecordsFor(petId);
    let overdueCount = 0, soonCount = 0, hasAny = false;
    recs.forEach((r) => {
      if (!r.nextDate) return;
      hasAny = true;
      const s = dueStatus(r.nextDate).status;
      if (s === "overdue") overdueCount++;
      else if (s === "soon") soonCount++;
    });
    if (!hasAny) return null;
    if (overdueCount > 0) return { status: "overdue", count: overdueCount };
    if (soonCount > 0) return { status: "soon", count: soonCount };
    return { status: "ok" };
  }

  /* -------------------------------- Toast ---------------------------------- */
  let toastTimer = null;
  function toast(msg) {
    const root = document.getElementById("overlay-root");
    let el = root.querySelector(".toast");
    if (el) el.remove();
    el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    root.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2400);
  }

  /* ------------------------------- Confirm ---------------------------------- */
  function confirmDialog({ title, message, confirmLabel, danger }) {
    return new Promise((resolve) => {
      const root = document.getElementById("overlay-root");
      const wrap = document.createElement("div");
      wrap.className = "confirm-overlay";
      wrap.innerHTML = `
        <div class="confirm-box">
          <h4>${escapeHtml(title)}</h4>
          <p>${escapeHtml(message)}</p>
          <div class="row">
            <button class="btn btn-ghost btn-block" data-act="cancel">Cancelar</button>
            <button class="btn ${danger ? "btn-danger" : "btn-primary"} btn-block" data-act="ok">${escapeHtml(confirmLabel || "Confirmar")}</button>
          </div>
        </div>`;
      root.appendChild(wrap);
      wrap.addEventListener("click", (e) => {
        if (e.target === wrap) { wrap.remove(); resolve(false); return; }
        const act = e.target.closest("[data-act]");
        if (!act) return;
        wrap.remove();
        resolve(act.dataset.act === "ok");
      });
    });
  }

  function showLightbox(src) {
    const root = document.getElementById("overlay-root");
    const wrap = document.createElement("div");
    wrap.className = "lightbox";
    wrap.innerHTML = `<img src="${src}" alt="Foto ampliada">`;
    wrap.addEventListener("click", () => wrap.remove());
    root.appendChild(wrap);
  }

  function closeSheet() {
    const el = document.querySelector(".sheet-overlay");
    if (el) el.remove();
  }
  function openSheetEl(innerHTML) {
    closeSheet();
    const root = document.getElementById("overlay-root");
    const wrap = document.createElement("div");
    wrap.className = "sheet-overlay";
    wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${innerHTML}</div>`;
    wrap.addEventListener("click", (e) => { if (e.target === wrap) closeSheet(); });
    root.appendChild(wrap);
    return wrap.querySelector(".sheet");
  }

  /* -------------------------------- Tema ------------------------------------ */
  const THEME_KEY = "patacare-theme";
  function effectiveTheme(mode) {
    if (mode === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return mode;
  }
  function applyTheme(mode) {
    document.documentElement.dataset.theme = effectiveTheme(mode);
  }
  function getThemeMode() { return localStorage.getItem(THEME_KEY) || "system"; }
  function setThemeMode(mode) {
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
  }
  applyTheme(getThemeMode());
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getThemeMode() === "system") applyTheme("system");
  });

  /* -------------------------------- Router ----------------------------------- */
  function parseHash() {
    const h = (location.hash || "#/").replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    if (parts.length === 0) return { view: "home" };
    if (parts[0] === "pet" && parts[1]) return { view: "pet", petId: parts[1], tab: parts[2] || "overview" };
    if (parts[0] === "lembretes") return { view: "reminders" };
    if (parts[0] === "ajustes") return { view: "settings" };
    return { view: "home" };
  }
  function navigate(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }
  window.addEventListener("hashchange", render);

  /* ============================== RENDER ROOT ================================ */
  function render() {
    const route = parseHash();
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(renderTopbar(route));
    const main = document.createElement("main");
    main.className = "view";
    app.appendChild(main);

    if (route.view === "home") renderHome(main);
    else if (route.view === "pet") renderPetDetail(main, route.petId, route.tab);
    else if (route.view === "reminders") renderReminders(main);
    else if (route.view === "settings") renderSettings(main);

    app.appendChild(renderBottomBar(route));
    renderFab(route);
    window.scrollTo(0, 0);
  }

  function renderTopbar(route) {
    const bar = document.createElement("div");
    bar.className = "topbar";
    if (route.view === "pet") {
      const pet = getPet(route.petId);
      bar.innerHTML = `
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-back" aria-label="Voltar">${ICONS.chevronLeft}</button>
        </div>
        <h1>${pet ? escapeHtml(pet.name) : "Pet"}</h1>
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-edit-pet" aria-label="Editar pet">${ICONS.edit}</button>
        </div>`;
      bar.querySelector("#btn-back").addEventListener("click", () => navigate("#/"));
      bar.querySelector("#btn-edit-pet").addEventListener("click", () => openPetForm(getPet(route.petId)));
    } else {
      const titles = { home: "Meus Pets", reminders: "Lembretes", settings: "Ajustes" };
      bar.innerHTML = `
        <div class="brand">
          <span class="logo-dot"><img src="icons/icon-192.png" alt="PataCare"></span>
          <h1>${titles[route.view] || "PataCare"}</h1>
        </div>
        <div class="topbar-actions"></div>`;
    }
    return bar;
  }

  function renderBottomBar(route) {
    const bar = document.createElement("div");
    bar.className = "bottombar";
    const overdueCount = STATE.pets.reduce((acc, p) => {
      const b = petBadgeStatus(p.id);
      return acc + (b && b.status === "overdue" ? 1 : 0);
    }, 0);
    const items = [
      { id: "home", label: "Pets", icon: "home", hash: "#/" },
      { id: "reminders", label: "Lembretes", icon: "bell", hash: "#/lembretes", badge: overdueCount },
      { id: "settings", label: "Ajustes", icon: "settings", hash: "#/ajustes" }
    ];
    items.forEach((it) => {
      const active = route.view === it.id;
      const div = document.createElement("div");
      div.className = "nav-item" + (active ? " active" : "");
      div.innerHTML = `${ICONS[it.icon]}<span>${it.label}${it.badge ? ` (${it.badge})` : ""}</span>`;
      div.addEventListener("click", () => navigate(it.hash));
      bar.appendChild(div);
    });
    return bar;
  }

  function renderFab(route) {
    document.querySelectorAll(".fab").forEach((f) => f.remove());
    let action = null;
    if (route.view === "home") action = () => openPetForm(null);
    else if (route.view === "pet") {
      const tab = route.tab || "overview";
      if (tab === "vaccine") action = () => openVaccineForm(route.petId, null);
      else if (tab === "medication") action = () => openMedicationForm(route.petId, null);
      else if (["antiparasitic", "dewormer", "weight", "heat"].includes(tab)) action = () => openRecordForm(tab, route.petId, null);
    }
    if (!action) return;
    const fab = document.createElement("button");
    fab.className = "fab";
    fab.setAttribute("aria-label", "Adicionar");
    fab.innerHTML = ICONS.plus;
    fab.addEventListener("click", action);
    document.getElementById("app").appendChild(fab);
  }

  /* ================================ HOME ===================================== */
  function renderHome(main) {
    const pets = petsSorted();
    if (pets.length === 0) {
      main.innerHTML = `
        <div class="empty-state">
          <div class="paw-stack"><img src="icons/icon-192.png" alt="" style="width:64px;height:64px;border-radius:18px;opacity:.9;box-shadow:var(--shadow-sm)"></div>
          <h3>Nenhum pet por aqui ainda</h3>
          <p>Cadastre seu primeiro companheiro para começar a registrar vacinas, antipulgas, vermífugos e muito mais.</p>
          <button class="btn btn-primary" id="btn-add-first">${ICONS.plus} Adicionar pet</button>
        </div>`;
      main.querySelector("#btn-add-first").addEventListener("click", () => openPetForm(null));
      return;
    }
    const wrap = document.createElement("div");
    pets.forEach((pet) => wrap.appendChild(renderPetCard(pet)));
    main.appendChild(wrap);
  }

  function renderPetCard(pet) {
    const card = document.createElement("div");
    card.className = "pet-card";
    const badge = petBadgeStatus(pet.id);
    let chipHtml = "";
    if (badge) {
      if (badge.status === "overdue") chipHtml = `<span class="chip alert">${ICONS.alert} ${badge.count > 1 ? badge.count + " atrasados" : "Atrasado"}</span>`;
      else if (badge.status === "soon") chipHtml = `<span class="chip soon">${ICONS.calendar} Em breve</span>`;
      else chipHtml = `<span class="chip ok">${ICONS.check} Tudo certo</span>`;
    }
    const sexLabel = pet.sex === "F" ? "Fêmea" : "Macho";
    const speciesIcon = pet.species === "cat" ? ICONS.cat : ICONS.dog;
    card.innerHTML = `
      ${pet.photo ? `<img class="pet-avatar" src="${pet.photo}" alt="Foto de ${escapeHtml(pet.name)}">` : `<div class="pet-avatar placeholder">${speciesIcon}</div>`}
      <div class="pet-card-info">
        <h3>${escapeHtml(pet.name)}</h3>
        <div class="meta">${escapeHtml(pet.breed || (pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Pet"))} · ${sexLabel}${pet.birthDate ? " · " + calcAge(pet.birthDate) : ""}</div>
        <div class="pet-card-badges">${chipHtml}</div>
      </div>
      <span class="chevron">${ICONS.chevronRight}</span>`;
    card.addEventListener("click", () => navigate(`#/pet/${pet.id}/overview`));
    return card;
  }

  /* =============================== PET DETAIL ================================= */
  const TABS = [
    { id: "overview", label: "Visão geral" },
    { id: "vaccine", label: "Vacinas", icon: "syringe" },
    { id: "medication", label: "Medicamentos", icon: "medkit" },
    { id: "antiparasitic", label: "Antipulgas/Carrapatos", icon: "bug" },
    { id: "dewormer", label: "Vermífugos", icon: "pill" },
    { id: "weight", label: "Peso", icon: "scale" },
    { id: "heat", label: "Cio", icon: "heart", femaleOnly: true }
  ];

  function renderPetDetail(main, petId, tab) {
    const pet = getPet(petId);
    if (!pet) {
      main.innerHTML = `<div class="empty-state"><h3>Pet não encontrado</h3><p>Esse pet pode ter sido removido.</p><button class="btn btn-primary" id="bk">Voltar</button></div>`;
      main.querySelector("#bk").addEventListener("click", () => navigate("#/"));
      return;
    }
    const speciesIcon = pet.species === "cat" ? ICONS.cat : ICONS.dog;
    const header = document.createElement("div");
    header.className = "pet-header";
    header.innerHTML = `
      ${pet.photo ? `<img class="pet-avatar" src="${pet.photo}" alt="Foto de ${escapeHtml(pet.name)}">` : `<div class="pet-avatar placeholder">${speciesIcon}</div>`}
      <h2>${escapeHtml(pet.name)}</h2>
      <div class="meta">${escapeHtml(pet.breed || "Raça não informada")} · ${pet.sex === "F" ? "Fêmea" : "Macho"}</div>
      ${pet.birthDate ? `<span class="age-pill">${calcAge(pet.birthDate)}</span>` : ""}`;
    main.appendChild(header);

    const visibleTabs = TABS.filter((t) => !t.femaleOnly || pet.sex === "F");
    const tabsRow = document.createElement("div");
    tabsRow.className = "tabs";
    visibleTabs.forEach((t) => {
      const b = document.createElement("button");
      b.className = "tab" + (t.id === tab ? " active" : "");
      b.innerHTML = (t.icon ? ICONS[t.icon] : "") + `<span>${t.label}</span>`;
      b.addEventListener("click", () => navigate(`#/pet/${petId}/${t.id}`));
      tabsRow.appendChild(b);
    });
    main.appendChild(tabsRow);

    const content = document.createElement("div");
    main.appendChild(content);

    if (tab === "overview") renderOverviewTab(content, pet);
    else if (tab === "vaccine") renderCareListTab(content, pet, "vaccine");
    else if (tab === "medication") renderMedicationTab(content, pet);
    else if (tab === "antiparasitic") renderCareListTab(content, pet, "antiparasitic");
    else if (tab === "dewormer") renderCareListTab(content, pet, "dewormer");
    else if (tab === "weight") renderWeightTab(content, pet);
    else if (tab === "heat" && pet.sex === "F") renderHeatTab(content, pet);
    else renderOverviewTab(content, pet);
  }

  function renderOverviewTab(content, pet) {
    const vac = recordsFor(pet.id, "vaccine");
    const anti = recordsFor(pet.id, "antiparasitic");
    const derm = recordsFor(pet.id, "dewormer");
    const weights = recordsFor(pet.id, "weight");
    const lastWeight = weights[0];

    const infoCard = document.createElement("div");
    infoCard.className = "card";
    infoCard.innerHTML = `
      <div class="settings-row" style="padding-top:0">
        <div class="ic">${ICONS.calendar}</div>
        <div class="lbl"><div class="t">Nascimento</div><div class="s">${pet.birthDate ? fmtDate(pet.birthDate) + " · " + calcAge(pet.birthDate) : "Não informado"}</div></div>
      </div>
      <div class="settings-row">
        <div class="ic">${pet.species === "cat" ? ICONS.cat : ICONS.dog}</div>
        <div class="lbl"><div class="t">Espécie e raça</div><div class="s">${(pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Outro")} · ${escapeHtml(pet.breed || "—")}</div></div>
      </div>
      ${pet.microchip ? `<div class="settings-row"><div class="ic">${ICONS.chip}</div><div class="lbl"><div class="t">Microchip</div><div class="s">${escapeHtml(pet.microchip)}</div></div></div>` : ""}
      ${pet.notes ? `<div class="settings-row"><div class="ic">${ICONS.info}</div><div class="lbl"><div class="t">Observações</div><div class="s">${escapeHtml(pet.notes)}</div></div></div>` : ""}`;
    content.appendChild(infoCard);

    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = "Resumo de cuidados";
    content.appendChild(title);

    const summary = document.createElement("div");
    summary.className = "card";
    function row(icon, label, list, hash) {
      const r = document.createElement("div");
      r.className = "settings-row";
      r.style.cursor = "pointer";
      const next = list.find((x) => x.nextDate);
      const st = next ? dueStatus(next.nextDate) : null;
      let statusHtml = `<span class="s">${list.length} registro${list.length === 1 ? "" : "s"}</span>`;
      if (st && st.status === "overdue") statusHtml = `<span class="s" style="color:var(--red);font-weight:700">Atrasado há ${st.days}d</span>`;
      else if (st && st.status === "soon") statusHtml = `<span class="s" style="color:var(--peach);font-weight:700">Próxima em ${st.days}d</span>`;
      r.innerHTML = `<div class="ic">${ICONS[icon]}</div><div class="lbl"><div class="t">${label}</div>${statusHtml}</div><span class="chevron">${ICONS.chevronRight}</span>`;
      r.addEventListener("click", () => navigate(hash));
      return r;
    }
    summary.appendChild(row("syringe", "Vacinas", vac, `#/pet/${pet.id}/vaccine`));
    const meds = STATE.records.filter((r) => r.petId === pet.id && r.category === "medication");
    const medActive = meds.filter((m) => m.doses.some((d) => !d.done));
    const medRow = document.createElement("div");
    medRow.className = "settings-row"; medRow.style.cursor = "pointer";
    let medStatus = `<span class="s">${meds.length} registrado${meds.length === 1 ? "" : "s"}</span>`;
    if (medActive.length > 0) medStatus = `<span class="s" style="color:var(--pink-strong);font-weight:700">${medActive.length} em andamento</span>`;
    medRow.innerHTML = `<div class="ic">${ICONS.medkit}</div><div class="lbl"><div class="t">Medicamentos</div>${medStatus}</div><span class="chevron">${ICONS.chevronRight}</span>`;
    medRow.addEventListener("click", () => navigate(`#/pet/${pet.id}/medication`));
    summary.appendChild(medRow);
    summary.appendChild(row("bug", "Antipulgas/Carrapatos", anti, `#/pet/${pet.id}/antiparasitic`));
    summary.appendChild(row("pill", "Vermífugos", derm, `#/pet/${pet.id}/dewormer`));
    const wr = document.createElement("div");
    wr.className = "settings-row"; wr.style.cursor = "pointer";
    wr.innerHTML = `<div class="ic">${ICONS.scale}</div><div class="lbl"><div class="t">Peso</div><span class="s">${lastWeight ? lastWeight.weight + " kg em " + fmtDate(lastWeight.date) : "Sem registros"}</span></div><span class="chevron">${ICONS.chevronRight}</span>`;
    wr.addEventListener("click", () => navigate(`#/pet/${pet.id}/weight`));
    summary.appendChild(wr);
    content.appendChild(summary);
  }

  /* ----------------------- Protocolos de vacinação (Brasil) ------------------------
     Intervalos baseados em referências veterinárias usuais no Brasil (Zoetis, Petz,
     Pedigree, Cobasi, Covet, World Veterinária). São uma REFERÊNCIA GERAL — o
     médico-veterinário pode ajustar o protocolo conforme raça, risco e histórico do pet. */
  const VACCINE_PROTOCOLS = {
    v8v10: { label: "V8/V10 (Polivalente)", species: "dog", initialDoses: 3, intervalDays: 21, boosterDays: 365, minAgeWeeks: 6 },
    antirrabica: { label: "Antirrábica", species: "any", initialDoses: 1, intervalDays: 21, boosterDays: 365, minAgeWeeks: 12 },
    giardia: { label: "Giárdia", species: "any", initialDoses: 2, intervalDays: 21, boosterDays: 365, minAgeWeeks: 6 },
    gripe: { label: "Gripe Canina/Tosse dos Canis", species: "dog", initialDoses: 2, intervalDays: 21, boosterDays: 365, minAgeWeeks: 8 },
    leishmaniose: { label: "Leishmaniose", species: "dog", initialDoses: 3, intervalDays: 21, boosterDays: 365, minAgeWeeks: 16 },
    v3v4v5: { label: "V3/V4/V5 (Felina)", species: "cat", initialDoses: 3, intervalDays: 21, boosterDays: 365, minAgeWeeks: 8 },
    felv: { label: "Leucemia Felina (FeLV)", species: "cat", initialDoses: 2, intervalDays: 21, boosterDays: 365, minAgeWeeks: 8 },
    outra: { label: "Outra (personalizada)", species: "any", initialDoses: null, intervalDays: null, boosterDays: null, minAgeWeeks: 0 }
  };
  function vaccineTypeLabel(type) { return (VACCINE_PROTOCOLS[type] && VACCINE_PROTOCOLS[type].label) || "Vacina"; }
  function addDaysISO(dateISO, days) {
    const d = parseISODate(dateISO);
    d.setDate(d.getDate() + days);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  // Quantas doses desse tipo o pet já tem registradas até (e incluindo) essa data, sem contar o próprio registro em edição
  function priorDoseCount(petId, vaccineType, dateISO, excludeId) {
    return STATE.records.filter((r) => r.petId === petId && r.category === "vaccine" && r.vaccineType === vaccineType && r.id !== excludeId && r.date <= dateISO).length;
  }
  function computeVaccineSchedule(petId, vaccineType, dateISO, excludeId) {
    const protocol = VACCINE_PROTOCOLS[vaccineType];
    if (!protocol || !protocol.initialDoses) return { nextDate: null, doseNumber: null, isBooster: false, protocol: null };
    const doseNumber = priorDoseCount(petId, vaccineType, dateISO, excludeId) + 1;
    const isBooster = doseNumber > protocol.initialDoses; // classifica esta dose (badge exibido)
    const nextIsBooster = (doseNumber + 1) > protocol.initialDoses; // define o intervalo até a PRÓXIMA dose
    const intervalDays = nextIsBooster ? protocol.boosterDays : protocol.intervalDays;
    const nextDate = addDaysISO(dateISO, intervalDays);
    return { nextDate, doseNumber, isBooster, protocol };
  }
  function stepProtocolForward(protocol, doseNumber, dateISO) {
    const nextDoseNumber = doseNumber + 1;
    const isBooster = nextDoseNumber > protocol.initialDoses;
    const intervalDays = isBooster ? protocol.boosterDays : protocol.intervalDays;
    return { doseNumber: nextDoseNumber, date: addDaysISO(dateISO, intervalDays), isBooster };
  }
  function vaccineDoseLabel(doseNumber, isBooster, dateISO) {
    if (!isBooster) return `Dose ${doseNumber}`;
    return `Dose ${parseISODate(dateISO).getFullYear()}`;
  }

  /* ------------------------- Medicamentos: cálculo de doses ------------------------ */
  const MED_FORM_UNITS = {
    comprimido: "comprimido(s)", gota: "gota(s)", liquido: "ml", injecao: "aplicação(ões)", outro: "dose(s)"
  };
  function buildMedicationDoses(startDateTimeISO, frequencyHours, totalDoses) {
    const doses = [];
    const start = new Date(startDateTimeISO);
    for (let i = 0; i < totalDoses; i++) {
      const t = new Date(start.getTime() + i * frequencyHours * 3600000);
      doses.push({ scheduledAt: t.toISOString(), done: false, doneAt: null });
    }
    return doses;
  }
  function fmtDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + " às " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }


  function categoryConfig(category) {
    const CFG = {
      vaccine: {
        label: "vacina", title: "Vacina", icon: "syringe", hasPhoto: true,
        emptyTitle: "Nenhuma vacina registrada", emptyText: "Toque no + para registrar a primeira vacina, com data e foto da etiqueta.",
        getTitle: (rec) => (rec.vaccineType && rec.vaccineType !== "outra") ? vaccineTypeLabel(rec.vaccineType) : (rec.name || "Vacina"),
        getBadge: (rec) => {
          if (!rec.vaccineType || rec.vaccineType === "outra" || !rec.doseNumber) return null;
          if (rec.isBooster) return "Reforço anual";
          const protocol = VACCINE_PROTOCOLS[rec.vaccineType];
          return protocol.initialDoses === 1 ? "Dose única" : `Dose ${rec.doseNumber} de ${protocol.initialDoses}`;
        }
      },
      antiparasitic: { label: "aplicação", title: "Antipulgas/Carrapatos", icon: "bug", primaryKey: "product", primaryLabel: "Produto aplicado", placeholder: "Ex: Bravecto, Simparic, NexGard...", hasPhoto: false, emptyTitle: "Nada registrado ainda", emptyText: "Registre aqui os antipulgas e carrapaticidas aplicados no seu pet." },
      dewormer: { label: "aplicação", title: "Vermífugo", icon: "pill", primaryKey: "product", primaryLabel: "Vermífugo aplicado", placeholder: "Ex: Drontal, Vermivet...", hasPhoto: false, emptyTitle: "Nada registrado ainda", emptyText: "Registre aqui os vermífugos aplicados no seu pet." }
    };
    return CFG[category];
  }

  function renderCareListTab(content, pet, category) {
    const cfg = categoryConfig(category);
    const list = recordsFor(pet.id, category);
    const openForm = (rec) => (category === "vaccine" ? openVaccineForm(pet.id, rec) : openRecordForm(category, pet.id, rec));

    if (category === "vaccine") {
      renderVaccineForecast(content, pet);
    }

    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = `
          <div class="paw-stack">${ICONS[cfg.icon].replace("<svg", '<svg style="width:42px;height:42px;stroke:var(--pink-soft);fill:none"')}</div>
          <h3>${cfg.emptyTitle}</h3>
          <p>${cfg.emptyText}</p>
          <button class="btn btn-primary" id="btn-add-rec">${ICONS.plus} Adicionar</button>`;
      content.appendChild(empty);
      empty.querySelector("#btn-add-rec").addEventListener("click", () => openForm(null));
      return;
    }
    if (category === "vaccine" && list.length > 0) {
      const title = document.createElement("div");
      title.className = "section-title";
      title.textContent = "Histórico";
      content.appendChild(title);
    }
    list.forEach((rec) => content.appendChild(renderRecordCard(rec, cfg, category, pet.id)));
  }

  function renderVaccineForecast(content, pet) {
    const disabled = pet.disabledVaccineTypes || [];
    const all = recordsFor(pet.id, "vaccine"); // desc by date
    const types = [...new Set(all.map((r) => r.vaccineType).filter((t) => t && t !== "outra"))];
    if (types.length === 0) return;

    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = "Previsão de vacinas";
    content.appendChild(title);

    types.forEach((type) => {
      const protocol = VACCINE_PROTOCOLS[type];
      if (!protocol) return;
      const isOff = disabled.includes(type);
      const recsAsc = all.filter((r) => r.vaccineType === type).sort((a, b) => a.date.localeCompare(b.date));
      const last = recsAsc[recsAsc.length - 1];
      const nodes = recsAsc.slice(-2).map((r) => ({ date: r.date, label: vaccineDoseLabel(r.doseNumber, r.isBooster, r.date), done: true }));
      if (last && last.nextDate) {
        const lastDoseNum = last.doseNumber || recsAsc.length;
        const lastIsBooster = !!last.isBooster;
        const predicted = lastIsBooster
          ? { doseNumber: lastDoseNum + 1, date: last.nextDate, isBooster: true }
          : (lastDoseNum + 1 > protocol.initialDoses ? { doseNumber: lastDoseNum + 1, date: last.nextDate, isBooster: true } : { doseNumber: lastDoseNum + 1, date: last.nextDate, isBooster: false });
        nodes.push({ date: predicted.date, label: vaccineDoseLabel(predicted.doseNumber, predicted.isBooster, predicted.date), done: false });
        const future = stepProtocolForward(protocol, predicted.doseNumber, predicted.date);
        nodes.push({ date: future.date, label: vaccineDoseLabel(future.doseNumber, future.isBooster, future.date), done: false, faded: true });
      }
      const shown = nodes.slice(-3);

      const card = document.createElement("div");
      card.className = "card vaccine-forecast" + (isOff ? " is-off" : "");
      card.style.marginBottom = "12px";
      const edgeColor = (a, b) => {
        if (shown[a].done) return "var(--mint)";
        if (shown[b].faded) return "var(--border)";
        return "var(--pink)";
      };
      const dotsHtml = shown.map((n, i) => {
        const dotColor = n.done ? "var(--mint)" : (n.faded ? "var(--border)" : "var(--pink)");
        const legLeft = i === 0 ? "transparent" : edgeColor(i - 1, i);
        const legRight = i === shown.length - 1 ? "transparent" : edgeColor(i, i + 1);
        return `
          <div class="vf-col">
            <div class="vf-date">${fmtDate(n.date)}</div>
            <div class="vf-line">
              <span class="vf-seg" style="background:${legLeft}"></span>
              <span class="vf-dot" style="background:${dotColor}"></span>
              <span class="vf-seg" style="background:${legRight}"></span>
            </div>
            <div class="vf-label">${escapeHtml(n.label)}</div>
          </div>`;
      }).join("");
      card.innerHTML = `
        <div class="vf-head">
          <span class="vf-icon">${ICONS.syringe}</span>
          <h4>${escapeHtml(protocol.label)}</h4>
          <button class="vf-toggle" data-type="${type}">${isOff ? ICONS.check + " Habilitar" : ICONS.close + " Desabilitar"}</button>
        </div>
        <div class="vf-row">${dotsHtml}</div>`;
      card.querySelector(".vf-toggle").addEventListener("click", async () => {
        const set = new Set(pet.disabledVaccineTypes || []);
        if (set.has(type)) set.delete(type); else set.add(type);
        pet.disabledVaccineTypes = [...set];
        await dbPut("pets", pet);
        await loadAll();
        render();
      });
      content.appendChild(card);
    });
  }

  function renderRecordCard(rec, cfg, category, petId) {
    const div = document.createElement("div");
    div.className = "record";
    const d = parseISODate(rec.date);
    const st = dueStatus(rec.nextDate);
    const title = cfg.getTitle ? cfg.getTitle(rec) : (rec[cfg.primaryKey] || cfg.title);
    const badge = cfg.getBadge ? cfg.getBadge(rec) : null;
    let nextHtml = "";
    if (rec.nextDate) {
      const color = st.status === "overdue" ? "var(--red)" : st.status === "soon" ? "var(--peach)" : "var(--mint)";
      const txt = st.status === "overdue" ? `Atrasado há ${st.days} dia${st.days === 1 ? "" : "s"}` : st.status === "soon" ? `Em ${st.days} dia${st.days === 1 ? "" : "s"} (${fmtDate(rec.nextDate)})` : `Próxima em ${fmtDate(rec.nextDate)}`;
      nextHtml = `<hr class="record-divider"><div class="record-next" style="color:${color}">${ICONS.calendar} ${txt}</div>`;
    }
    div.innerHTML = `
      <div class="record-stamp"><span class="d">${pad(d.getDate())}</span><span class="m">${MONTHS_ABBR[d.getMonth()]}</span></div>
      <div class="record-body">
        <h4>${escapeHtml(title)}</h4>
        <div class="sub">${fmtDate(rec.date)}${badge ? " · " + escapeHtml(badge) : ""}</div>
        ${rec.notes ? `<div class="sub">${escapeHtml(rec.notes)}</div>` : ""}
        ${nextHtml}
      </div>
      ${rec.photo ? `<img class="record-thumb" src="${rec.photo}" alt="Etiqueta">` : ""}
      <button class="record-menu-btn" aria-label="Editar">${ICONS.dots}</button>`;
    if (rec.photo) {
      div.querySelector(".record-thumb").addEventListener("click", (e) => { e.stopPropagation(); showLightbox(rec.photo); });
    }
    const openEdit = () => (category === "vaccine" ? openVaccineForm(petId, rec) : openRecordForm(category, petId, rec));
    div.querySelector(".record-menu-btn").addEventListener("click", openEdit);
    div.querySelector(".record-body").addEventListener("click", openEdit);
    return div;
  }

  function renderWeightTab(content, pet) {
    const list = recordsFor(pet.id, "weight"); // desc
    if (list.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="paw-stack">${ICONS.scale.replace("<svg", '<svg style="width:42px;height:42px;stroke:var(--pink-soft);fill:none"')}</div>
          <h3>Nenhum peso registrado</h3>
          <p>Acompanhe a evolução do peso do seu pet ao longo do tempo.</p>
          <button class="btn btn-primary" id="btn-add-rec">${ICONS.plus} Registrar peso</button>
        </div>`;
      content.querySelector("#btn-add-rec").addEventListener("click", () => openRecordForm("weight", pet.id, null));
      return;
    }
    const asc = list.slice().reverse();
    const latest = list[0];
    const prev = list[1];
    const delta = prev ? +(latest.weight - prev.weight).toFixed(2) : null;

    const chartWrap = document.createElement("div");
    chartWrap.className = "chart-wrap";
    chartWrap.innerHTML = `
      <div class="latest">
        <span class="num">${latest.weight}</span><span class="unit">kg</span>
        ${delta !== null ? `<span class="delta" style="background:${delta > 0 ? "var(--peach-soft)" : delta < 0 ? "var(--mint-soft)" : "var(--surface-2)"};color:${delta > 0 ? "#9C5A12" : delta < 0 ? "var(--mint)" : "var(--text-muted)"}">${delta > 0 ? "+" : ""}${delta} kg</span>` : ""}
      </div>
      <canvas id="weightChart"></canvas>`;
    content.appendChild(chartWrap);
    requestAnimationFrame(() => drawWeightChart(chartWrap.querySelector("#weightChart"), asc));

    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = "Histórico";
    content.appendChild(title);

    list.forEach((rec) => {
      const div = document.createElement("div");
      div.className = "record";
      const d = parseISODate(rec.date);
      div.innerHTML = `
        <div class="record-stamp"><span class="d">${pad(d.getDate())}</span><span class="m">${MONTHS_ABBR[d.getMonth()]}</span></div>
        <div class="record-body">
          <h4>${rec.weight} kg</h4>
          <div class="sub">${fmtDate(rec.date)}</div>
          ${rec.notes ? `<div class="sub">${escapeHtml(rec.notes)}</div>` : ""}
        </div>
        <button class="record-menu-btn" aria-label="Editar">${ICONS.dots}</button>`;
      const openEdit = () => openRecordForm("weight", pet.id, rec);
      div.querySelector(".record-menu-btn").addEventListener("click", openEdit);
      div.querySelector(".record-body").addEventListener("click", openEdit);
      content.appendChild(div);
    });
  }

  function drawWeightChart(canvas, points) {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.parentElement.clientWidth - 32 || 280;
    const cssH = 140;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);
    if (points.length === 0) return;
    const weights = points.map((p) => p.weight);
    let min = Math.min.apply(null, weights), max = Math.max.apply(null, weights);
    if (min === max) { min -= 1; max += 1; }
    const padY = 16, padX = 6;
    const n = points.length;
    const stepX = n > 1 ? (cssW - padX * 2) / (n - 1) : 0;
    const xAt = (i) => padX + stepX * i;
    const yAt = (v) => padY + (1 - (v - min) / (max - min)) * (cssH - padY * 2);
    const pink = cssVar("--pink") || "#F2598A";

    const grad = ctx.createLinearGradient(0, 0, 0, cssH);
    grad.addColorStop(0, hexToRgba(pink, 0.32));
    grad.addColorStop(1, hexToRgba(pink, 0));
    ctx.beginPath();
    points.forEach((p, i) => { const x = xAt(i), y = yAt(p.weight); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.lineTo(xAt(n - 1), cssH - padY);
    ctx.lineTo(xAt(0), cssH - padY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    points.forEach((p, i) => { const x = xAt(i), y = yAt(p.weight); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.strokeStyle = pink;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    points.forEach((p, i) => {
      const x = xAt(i), y = yAt(p.weight);
      ctx.beginPath();
      ctx.arc(x, y, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = cssVar("--surface") || "#fff";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = pink;
      ctx.stroke();
    });
  }

  function renderHeatTab(content, pet) {
    const list = recordsFor(pet.id, "heat"); // desc by startDate
    if (list.length > 0) {
      const last = list[0];
      const sinceDays = daysBetween(last.startDate, todayISO());
      const banner = document.createElement("div");
      banner.className = "heat-banner";
      let intervalTxt = "";
      if (list.length >= 2) {
        const avg = Math.round(list.slice(0, Math.min(list.length, 4)).reduce((acc, r, idx, arr) => {
          if (idx === arr.length - 1) return acc;
          return acc + Math.abs(daysBetween(arr[idx + 1].startDate, r.startDate));
        }, 0) / (Math.min(list.length, 4) - 1));
        intervalTxt = ` · intervalo médio de ${avg} dias`;
      }
      banner.innerHTML = `${ICONS.heart}<div><div class="t">${sinceDays} dia${sinceDays === 1 ? "" : "s"} desde o último início</div><div class="s">Último cio em ${fmtDate(last.startDate)}${intervalTxt}</div></div>`;
      content.appendChild(banner);
    }
    if (list.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="paw-stack">${ICONS.heart.replace("<svg", '<svg style="width:42px;height:42px;stroke:var(--pink-soft);fill:none"')}</div>
          <h3>Nenhum ciclo registrado</h3>
          <p>Registre as datas de cio para acompanhar o ciclo da sua pet.</p>
          <button class="btn btn-primary" id="btn-add-rec">${ICONS.plus} Registrar cio</button>
        </div>`;
      content.querySelector("#btn-add-rec").addEventListener("click", () => openRecordForm("heat", pet.id, null));
      return;
    }
    list.forEach((rec) => {
      const div = document.createElement("div");
      div.className = "record";
      const d = parseISODate(rec.startDate);
      const dur = rec.endDate ? daysBetween(rec.startDate, rec.endDate) + 1 : null;
      div.innerHTML = `
        <div class="record-stamp"><span class="d">${pad(d.getDate())}</span><span class="m">${MONTHS_ABBR[d.getMonth()]}</span></div>
        <div class="record-body">
          <h4>Início em ${fmtDate(rec.startDate)}</h4>
          <div class="sub">${rec.endDate ? "Fim em " + fmtDate(rec.endDate) + (dur ? " · " + dur + " dias" : "") : "Em andamento"}</div>
          ${rec.notes ? `<div class="sub">${escapeHtml(rec.notes)}</div>` : ""}
        </div>
        <button class="record-menu-btn" aria-label="Editar">${ICONS.dots}</button>`;
      const openEdit = () => openRecordForm("heat", pet.id, rec);
      div.querySelector(".record-menu-btn").addEventListener("click", openEdit);
      div.querySelector(".record-body").addEventListener("click", openEdit);
      content.appendChild(div);
    });
  }

  /* ============================== MEDICAMENTOS ================================= */
  function renderMedicationTab(content, pet) {
    const meds = STATE.records.filter((r) => r.petId === pet.id && r.category === "medication").sort((a, b) => b.startDateTime.localeCompare(a.startDateTime));
    if (meds.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="paw-stack">${ICONS.medkit.replace("<svg", '<svg style="width:42px;height:42px;stroke:var(--pink-soft);fill:none"')}</div>
          <h3>Nenhum medicamento registrado</h3>
          <p>Registre remédios com horário certo: comprimidos, gotas, líquidos ou injeções, e marque cada dose conforme for aplicando.</p>
          <button class="btn btn-primary" id="btn-add-med">${ICONS.plus} Adicionar medicamento</button>
        </div>`;
      content.querySelector("#btn-add-med").addEventListener("click", () => openMedicationForm(pet.id, null));
      return;
    }
    const active = meds.filter((m) => m.doses.some((d) => !d.done));
    const done = meds.filter((m) => !m.doses.some((d) => !d.done));
    if (active.length > 0) {
      const t = document.createElement("div"); t.className = "section-title"; t.textContent = "Em andamento"; content.appendChild(t);
      active.forEach((m) => content.appendChild(renderMedicationCard(m, pet)));
    }
    if (done.length > 0) {
      const t = document.createElement("div"); t.className = "section-title"; t.textContent = "Concluídos"; content.appendChild(t);
      done.forEach((m) => content.appendChild(renderMedicationCard(m, pet)));
    }
  }

  function renderMedicationCard(med, pet) {
    const doneCount = med.doses.filter((d) => d.done).length;
    const total = med.doses.length;
    const next = med.doses.find((d) => !d.done);
    const unit = med.doseUnit || MED_FORM_UNITS[med.form] || "dose(s)";
    const pct = Math.round((doneCount / total) * 100);
    const div = document.createElement("div");
    div.className = "record";
    const startD = new Date(med.startDateTime);
    let nextHtml = "";
    if (next) {
      const overdue = new Date(next.scheduledAt) < new Date();
      nextHtml = `<hr class="record-divider"><div class="record-next" style="color:${overdue ? "var(--red)" : "var(--pink-strong)"}">${ICONS.clock} ${overdue ? "Atrasada — " : "Próxima dose: "}${fmtDateTime(next.scheduledAt)}</div>`;
    } else {
      nextHtml = `<hr class="record-divider"><div class="record-next" style="color:var(--mint)">${ICONS.check} Tratamento concluído</div>`;
    }
    div.innerHTML = `
      <div class="record-stamp"><span class="d">${pad(startD.getDate())}</span><span class="m">${MONTHS_ABBR[startD.getMonth()]}</span></div>
      <div class="record-body">
        <h4>${escapeHtml(med.name)}</h4>
        <div class="sub">${med.doseAmount} ${unit} · a cada ${med.frequencyHours}h</div>
        <div class="sub">${doneCount} de ${total} doses concluídas (${pct}%)</div>
        ${med.notes ? `<div class="sub">${escapeHtml(med.notes)}</div>` : ""}
        ${nextHtml}
      </div>
      <button class="record-menu-btn" aria-label="Abrir">${ICONS.dots}</button>`;
    const openIt = () => openMedicationChecklist(med, pet);
    div.querySelector(".record-menu-btn").addEventListener("click", openIt);
    div.querySelector(".record-body").addEventListener("click", openIt);
    return div;
  }

  function renderReminders(main) {
    const items = [];
    STATE.pets.forEach((pet) => {
      careRecordsFor(pet.id).forEach((rec) => {
        if (!rec.nextDate) return;
        const st = dueStatus(rec.nextDate);
        const cfg = categoryConfig(rec.category);
        items.push({ pet, rec, cfg, st });
      });
    });
    const medItems = [];
    STATE.pets.forEach((pet) => {
      STATE.records.filter((r) => r.petId === pet.id && r.category === "medication").forEach((med) => {
        const next = med.doses.find((d) => !d.done);
        if (!next) return;
        const overdue = new Date(next.scheduledAt) < new Date();
        medItems.push({ pet, med, next, overdue });
      });
    });
    medItems.sort((a, b) => new Date(a.next.scheduledAt) - new Date(b.next.scheduledAt));

    if (items.length === 0 && medItems.length === 0) {
      main.innerHTML = `
        <div class="empty-state">
          <div class="paw-stack">${ICONS.bell.replace("<svg", '<svg style="width:42px;height:42px;stroke:var(--pink-soft);fill:none"')}</div>
          <h3>Tudo certo por aqui!</h3>
          <p>Quando você definir a "próxima dose" de uma vacina, antipulgas, vermífugo ou medicamento, ela vai aparecer aqui.</p>
        </div>`;
      return;
    }

    if (medItems.length > 0) {
      const t = document.createElement("div"); t.className = "section-title"; t.textContent = "Medicamentos"; main.appendChild(t);
      medItems.forEach((it) => main.appendChild(renderMedReminderRow(it)));
    }

    items.sort((a, b) => daysBetween(todayISO(), a.rec.nextDate) - daysBetween(todayISO(), b.rec.nextDate));
    const overdue = items.filter((i) => i.st.status === "overdue");
    const soon = items.filter((i) => i.st.status === "soon");
    const later = items.filter((i) => i.st.status === "ok");

    function section(title, arr) {
      if (arr.length === 0) return;
      const t = document.createElement("div");
      t.className = "section-title";
      t.textContent = title;
      main.appendChild(t);
      arr.forEach((it) => main.appendChild(renderReminderRow(it)));
    }
    section("Atrasados", overdue);
    section("Próximos 7 dias", soon);
    section("Mais adiante", later);
  }

  function renderMedReminderRow(it) {
    const { pet, med, next, overdue } = it;
    const div = document.createElement("div");
    div.className = "pet-card";
    div.innerHTML = `
      ${pet.photo ? `<img class="pet-avatar" style="width:46px;height:46px" src="${pet.photo}" alt="">` : `<div class="pet-avatar placeholder" style="width:46px;height:46px">${pet.species === "cat" ? ICONS.cat : ICONS.dog}</div>`}
      <div class="pet-card-info">
        <h3 style="font-size:15px">${escapeHtml(med.name)}</h3>
        <div class="meta" style="${overdue ? "color:var(--red);font-weight:700" : ""}">${escapeHtml(pet.name)} · ${overdue ? "Atrasada — " : ""}${fmtDateTime(next.scheduledAt)}</div>
      </div>
      <button class="btn btn-sm btn-primary" id="quick-dose-btn">${ICONS.check}</button>`;
    div.querySelector(".pet-card-info").addEventListener("click", () => navigate(`#/pet/${pet.id}/medication`));
    div.querySelector("#quick-dose-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      next.done = true;
      next.doneAt = new Date().toISOString();
      await dbPut("records", med);
      await loadAll();
      toast("Dose marcada como aplicada!");
      render();
    });
    return div;
  }

  function renderReminderRow(it) {
    const { pet, rec, cfg, st } = it;
    const div = document.createElement("div");
    div.className = "pet-card";
    const color = st.status === "overdue" ? "var(--red)" : st.status === "soon" ? "var(--peach)" : "var(--mint)";
    const txt = st.status === "overdue" ? `Atrasado há ${st.days}d` : st.status === "soon" ? `Em ${st.days}d` : `Em ${st.days}d`;
    const title = cfg.getTitle ? cfg.getTitle(rec) : (rec[cfg.primaryKey] || cfg.title);
    div.innerHTML = `
      ${pet.photo ? `<img class="pet-avatar" style="width:46px;height:46px" src="${pet.photo}" alt="">` : `<div class="pet-avatar placeholder" style="width:46px;height:46px">${pet.species === "cat" ? ICONS.cat : ICONS.dog}</div>`}
      <div class="pet-card-info">
        <h3 style="font-size:15px">${escapeHtml(title)}</h3>
        <div class="meta">${escapeHtml(pet.name)} · ${cfg.title} · ${fmtDate(rec.nextDate)}</div>
      </div>
      <span class="chip" style="background:transparent;color:${color};font-weight:800">${txt}</span>`;
    div.addEventListener("click", () => navigate(`#/pet/${pet.id}/${rec.category}`));
    return div;
  }

  /* ================================ AJUSTES ==================================== */
  function renderSettings(main) {
    const themeCard = document.createElement("div");
    themeCard.className = "card";
    themeCard.style.marginBottom = "18px";
    const mode = getThemeMode();
    themeCard.innerHTML = `
      <div class="settings-row" style="padding-top:0;border-bottom:none">
        <div class="lbl"><div class="t">Aparência</div><div class="s">Escolha como o app deve ser exibido</div></div>
      </div>
      <div class="theme-toggle" style="margin-top:6px">
        <button data-mode="light" class="${mode === "light" ? "active" : ""}">${ICONS.sun}</button>
        <button data-mode="dark" class="${mode === "dark" ? "active" : ""}">${ICONS.moon}</button>
        <button data-mode="system" class="${mode === "system" ? "active" : ""}">${ICONS.monitor}</button>
      </div>`;
    themeCard.querySelectorAll("[data-mode]").forEach((b) => {
      b.addEventListener("click", () => {
        setThemeMode(b.dataset.mode);
        main.innerHTML = "";
        renderSettings(main);
      });
    });
    main.appendChild(themeCard);

    if (STATE.pets.length > 0) {
      const vetTitle = document.createElement("div");
      vetTitle.className = "section-title";
      vetTitle.textContent = "Exportar para o veterinário";
      main.appendChild(vetTitle);

      const vetCard = document.createElement("div");
      vetCard.className = "card";
      const petOptions = `<option value="all">Todos os pets</option>` + STATE.pets.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
      vetCard.innerHTML = `
        <p style="font-size:13.5px;color:var(--text-muted);line-height:1.5;margin-bottom:14px">
          Gere um resumo em PDF com vacinas, antipulgas, vermífugos, peso e medicamentos — pronto para mostrar ou enviar ao médico-veterinário.
        </p>
        <div class="field" style="margin-bottom:12px"><select id="vet-pet-select">${petOptions}</select></div>
        <button class="btn btn-primary btn-block" id="btn-vet-export">${ICONS.vet} Gerar relatório</button>`;
      main.appendChild(vetCard);
      vetCard.querySelector("#btn-vet-export").addEventListener("click", () => {
        generateVetReport(vetCard.querySelector("#vet-pet-select").value);
      });
    }

    const backupTitle = document.createElement("div");
    backupTitle.className = "section-title";
    backupTitle.textContent = "Backup dos dados";
    main.appendChild(backupTitle);

    const backupCard = document.createElement("div");
    backupCard.className = "card";
    backupCard.innerHTML = `
      <p style="font-size:13.5px;color:var(--text-muted);line-height:1.5;margin-bottom:14px">
        Seus dados ficam salvos apenas neste navegador/dispositivo. Exporte um backup periodicamente para não perder nada — e poder restaurar em outro aparelho.
      </p>
      <button class="btn btn-primary btn-block" id="btn-export" style="margin-bottom:10px">${ICONS.download} Exportar backup (.json)</button>
      <button class="btn btn-secondary btn-block" id="btn-import">${ICONS.upload} Importar backup</button>
      <input type="file" id="import-file" accept="application/json" class="visually-hidden">`;
    main.appendChild(backupCard);
    backupCard.querySelector("#btn-export").addEventListener("click", exportBackup);
    backupCard.querySelector("#btn-import").addEventListener("click", () => backupCard.querySelector("#import-file").click());
    backupCard.querySelector("#import-file").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importBackup(file);
      e.target.value = "";
    });

    const dangerTitle = document.createElement("div");
    dangerTitle.className = "section-title";
    dangerTitle.textContent = "Zona de risco";
    main.appendChild(dangerTitle);
    const dangerCard = document.createElement("div");
    dangerCard.className = "card";
    dangerCard.innerHTML = `<button class="btn btn-danger btn-block" id="btn-wipe">${ICONS.trash} Excluir todos os dados</button>`;
    main.appendChild(dangerCard);
    dangerCard.querySelector("#btn-wipe").addEventListener("click", async () => {
      const ok = await confirmDialog({ title: "Excluir tudo?", message: "Isso vai remover todos os pets e registros deste dispositivo. Essa ação não pode ser desfeita.", confirmLabel: "Excluir tudo", danger: true });
      if (!ok) return;
      await dbClear("pets"); await dbClear("records");
      await loadAll();
      toast("Todos os dados foram excluídos");
      navigate("#/");
    });

    const about = document.createElement("div");
    about.style.textAlign = "center";
    about.style.padding = "26px 10px";
    about.style.color = "var(--text-faint)";
    about.style.fontSize = "12.5px";
    about.innerHTML = `PataCare v1.0 🐾<br>Feito com carinho para cuidar de quem cuida da gente.`;
    main.appendChild(about);
  }

  function generateVetReport(selection) {
    const pets = selection === "all" ? petsSorted() : [getPet(selection)].filter(Boolean);
    if (pets.length === 0) { toast("Selecione um pet"); return; }

    const petsHtml = pets.map((pet) => buildVetReportSection(pet)).join('<div style="page-break-before:always"></div>');
    const generatedAt = new Date().toLocaleString("pt-BR");

    const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório PataCare</title>
<style>
  body{ font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color:#2b2b2b; max-width:780px; margin:0 auto; padding:28px 24px 60px; }
  h1{ font-size:22px; margin:0 0 2px; color:#C23A6B; }
  .gen{ font-size:11.5px; color:#888; margin-bottom:22px; }
  .pet-block h2{ font-size:18px; border-bottom:2px solid #F2598A; padding-bottom:6px; margin-top:0; }
  .pet-meta{ font-size:13px; color:#555; margin-bottom:16px; }
  h3{ font-size:14px; color:#C23A6B; margin:20px 0 6px; }
  table{ width:100%; border-collapse: collapse; font-size:12.5px; margin-bottom:6px; }
  th{ text-align:left; background:#FFEFF3; padding:6px 8px; font-weight:700; color:#3A2236; border-bottom:1px solid #eee; }
  td{ padding:6px 8px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
  .empty{ font-size:12.5px; color:#999; font-style:italic; padding:4px 8px 14px; }
  .footer{ margin-top:36px; font-size:11px; color:#999; border-top:1px solid #eee; padding-top:12px; line-height:1.5; }
  .print-bar{ position:sticky; top:0; background:#fff; padding:10px 0 16px; text-align:right; }
  .print-bar button{ background:#F2598A; color:#fff; border:none; padding:10px 18px; border-radius:20px; font-weight:700; font-size:13px; cursor:pointer; }
  @media print{ .print-bar{ display:none; } body{ padding:0 6px; } }
</style></head>
<body>
  <div class="print-bar"><button onclick="window.print()">Imprimir / Salvar PDF</button></div>
  <h1>🐾 Relatório PataCare</h1>
  <div class="gen">Gerado em ${generatedAt}</div>
  ${petsHtml}
  <div class="footer">Este relatório foi gerado automaticamente a partir dos registros inseridos pelo tutor no app PataCare. As previsões de próximas doses seguem protocolos veterinários gerais usados no Brasil e não substituem a avaliação de um médico-veterinário.</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) { toast("Permita pop-ups para gerar o relatório"); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  function buildVetReportSection(pet) {
    const vac = recordsFor(pet.id, "vaccine");
    const anti = recordsFor(pet.id, "antiparasitic");
    const derm = recordsFor(pet.id, "dewormer");
    const weights = recordsFor(pet.id, "weight");
    const heat = pet.sex === "F" ? recordsFor(pet.id, "heat") : [];
    const meds = STATE.records.filter((r) => r.petId === pet.id && r.category === "medication");

    function table(headers, rows) {
      if (rows.length === 0) return `<div class="empty">Nenhum registro.</div>`;
      return `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    }

    const vacRows = vac.map((r) => [
      escapeHtml(r.vaccineType && r.vaccineType !== "outra" ? vaccineTypeLabel(r.vaccineType) : (r.name || "Vacina")),
      fmtDate(r.date),
      escapeHtml(r.doseNumber ? (r.isBooster ? "Reforço anual" : `Dose ${r.doseNumber}`) : "—"),
      r.nextDate ? fmtDate(r.nextDate) : "—"
    ]);
    const antiRows = anti.map((r) => [escapeHtml(r.product), fmtDate(r.date), r.nextDate ? fmtDate(r.nextDate) : "—"]);
    const dermRows = derm.map((r) => [escapeHtml(r.product), fmtDate(r.date), r.nextDate ? fmtDate(r.nextDate) : "—"]);
    const weightRows = weights.slice(0, 12).map((r) => [fmtDate(r.date), r.weight + " kg", escapeHtml(r.notes || "")]);
    const heatRows = heat.map((r) => [fmtDate(r.startDate), r.endDate ? fmtDate(r.endDate) : "Em andamento"]);
    const medRows = meds.map((m) => {
      const done = m.doses.filter((d) => d.done).length;
      return [escapeHtml(m.name), `${m.doseAmount} ${escapeHtml(m.doseUnit || "")} a cada ${m.frequencyHours}h`, `${done}/${m.doses.length} doses`];
    });

    return `
      <div class="pet-block">
        <h2>${escapeHtml(pet.name)}</h2>
        <div class="pet-meta">${pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Outro"} · ${escapeHtml(pet.breed || "Raça não informada")} · ${pet.sex === "F" ? "Fêmea" : "Macho"}${pet.birthDate ? " · Nascimento: " + fmtDate(pet.birthDate) + " (" + calcAge(pet.birthDate) + ")" : ""}${pet.microchip ? " · Microchip: " + escapeHtml(pet.microchip) : ""}</div>

        <h3>Vacinas</h3>
        ${table(["Vacina", "Data", "Dose", "Próxima"], vacRows)}

        <h3>Antipulgas / Carrapatos</h3>
        ${table(["Produto", "Data", "Próxima aplicação"], antiRows)}

        <h3>Vermífugos</h3>
        ${table(["Produto", "Data", "Próxima aplicação"], dermRows)}

        <h3>Peso (últimos registros)</h3>
        ${table(["Data", "Peso", "Observações"], weightRows)}

        ${pet.sex === "F" ? `<h3>Cio</h3>${table(["Início", "Fim"], heatRows)}` : ""}

        <h3>Medicamentos</h3>
        ${table(["Medicamento", "Posologia", "Progresso"], medRows)}
      </div>`;
  }

  function exportBackup() {
    loadAll().then(() => {
      const data = { app: "patacare", version: 1, exportedAt: new Date().toISOString(), pets: STATE.pets, records: STATE.records };
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

  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.pets) || !Array.isArray(data.records)) throw new Error("formato inválido");
        const ok = await confirmDialog({ title: "Importar backup?", message: "Isso vai substituir todos os dados atuais deste dispositivo pelos dados do arquivo selecionado.", confirmLabel: "Importar e substituir", danger: true });
        if (!ok) return;
        await dbClear("pets"); await dbClear("records");
        for (const p of data.pets) await dbPut("pets", p);
        for (const r of data.records) await dbPut("records", r);
        await loadAll();
        toast("Backup importado com sucesso!");
        navigate("#/");
      } catch (err) {
        toast("Não foi possível ler esse arquivo de backup");
      }
    };
    reader.readAsText(file);
  }

  /* ============================ FORMULÁRIO: PET ================================= */
  function openPetForm(existing) {
    const isEdit = !!existing;
    let photoData = existing ? existing.photo : null;
    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${isEdit ? "Editar pet" : "Novo pet"}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <div class="field">
        <label>Foto</label>
        <div class="photo-upload" id="photo-trigger">
          <div class="ph-icon" id="ph-icon-wrap">${ICONS.camera}</div>
          <span class="txt">Toque para escolher uma foto</span>
        </div>
        <input type="file" accept="image/*" class="visually-hidden" id="photo-input">
      </div>
      <div class="field">
        <label>Nome</label>
        <input type="text" id="f-name" placeholder="Ex: Mel, Thor, Luna..." value="${existing ? escapeHtml(existing.name) : ""}">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Espécie</label>
          <div class="seg" id="seg-species">
            <button data-v="dog" type="button">Cão</button>
            <button data-v="cat" type="button">Gato</button>
            <button data-v="other" type="button">Outro</button>
          </div>
        </div>
        <div class="field">
          <label>Sexo</label>
          <div class="seg" id="seg-sex">
            <button data-v="M" type="button">Macho</button>
            <button data-v="F" type="button">Fêmea</button>
          </div>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Raça</label>
          <input type="text" id="f-breed" placeholder="Ex: SRD, Poodle..." value="${existing ? escapeHtml(existing.breed || "") : ""}">
        </div>
        <div class="field">
          <label>Nascimento</label>
          <input type="date" id="f-birth" value="${existing ? existing.birthDate || "" : ""}">
        </div>
      </div>
      <div class="field">
        <label>Microchip (opcional)</label>
        <input type="text" id="f-microchip" inputmode="numeric" placeholder="Nº do microchip para rastreio (15 dígitos)" value="${existing ? escapeHtml(existing.microchip || "") : ""}">
      </div>
      <div class="field">
        <label>Observações</label>
        <textarea id="f-notes" placeholder="Alergias, particularidades...">${existing ? escapeHtml(existing.notes || "") : ""}</textarea>
      </div>
      <button class="btn btn-primary btn-block" id="f-save">${ICONS.check} Salvar</button>
      ${isEdit ? `<button class="btn btn-danger btn-block" id="f-delete" style="margin-top:10px">${ICONS.trash} Excluir pet</button>` : ""}
    `);

    function setSeg(containerId, value) {
      sheet.querySelectorAll(`#${containerId} button`).forEach((b) => b.classList.toggle("active", b.dataset.v === value));
    }
    setSeg("seg-species", existing ? existing.species : "dog");
    setSeg("seg-sex", existing ? existing.sex : "M");
    sheet.querySelectorAll("#seg-species button").forEach((b) => b.addEventListener("click", () => setSeg("seg-species", b.dataset.v)));
    sheet.querySelectorAll("#seg-sex button").forEach((b) => b.addEventListener("click", () => setSeg("seg-sex", b.dataset.v)));

    function refreshPhotoPreview() {
      const wrap = sheet.querySelector("#ph-icon-wrap");
      const txt = sheet.querySelector(".photo-upload .txt");
      if (photoData) {
        wrap.outerHTML = `<img src="${photoData}" alt="Pré-visualização">`;
        txt.textContent = "Toque para alterar a foto";
      }
    }
    refreshPhotoPreview();
    sheet.querySelector("#photo-trigger").addEventListener("click", () => sheet.querySelector("#photo-input").click());
    sheet.querySelector("#photo-input").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      photoData = await resizeImageFile(file, 600, 0.75);
      refreshPhotoPreview();
    });

    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelector("#f-save").addEventListener("click", async () => {
      const name = sheet.querySelector("#f-name").value.trim();
      if (!name) { toast("Dá um nome pro seu pet 🐾"); return; }
      const species = sheet.querySelector("#seg-species .active").dataset.v;
      const sex = sheet.querySelector("#seg-sex .active").dataset.v;
      const breed = sheet.querySelector("#f-breed").value.trim();
      const birthDate = sheet.querySelector("#f-birth").value;
      const microchip = sheet.querySelector("#f-microchip").value.trim();
      const notes = sheet.querySelector("#f-notes").value.trim();
      const pet = existing ? Object.assign({}, existing) : { id: uid(), createdAt: Date.now() };
      Object.assign(pet, { name, species, sex, breed, birthDate, microchip, notes, photo: photoData });
      await dbPut("pets", pet);
      await loadAll();
      closeSheet();
      toast(isEdit ? "Pet atualizado!" : "Pet adicionado!");
      navigate(`#/pet/${pet.id}/overview`);
    });

    if (isEdit) {
      sheet.querySelector("#f-delete").addEventListener("click", async () => {
        const ok = await confirmDialog({ title: `Excluir ${existing.name}?`, message: "Todos os registros desse pet (vacinas, pesos, etc.) também serão excluídos. Essa ação não pode ser desfeita.", confirmLabel: "Excluir", danger: true });
        if (!ok) return;
        await dbDelete("pets", existing.id);
        const toRemove = STATE.records.filter((r) => r.petId === existing.id);
        for (const r of toRemove) await dbDelete("records", r.id);
        await loadAll();
        closeSheet();
        toast("Pet excluído");
        navigate("#/");
      });
    }
  }

  /* ========================== FORMULÁRIO: REGISTROS =============================== */
  const RECORD_FORMS = {
    antiparasitic: { title: "antipulgas/carrapatos", fields: [
      { key: "product", label: "Produto aplicado", type: "text", required: true, placeholder: "Ex: Bravecto, Simparic, NexGard..." },
      { key: "date", label: "Data aplicada", type: "date", required: true },
      { key: "nextDate", label: "Próxima aplicação (opcional)", type: "date" },
      { key: "notes", label: "Observações", type: "textarea" }
    ]},
    dewormer: { title: "vermífugo", fields: [
      { key: "product", label: "Vermífugo aplicado", type: "text", required: true, placeholder: "Ex: Drontal, Vermivet..." },
      { key: "date", label: "Data aplicada", type: "date", required: true },
      { key: "nextDate", label: "Próxima aplicação (opcional)", type: "date" },
      { key: "notes", label: "Observações", type: "textarea" }
    ]},
    weight: { title: "peso", fields: [
      { key: "date", label: "Data", type: "date", required: true },
      { key: "weight", label: "Peso (kg)", type: "number", step: "0.1", required: true, placeholder: "Ex: 8.4" },
      { key: "notes", label: "Observações", type: "textarea" }
    ]},
    heat: { title: "cio", fields: [
      { key: "startDate", label: "Início do cio", type: "date", required: true },
      { key: "endDate", label: "Fim do cio (opcional)", type: "date" },
      { key: "notes", label: "Observações", type: "textarea" }
    ]}
  };

  function fieldHtml(f, value) {
    const v = value == null ? "" : value;
    if (f.type === "textarea") {
      return `<div class="field"><label>${f.label}</label><textarea id="rf-${f.key}" placeholder="${f.placeholder || ""}">${escapeHtml(v)}</textarea></div>`;
    }
    if (f.type === "photo") {
      return `<div class="field">
        <label>${f.label}</label>
        <div class="photo-upload" id="rf-photo-trigger">
          <div class="ph-icon" id="rf-photo-wrap">${ICONS.camera}</div>
          <span class="txt">Toque para adicionar uma foto</span>
        </div>
        <input type="file" accept="image/*" class="visually-hidden" id="rf-photo-input">
      </div>`;
    }
    const step = f.step ? `step="${f.step}"` : "";
    return `<div class="field"><label>${f.label}${f.required ? "" : ""}</label><input type="${f.type}" id="rf-${f.key}" ${step} placeholder="${f.placeholder || ""}" value="${escapeHtml(v)}"></div>`;
  }

  function openVaccineForm(petId, existing) {
    const isEdit = !!existing;
    let photoData = existing ? existing.photo : null;
    let nextDateDirty = false; // true depois que o usuário edita a próxima dose manualmente
    const today = todayISO();
    const pet = getPet(petId);
    const typeOptions = Object.keys(VACCINE_PROTOCOLS).filter((k) => {
      const p = VACCINE_PROTOCOLS[k];
      return k === "outra" || p.species === "any" || p.species === pet.species || pet.species === "other";
    });
    const initialType = existing ? (existing.vaccineType || "outra") : typeOptions[0];

    const optionsHtml = typeOptions.map((k) => `<option value="${k}" ${k === initialType ? "selected" : ""}>${escapeHtml(VACCINE_PROTOCOLS[k].label)}</option>`).join("");

    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${isEdit ? "Editar vacina" : "Nova vacina"}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <div class="field">
        <label>Tipo de vacina</label>
        <select id="vf-type">${optionsHtml}</select>
      </div>
      <div class="field" id="vf-name-field" style="display:none">
        <label>Nome da vacina</label>
        <input type="text" id="vf-name" placeholder="Ex: Leptospirose extra, Polivalente felina..." value="${existing ? escapeHtml(existing.name || "") : ""}">
      </div>
      <div class="field">
        <label>Data aplicada</label>
        <input type="date" id="vf-date" value="${existing ? existing.date : today}">
      </div>
      <div class="field">
        <label>Foto da etiqueta</label>
        <div class="photo-upload" id="vf-photo-trigger">
          <div class="ph-icon" id="vf-photo-wrap">${ICONS.camera}</div>
          <span class="txt">Toque para adicionar uma foto</span>
        </div>
        <input type="file" accept="image/*" class="visually-hidden" id="vf-photo-input">
      </div>
      <div class="field">
        <label>Próxima dose</label>
        <input type="date" id="vf-next">
        <div id="vf-hint" style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.4"></div>
      </div>
      <div class="field">
        <label>Observações</label>
        <textarea id="vf-notes" placeholder="Lote, clínica, reações...">${existing ? escapeHtml(existing.notes || "") : ""}</textarea>
      </div>
      <button class="btn btn-primary btn-block" id="vf-save">${ICONS.check} Salvar</button>
      ${isEdit ? `<button class="btn btn-danger btn-block" id="vf-delete" style="margin-top:10px">${ICONS.trash} Excluir registro</button>` : ""}
    `);

    function toggleNameField() {
      const type = sheet.querySelector("#vf-type").value;
      sheet.querySelector("#vf-name-field").style.display = type === "outra" ? "" : "none";
    }
    function recalcNext() {
      const type = sheet.querySelector("#vf-type").value;
      const date = sheet.querySelector("#vf-date").value;
      const hint = sheet.querySelector("#vf-hint");
      const nextInput = sheet.querySelector("#vf-next");
      if (type === "outra" || !date) {
        hint.textContent = "Defina a próxima dose manualmente, se quiser.";
        return;
      }
      const sched = computeVaccineSchedule(petId, type, date, existing ? existing.id : null);
      if (!nextDateDirty) nextInput.value = sched.nextDate || "";
      const protocol = sched.protocol;
      if (sched.isBooster) {
        hint.textContent = `Reforço anual — calculado automaticamente conforme protocolo veterinário usual no Brasil. Confirme com seu médico-veterinário.`;
      } else if (protocol.initialDoses === 1) {
        hint.textContent = `Dose única — o reforço anual já foi calculado automaticamente. Confirme com seu médico-veterinário.`;
      } else {
        hint.textContent = `Dose ${sched.doseNumber} de ${protocol.initialDoses} do esquema inicial — calculado automaticamente (intervalo de ${protocol.intervalDays} dias). Confirme com seu médico-veterinário.`;
      }
    }
    sheet.querySelector("#vf-type").addEventListener("change", () => { toggleNameField(); nextDateDirty = false; recalcNext(); });
    sheet.querySelector("#vf-date").addEventListener("change", recalcNext);
    sheet.querySelector("#vf-next").addEventListener("input", () => { nextDateDirty = true; });
    toggleNameField();
    if (isEdit && existing.nextDate) { sheet.querySelector("#vf-next").value = existing.nextDate; nextDateDirty = true; }
    recalcNext();

    function refreshPhotoPreview() {
      const wrap = sheet.querySelector("#vf-photo-wrap");
      if (photoData && wrap) {
        wrap.outerHTML = `<img src="${photoData}" alt="Pré-visualização">`;
        sheet.querySelector("#vf-photo-trigger .txt").textContent = "Toque para alterar a foto";
      }
    }
    refreshPhotoPreview();
    sheet.querySelector("#vf-photo-trigger").addEventListener("click", () => sheet.querySelector("#vf-photo-input").click());
    sheet.querySelector("#vf-photo-input").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      photoData = await resizeImageFile(file, 800, 0.72);
      refreshPhotoPreview();
    });

    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelector("#vf-save").addEventListener("click", async () => {
      const type = sheet.querySelector("#vf-type").value;
      const date = sheet.querySelector("#vf-date").value;
      const name = sheet.querySelector("#vf-name").value.trim();
      const nextDate = sheet.querySelector("#vf-next").value;
      const notes = sheet.querySelector("#vf-notes").value.trim();
      if (!date) { toast("Informe a data aplicada"); return; }
      if (type === "outra" && !name) { toast("Dê um nome para essa vacina"); return; }

      const rec = existing ? Object.assign({}, existing) : { id: uid(), petId, category: "vaccine", createdAt: Date.now() };
      const sched = type !== "outra" ? computeVaccineSchedule(petId, type, date, existing ? existing.id : null) : { doseNumber: null, isBooster: false };
      Object.assign(rec, { vaccineType: type, name: type === "outra" ? name : "", date, nextDate: nextDate || null, photo: photoData, notes, doseNumber: sched.doseNumber, isBooster: sched.isBooster });
      await dbPut("records", rec);
      await loadAll();
      closeSheet();
      toast(isEdit ? "Vacina atualizada!" : "Vacina registrada!");
      render();
    });

    if (isEdit) {
      sheet.querySelector("#vf-delete").addEventListener("click", async () => {
        const ok = await confirmDialog({ title: "Excluir registro?", message: "Essa ação não pode ser desfeita.", confirmLabel: "Excluir", danger: true });
        if (!ok) return;
        await dbDelete("records", existing.id);
        await loadAll();
        closeSheet();
        toast("Registro excluído");
        render();
      });
    }
  }

  function openRecordForm(category, petId, existing) {
    const cfg = RECORD_FORMS[category];
    const isEdit = !!existing;
    let photoData = existing ? existing.photo : null;
    const today = todayISO();
    const defaults = { date: today, startDate: today };

    const fieldsHtml = cfg.fields.map((f) => fieldHtml(f, existing ? existing[f.key] : defaults[f.key])).join("");
    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${isEdit ? "Editar " : "Nova "}${cfg.title}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      ${fieldsHtml}
      <button class="btn btn-primary btn-block" id="rf-save">${ICONS.check} Salvar</button>
      ${isEdit ? `<button class="btn btn-danger btn-block" id="rf-delete" style="margin-top:10px">${ICONS.trash} Excluir registro</button>` : ""}
    `);

    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);

    const hasPhoto = cfg.fields.some((f) => f.type === "photo");
    if (hasPhoto) {
      function refreshPhotoPreview() {
        const wrap = sheet.querySelector("#rf-photo-wrap");
        if (photoData && wrap) {
          wrap.outerHTML = `<img src="${photoData}" alt="Pré-visualização">`;
          sheet.querySelector("#rf-photo-trigger .txt").textContent = "Toque para alterar a foto";
        }
      }
      refreshPhotoPreview();
      sheet.querySelector("#rf-photo-trigger").addEventListener("click", () => sheet.querySelector("#rf-photo-input").click());
      sheet.querySelector("#rf-photo-input").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        photoData = await resizeImageFile(file, 800, 0.72);
        refreshPhotoPreview();
      });
    }

    sheet.querySelector("#rf-save").addEventListener("click", async () => {
      const values = {};
      let valid = true;
      for (const f of cfg.fields) {
        if (f.type === "photo") continue;
        const el = sheet.querySelector(`#rf-${f.key}`);
        let v = el.value;
        if (f.type === "number") v = v === "" ? null : parseFloat(v);
        if (f.type === "text" || f.type === "textarea") v = v.trim();
        if (f.required && (v === "" || v === null || v === undefined)) {
          toast(`Preencha: ${f.label}`);
          el.focus();
          valid = false;
          break;
        }
        values[f.key] = v;
      }
      if (!valid) return;
      const rec = existing ? Object.assign({}, existing) : { id: uid(), petId, category, createdAt: Date.now() };
      Object.assign(rec, values);
      if (hasPhoto) rec.photo = photoData;
      await dbPut("records", rec);
      await loadAll();
      closeSheet();
      toast(isEdit ? "Registro atualizado!" : "Registro salvo!");
      render();
    });

    if (isEdit) {
      sheet.querySelector("#rf-delete").addEventListener("click", async () => {
        const ok = await confirmDialog({ title: "Excluir registro?", message: "Essa ação não pode ser desfeita.", confirmLabel: "Excluir", danger: true });
        if (!ok) return;
        await dbDelete("records", existing.id);
        await loadAll();
        closeSheet();
        toast("Registro excluído");
        render();
      });
    }
  }

  /* ========================== FORMULÁRIO: MEDICAMENTO =============================== */
  function openMedicationForm(petId, existing) {
    const isEdit = !!existing;
    const now = new Date();
    const defaultDate = todayISO();
    const defaultTime = pad(now.getHours()) + ":" + pad(now.getMinutes());
    const startVal = existing ? existing.startDateTime.slice(0, 16) : (defaultDate + "T" + defaultTime);

    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${isEdit ? "Editar medicamento" : "Novo medicamento"}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <div class="field">
        <label>Nome do medicamento</label>
        <input type="text" id="mf-name" placeholder="Ex: Amoxicilina, Meloxicam..." value="${existing ? escapeHtml(existing.name) : ""}">
      </div>
      <div class="field">
        <label>Forma</label>
        <div class="seg" id="mf-form">
          <button data-v="comprimido" type="button">Comprimido</button>
          <button data-v="gota" type="button">Gota</button>
          <button data-v="liquido" type="button">Líquido</button>
          <button data-v="injecao" type="button">Injeção</button>
          <button data-v="outro" type="button">Outro</button>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Quantidade por dose</label>
          <input type="number" id="mf-amount" step="0.5" placeholder="Ex: 1" value="${existing ? existing.doseAmount : "1"}">
        </div>
        <div class="field">
          <label>De quantas em quantas horas</label>
          <input type="number" id="mf-freq" step="1" placeholder="Ex: 8" value="${existing ? existing.frequencyHours : "8"}">
        </div>
      </div>
      <div class="field">
        <label>Início (data e hora da 1ª dose)</label>
        <input type="datetime-local" id="mf-start" value="${startVal}">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Duração (dias)</label>
          <input type="number" id="mf-duration" step="1" placeholder="Ex: 7" value="${existing ? existing.durationDays : "7"}">
        </div>
        <div class="field">
          <label>Total de doses</label>
          <input type="number" id="mf-total" step="1" value="${existing ? existing.totalDoses : ""}">
        </div>
      </div>
      <div class="field">
        <label>Observações</label>
        <textarea id="mf-notes" placeholder="Motivo, orientação do veterinário...">${existing ? escapeHtml(existing.notes || "") : ""}</textarea>
      </div>
      <button class="btn btn-primary btn-block" id="mf-save">${ICONS.check} Salvar</button>
      ${isEdit ? `<button class="btn btn-danger btn-block" id="mf-delete" style="margin-top:10px">${ICONS.trash} Excluir medicamento</button>` : ""}
    `);

    function setSeg(value) {
      sheet.querySelectorAll("#mf-form button").forEach((b) => b.classList.toggle("active", b.dataset.v === value));
    }
    setSeg(existing ? existing.form : "comprimido");
    sheet.querySelectorAll("#mf-form button").forEach((b) => b.addEventListener("click", () => setSeg(b.dataset.v)));

    let totalDosesDirty = isEdit;
    function recalcTotal() {
      if (totalDosesDirty) return;
      const freq = parseFloat(sheet.querySelector("#mf-freq").value);
      const duration = parseFloat(sheet.querySelector("#mf-duration").value);
      if (freq > 0 && duration > 0) {
        sheet.querySelector("#mf-total").value = Math.max(1, Math.round((duration * 24) / freq));
      }
    }
    sheet.querySelector("#mf-freq").addEventListener("input", recalcTotal);
    sheet.querySelector("#mf-duration").addEventListener("input", recalcTotal);
    sheet.querySelector("#mf-total").addEventListener("input", () => { totalDosesDirty = true; });
    if (!isEdit) recalcTotal();

    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelector("#mf-save").addEventListener("click", async () => {
      const name = sheet.querySelector("#mf-name").value.trim();
      const form = sheet.querySelector("#mf-form .active").dataset.v;
      const doseAmount = parseFloat(sheet.querySelector("#mf-amount").value);
      const frequencyHours = parseFloat(sheet.querySelector("#mf-freq").value);
      const startDateTimeLocal = sheet.querySelector("#mf-start").value;
      const durationDays = parseFloat(sheet.querySelector("#mf-duration").value) || null;
      const totalDoses = parseInt(sheet.querySelector("#mf-total").value, 10);
      const notes = sheet.querySelector("#mf-notes").value.trim();

      if (!name) { toast("Dê um nome para o medicamento"); return; }
      if (!doseAmount || doseAmount <= 0) { toast("Informe a quantidade por dose"); return; }
      if (!frequencyHours || frequencyHours <= 0) { toast("Informe de quantas em quantas horas"); return; }
      if (!startDateTimeLocal) { toast("Informe a data e hora de início"); return; }
      if (!totalDoses || totalDoses <= 0) { toast("Informe o total de doses"); return; }

      const startDateTime = new Date(startDateTimeLocal).toISOString();
      let doses;
      if (isEdit) {
        // preserva doses já marcadas como feitas; recalcula apenas as pendentes se algo mudou
        const doneOnes = existing.doses.filter((d) => d.done);
        if (doneOnes.length >= totalDoses) {
          doses = doneOnes.slice(0, totalDoses);
        } else {
          const newSchedule = buildMedicationDoses(startDateTime, frequencyHours, totalDoses);
          doses = doneOnes.concat(newSchedule.slice(doneOnes.length));
        }
      } else {
        doses = buildMedicationDoses(startDateTime, frequencyHours, totalDoses);
      }

      const rec = existing ? Object.assign({}, existing) : { id: uid(), petId, category: "medication", createdAt: Date.now() };
      Object.assign(rec, { name, form, doseAmount, doseUnit: MED_FORM_UNITS[form], frequencyHours, startDateTime, durationDays, totalDoses, doses, notes });
      await dbPut("records", rec);
      await loadAll();
      closeSheet();
      toast(isEdit ? "Medicamento atualizado!" : "Medicamento adicionado!");
      render();
    });

    if (isEdit) {
      sheet.querySelector("#mf-delete").addEventListener("click", async () => {
        const ok = await confirmDialog({ title: "Excluir medicamento?", message: "Todo o histórico de doses desse medicamento será excluído.", confirmLabel: "Excluir", danger: true });
        if (!ok) return;
        await dbDelete("records", existing.id);
        await loadAll();
        closeSheet();
        toast("Medicamento excluído");
        render();
      });
    }
  }

  function openMedicationChecklist(med, pet) {
    const doneCount = med.doses.filter((d) => d.done).length;
    const rowsHtml = med.doses.map((d, i) => {
      const overdue = !d.done && new Date(d.scheduledAt) < new Date();
      return `
        <div class="settings-row med-dose-row" data-i="${i}" style="cursor:pointer">
          <div class="ic" style="background:${d.done ? "var(--mint-soft)" : overdue ? "var(--red-soft)" : "var(--surface-2)"}">
            ${d.done ? `<span style="color:var(--mint);display:flex">${ICONS.check}</span>` : `<span style="color:${overdue ? "var(--red)" : "var(--pink-strong)"};display:flex">${ICONS.clock}</span>`}
          </div>
          <div class="lbl">
            <div class="t">Dose ${i + 1} de ${med.doses.length}</div>
            <div class="s" style="${overdue ? "color:var(--red);font-weight:700" : ""}">${d.done ? "Aplicada em " + fmtDateTime(d.doneAt) : (overdue ? "Atrasada — prevista " : "Prevista para ") + fmtDateTime(d.scheduledAt)}</div>
          </div>
        </div>`;
    }).join("");

    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${escapeHtml(med.name)}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">${med.doseAmount} ${med.doseUnit} · a cada ${med.frequencyHours}h · ${doneCount} de ${med.doses.length} doses concluídas</p>
      <div class="card" style="padding:6px 12px;margin-bottom:16px">${rowsHtml}</div>
      <button class="btn btn-secondary btn-block" id="mc-edit">${ICONS.edit} Editar medicamento</button>
    `);
    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelectorAll(".med-dose-row").forEach((row) => {
      row.addEventListener("click", async () => {
        const i = parseInt(row.dataset.i, 10);
        const dose = med.doses[i];
        dose.done = !dose.done;
        dose.doneAt = dose.done ? new Date().toISOString() : null;
        await dbPut("records", med);
        await loadAll();
        closeSheet();
        toast(dose.done ? "Dose marcada como aplicada!" : "Dose desmarcada");
        render();
        const refreshedMed = STATE.records.find((r) => r.id === med.id);
        if (refreshedMed) openMedicationChecklist(refreshedMed, pet);
      });
    });
    sheet.querySelector("#mc-edit").addEventListener("click", () => openMedicationForm(pet.id, med));
  }

  /* ================================== INIT ===================================== */
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {});
      });
    }
  }

  function init() {
    loadAll().then(() => {
      render();
      registerServiceWorker();
    }).catch((err) => {
      document.getElementById("app").innerHTML = `<div class="empty-state"><h3>Não foi possível carregar</h3><p>${escapeHtml(err.message || "Erro desconhecido")}</p></div>`;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
