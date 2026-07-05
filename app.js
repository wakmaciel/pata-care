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
    dots: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5.5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18.5" r="1.6"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4.5" width="14" height="17" rx="2"/><rect x="9" y="3" width="6" height="3.2" rx="1"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5"/></svg>',
    stethoscope: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a4 4 0 0 0 8 0V4"/><path d="M6 4H4.5M14 4h1.5"/><path d="M18 12v2.5a5.5 5.5 0 0 1-11 0V13"/><circle cx="19.3" cy="11" r="1.7"/></svg>',
    paperclip: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12.5l6.5-6.5a3 3 0 0 1 4.2 4.2L11.5 17.4a5 5 0 1 1-7-7L12 3"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z"/><path d="M14 3.5V8h4"/></svg>',
    scissors: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6.3" r="2.3"/><circle cx="6" cy="17.7" r="2.3"/><path d="M7.8 7.8 19 17M7.8 16.2 19 7"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.7" y="7.5" width="18.6" height="9" rx="1.6" transform="rotate(-45 12 12)"/><path d="M8.5 8.5 10 10M11 5.5 13 7.5M14.5 9 16 10.5M6 11l1.5 1.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.2" r="3.7"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.2 18h5.6M10.2 21h3.6"/><path d="M12 3a6 6 0 0 1 3.6 10.8c-.8.6-1.2 1.4-1.3 2.2h-4.6c-.1-.8-.5-1.6-1.3-2.2A6 6 0 0 1 12 3Z"/></svg>'
  };
/* ── INTEGRAÇÃO CALENDÁRIO PETS ─────────────────────────────────────────── */
  // Nome exato do seu calendário no iPhone (sem emoji se não tiver)
  const PETS_CALENDAR_NAME = "Pets";

  const ALERT_OPTIONS = [
    { label: "No momento", minutes: 0 },
    { label: "1 hora antes", minutes: 60 },
    { label: "1 dia antes", minutes: 1440 },
    { label: "2 dias antes", minutes: 2880 },
  ];

  function agendarNoCalendario(petName, title, dateISO, notes, alertMinutes) {
    if (alertMinutes === undefined) alertMinutes = 1440;

    // Monta URL webcal compatível com iOS (abre diretamente no app Calendário)
    const startStr = dateISO.replace(/-/g, "") + "T090000";
    const endStr   = dateISO.replace(/-/g, "") + "T093000";
    const summary  = encodeURIComponent(title + " — " + petName);
    const desc     = encodeURIComponent(notes || (title + " para " + petName));
    const cal      = encodeURIComponent(PETS_CALENDAR_NAME);

    // Tenta via postMessage para o Claude (quando rodando dentro do Claude.ai)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "CLAUDE_CALENDAR_CREATE",
        payload: {
          calendarName: PETS_CALENDAR_NAME,
          title: title + " — " + petName,
          startTime: dateISO + "T09:00:00",
          endTime:   dateISO + "T09:30:00",
          eventDescription: notes || title + " para " + petName,
          nudges: alertMinutes > 0 ? [{ minutesBefore: alertMinutes }] : [],
        }
      }, "*");
    }

    // Fallback: abre o app Calendário do iOS via data URI
    // O iOS abre diretamente ao clicar num link .ics
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PataCare//PT",
      "BEGIN:VEVENT",
      "DTSTART:" + startStr,
      "DTEND:" + endStr,
      "SUMMARY:" + (title + " — " + petName).replace(/,/g, "\,"),
      "DESCRIPTION:" + (notes || title + " para " + petName).replace(/,/g, "\,"),
      alertMinutes > 0 ? "BEGIN:VALARM\nTRIGGER:-PT" + alertMinutes + "M\nACTION:DISPLAY\nDESCRIPTION:Lembrete\nEND:VALARM" : "",
      "END:VEVENT",
      "END:VCALENDAR"
    ].filter(Boolean).join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = (title + "-" + petName).replace(/[^a-zA-Z0-9]/g, "_") + ".ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    toast("Arquivo .ics gerado — abra para adicionar ao calendário Pets!");
  }

  function openCalendarModal(petName, title, dateISO, notes) {
    const alertOptionsHtml = ALERT_OPTIONS.map((a) =>
      `<option value="${a.minutes}" ${a.minutes === 1440 ? "selected" : ""}>${a.label}</option>`
    ).join("");

    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>📅 Agendar no Calendário</h3>
        <button class="icon-btn" id="cal-close">${ICONS.close}</button>
      </div>
      <div class="card" style="margin-bottom:16px;padding:14px 16px">
        <div style="font-size:13px;color:var(--text-muted)">Evento</div>
        <div style="font-weight:700;font-size:16px;margin-top:2px">${escapeHtml(title)} — ${escapeHtml(petName)}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:4px">📆 ${fmtDate(dateISO)}</div>
      </div>
      <div class="card" style="margin-bottom:16px;padding:14px 16px;display:flex;align-items:center;gap:10px">
        <div style="font-size:22px">📅</div>
        <div>
          <div style="font-weight:700;font-size:14px">Calendário: ${escapeHtml(PETS_CALENDAR_NAME)}</div>
          <div style="font-size:12px;color:var(--text-muted)">Arquivo .ics gerado e aberto no iPhone</div>
        </div>
      </div>
      <div class="field">
        <label>Lembrete</label>
        <select id="cal-alert">${alertOptionsHtml}</select>
      </div>
      <div style="display:flex;gap:10px;margin-top:8px">
        <button class="btn btn-secondary btn-block" id="cal-cancel">Cancelar</button>
        <button class="btn btn-primary btn-block" id="cal-confirm">${ICONS.check} Agendar</button>
      </div>
    `);

    sheet.querySelector("#cal-close").addEventListener("click", closeSheet);
    sheet.querySelector("#cal-cancel").addEventListener("click", closeSheet);
    sheet.querySelector("#cal-confirm").addEventListener("click", () => {
      const alertMinutes = parseInt(sheet.querySelector("#cal-alert").value, 10);
      agendarNoCalendario(petName, title, dateISO, notes, alertMinutes);
      closeSheet();
    });
  }

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
  function ageMonths(birthISO) {
    if (!birthISO) return null;
    const b = parseISODate(birthISO), now = new Date();
    let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
    if (now.getDate() < b.getDate()) months--;
    return months < 0 ? null : months;
  }
  function calcAge(birthISO) {
    if (!birthISO) return "";
    const b = parseISODate(birthISO), now = new Date();
    const months = ageMonths(birthISO);
    if (months === null) return "";
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

  /* ------------------------------ Anexos (exames) -------------------------- */
  // Tamanho máximo por anexo, para não estourar o IndexedDB (em bytes, ~8MB)
  const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
  function classifyMime(mime) {
    if (mime && mime.startsWith("image/")) return "image";
    if (mime === "application/pdf") return "pdf";
    return "other";
  }
  async function buildAttachmentFromFile(file) {
    const kind = classifyMime(file.type);
    if (kind === "image") {
      const dataUrl = await resizeImageFile(file, 1400, 0.78);
      return { id: uid(), name: file.name, mime: "image/jpeg", kind, dataUrl };
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast("Arquivo muito grande (máx. 8MB): " + file.name);
      return null;
    }
    const dataUrl = await readFileAsDataURL(file);
    return { id: uid(), name: file.name, mime: file.type || "application/octet-stream", kind, dataUrl };
  }
  function openAttachment(att) {
    if (!att) return;
    if (att.kind === "image") { showLightbox(att.dataUrl); return; }
    const a = document.createElement("a");
    a.href = att.dataUrl;
    a.target = "_blank";
    a.rel = "noopener";
    if (att.kind === "other") a.download = att.name || "arquivo";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function attachmentIcon(att) {
    return att.kind === "pdf" ? ICONS.file : ICONS.file;
  }
  function renderAttachStrip(attachments) {
    const wrap = document.createElement("div");
    wrap.className = "attach-strip";
    (attachments || []).forEach((att) => {
      const item = document.createElement(att.kind === "image" ? "img" : "div");
      if (att.kind === "image") {
        item.className = "attach-thumb";
        item.src = att.dataUrl;
        item.alt = att.name || "Anexo";
      } else {
        item.className = "attach-file";
        item.innerHTML = attachmentIcon(att);
        item.title = att.name || "Arquivo";
      }
      item.addEventListener("click", (e) => { e.stopPropagation(); openAttachment(att); });
      wrap.appendChild(item);
    });
    return wrap;
  }
  // Gerencia a UI de "adicionar/remover anexos" dentro de um formulário (sheet)
  function setupAttachmentField(sheet, initialAttachments) {
    let attachments = (initialAttachments || []).slice();
    const listEl = sheet.querySelector("#rf-attach-list");
    const inputEl = sheet.querySelector("#rf-attach-input");
    const addBtn = sheet.querySelector("#rf-attach-add");

    function renderList() {
      listEl.innerHTML = "";
      attachments.forEach((att) => {
        const row = document.createElement("div");
        row.className = "attach-chip";
        row.innerHTML = `
          ${att.kind === "image" ? `<img class="thumb" src="${att.dataUrl}" alt="Anexo">` : `<div class="icon">${attachmentIcon(att)}</div>`}
          <span class="name">${escapeHtml(att.name || "Arquivo")}</span>
          <button type="button" class="rm" aria-label="Remover anexo">${ICONS.close}</button>`;
        row.querySelector(".name").addEventListener("click", () => openAttachment(att));
        row.querySelector(".thumb, .icon") && row.querySelector(".thumb, .icon").addEventListener("click", () => openAttachment(att));
        row.querySelector(".rm").addEventListener("click", () => {
          attachments = attachments.filter((a) => a.id !== att.id);
          renderList();
        });
        listEl.appendChild(row);
      });
    }
    renderList();
    addBtn.addEventListener("click", () => inputEl.click());
    inputEl.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        const att = await buildAttachmentFromFile(file);
        if (att) attachments.push(att);
      }
      e.target.value = "";
      renderList();
    });
    return { getAttachments: () => attachments };
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
  function vaccineGroupKey(rec) {
    if (rec.vaccineType && rec.vaccineType !== "outra") return "vaccine:" + rec.vaccineType;
    return "vaccine:outra:" + (rec.name || rec.id);
  }
  function careRecordsFor(petId) {
    const pet = getPet(petId);
    const disabled = (pet && pet.disabledVaccineTypes) || [];
    const all = STATE.records.filter((r) => r.petId === petId && (r.category === "vaccine" || r.category === "antiparasitic" || r.category === "dewormer" || r.category === "consultation"))
      .filter((r) => !(r.category === "vaccine" && r.vaccineType && disabled.includes(r.vaccineType)));
    // Só o registro mais recente de cada vacina/categoria deve valer para status de atraso —
    // um reforço aplicado mais novo "substitui" o aviso de atraso da dose anterior.
    const latestByKey = new Map();
    all.forEach((r) => {
      const key = r.category === "vaccine" ? vaccineGroupKey(r) : r.category;
      const cur = latestByKey.get(key);
      if (!cur || r.date > cur.date) latestByKey.set(key, r);
    });
    return [...latestByKey.values()];
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

  /* --------------------------- Perfil do tutor ------------------------------- */
  const TUTOR_KEY = "patacare-tutor";
  function getTutor() {
    try {
      const t = JSON.parse(localStorage.getItem(TUTOR_KEY));
      return t && typeof t === "object" && t.name ? t : null;
    } catch (err) { return null; }
  }
  function saveTutor(t) { localStorage.setItem(TUTOR_KEY, JSON.stringify(t)); }

  function openTutorForm() {
    const existing = getTutor();
    let photoData = existing ? existing.photo : null;
    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${existing ? "Editar perfil" : "Criar meu perfil"}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <div class="field">
        <label>Foto (opcional)</label>
        <div class="photo-upload" id="photo-trigger">
          <div class="ph-icon" id="ph-icon-wrap">${ICONS.camera}</div>
          <span class="txt">Toque para escolher uma foto</span>
        </div>
        <input type="file" accept="image/*" class="visually-hidden" id="photo-input">
      </div>
      <div class="field">
        <label>Nome</label>
        <input type="text" id="t-name" autocomplete="name" placeholder="Como você quer ser chamado(a)?" value="${existing ? escapeHtml(existing.name || "") : ""}">
      </div>
      <div class="field">
        <label>E-mail (opcional)</label>
        <input type="text" id="t-email" inputmode="email" autocomplete="email" placeholder="voce@email.com" value="${existing ? escapeHtml(existing.email || "") : ""}">
      </div>
      <div class="field">
        <label>Telefone (opcional)</label>
        <input type="text" id="t-phone" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-9999" value="${existing ? escapeHtml(existing.phone || "") : ""}">
      </div>
      <div class="field">
        <label>Cidade (opcional)</label>
        <input type="text" id="t-city" placeholder="Ex: São Paulo" value="${existing ? escapeHtml(existing.city || "") : ""}">
      </div>
      <button class="btn btn-primary btn-block" id="t-save">${ICONS.check} Salvar</button>
    `);

    function refreshPhotoPreview() {
      const wrap = sheet.querySelector("#ph-icon-wrap, .photo-upload img");
      const txt = sheet.querySelector(".photo-upload .txt");
      if (photoData && wrap) {
        wrap.outerHTML = `<img src="${photoData}" alt="Pré-visualização">`;
        txt.textContent = "Toque para alterar a foto";
      }
    }
    refreshPhotoPreview();
    sheet.querySelector("#photo-trigger").addEventListener("click", () => sheet.querySelector("#photo-input").click());
    sheet.querySelector("#photo-input").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      photoData = await resizeImageFile(file, 400, 0.8);
      refreshPhotoPreview();
    });

    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelector("#t-save").addEventListener("click", () => {
      const name = sheet.querySelector("#t-name").value.trim();
      if (!name) { toast("Digite seu nome 🙂"); return; }
      saveTutor({
        name,
        email: sheet.querySelector("#t-email").value.trim(),
        phone: sheet.querySelector("#t-phone").value.trim(),
        city: sheet.querySelector("#t-city").value.trim(),
        photo: photoData || null,
        updatedAt: Date.now()
      });
      closeSheet();
      toast(existing ? "Perfil atualizado!" : "Perfil criado!");
      render();
    });
  }

  /* -------------------------------- Router ----------------------------------- */
  function parseHash() {
    const h = (location.hash || "#/").replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    if (parts.length === 0) return { view: "home" };
    if (parts[0] === "pet" && parts[1]) return { view: "pet", petId: parts[1], tab: parts[2] || "overview" };
    if (parts[0] === "pets") return { view: "pets" };
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
    else if (route.view === "pets") renderAllPets(main);
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
    } else if (route.view === "pets") {
      bar.innerHTML = `
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-back" aria-label="Voltar">${ICONS.chevronLeft}</button>
        </div>
        <h1>Meus pets</h1>
        <div class="topbar-actions"></div>`;
      bar.querySelector("#btn-back").addEventListener("click", () => navigate("#/"));
    } else if (route.view === "home") {
      const tutor = getTutor();
      const hasOverdue = STATE.pets.some((p) => {
        const b = petBadgeStatus(p.id);
        return b && b.status === "overdue";
      });
      bar.innerHTML = `
        <div class="brand">
          <span class="logo-dot"><img src="icons/favicon-192.png" alt="PataCare"></span>
          <h1>Meus Pets</h1>
        </div>
        <div class="topbar-actions">
          <button class="icon-btn" id="btn-bell" aria-label="Lembretes">${ICONS.bell}${hasOverdue ? '<span class="bell-dot"></span>' : ""}</button>
          <button class="icon-btn avatar-btn" id="btn-profile" aria-label="Meu perfil">${tutor && tutor.photo ? `<img src="${tutor.photo}" alt="Foto do tutor">` : ICONS.user}</button>
        </div>`;
      bar.querySelector("#btn-bell").addEventListener("click", () => navigate("#/lembretes"));
      bar.querySelector("#btn-profile").addEventListener("click", () => navigate("#/ajustes"));
    } else {
      const titles = { reminders: "Lembretes", settings: "Ajustes" };
      bar.innerHTML = `
        <div class="brand">
          <span class="logo-dot"><img src="icons/favicon-192.png" alt="PataCare"></span>
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
      const active = route.view === it.id || (it.id === "home" && route.view === "pets");
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
    if (route.view === "home" || route.view === "pets") action = () => openPetForm(null);
    else if (route.view === "pet") {
      const tab = route.tab || "overview";
      const pet = getPet(route.petId);
      if (tab === "vaccine") action = () => openVaccineForm(route.petId, null);
      else if (tab === "medication") action = () => openMedicationForm(route.petId, null);
      else if (tab === "exam") action = () => openExamForm(route.petId, null);
      else if (tab === "surgery") action = () => openSurgeryForm(route.petId, null);
      else if (tab === "consultation") action = () => openConsultationForm(route.petId, null);
      else if (tab === "heat") { if (!pet || !pet.neutered) action = () => openRecordForm("heat", route.petId, null); }
      else if (["antiparasitic", "dewormer", "weight"].includes(tab)) action = () => openRecordForm(tab, route.petId, null);
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
  const DAILY_TIPS = [
    "Passeios diários ajudam na saúde física e mental do seu cão. 🐾",
    "Água fresca sempre disponível: troque pelo menos 2x ao dia. 💧",
    "Escovar os dentes do pet algumas vezes por semana previne tártaro e mau hálito. 🦷",
    "Mantenha vacinas e vermífugos em dia — prevenção é o melhor remédio. 💉",
    "Gatos também precisam de brincadeiras diárias para gastar energia. 🐱",
    "Escovar a pelagem regularmente reduz pelos soltos e fortalece o vínculo. ✨",
    "Atenção ao calor: prefira passear nos horários mais frescos do dia. ☀️",
    "Petiscos não devem passar de 10% das calorias diárias do pet. 🍖",
    "Brinquedos e enriquecimento ambiental deixam o dia a dia do pet mais feliz. 🧸",
    "Consultas de rotina anuais ajudam a detectar problemas cedo. 🩺",
    "Mudanças de apetite ou comportamento podem indicar algo — fique de olho. 👀",
    "Carinho e rotina previsível deixam os pets mais seguros e calmos. 💕"
  ];
  let tipOffset = 0;

  function renderHome(main) {
    const pets = petsSorted();
    const tutor = getTutor();
    const firstName = tutor && tutor.name ? tutor.name.trim().split(/\s+/)[0] : "";

    const hero = document.createElement("div");
    hero.className = "home-hero";
    hero.innerHTML = `
      <div class="hero-txt">
        <div class="hello">Olá${firstName ? ", " + escapeHtml(firstName) : ""}! 👋</div>
        <h2>Que bom te ver aqui!</h2>
        <p class="sub">Acompanhe a saúde, a rotina e o bem-estar dos seus pets em um só lugar.</p>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="hh">${ICONS.heart}</span>
        <span class="hp">${ICONS.paw}</span>
      </div>`;
    main.appendChild(hero);

    const secHead = document.createElement("div");
    secHead.className = "sec-head";
    secHead.innerHTML = `<h3>Meus pets</h3>${pets.length > 0 ? `<button class="sec-link" id="btn-all-pets">Ver todos ${ICONS.chevronRight}</button>` : ""}`;
    main.appendChild(secHead);
    const allBtn = secHead.querySelector("#btn-all-pets");
    if (allBtn) allBtn.addEventListener("click", () => navigate("#/pets"));

    const strip = document.createElement("div");
    strip.className = "hpet-strip";
    pets.forEach((pet) => strip.appendChild(renderHomePetCard(pet)));
    const addCard = document.createElement("div");
    addCard.className = "hpet-card hpet-add";
    addCard.setAttribute("role", "button");
    addCard.innerHTML = `<div class="plus-circ">${ICONS.plus}</div><div class="lbl">Adicionar<br>pet</div>`;
    addCard.addEventListener("click", () => openPetForm(null));
    strip.appendChild(addCard);
    main.appendChild(strip);

    if (pets.length > 0) main.appendChild(renderWeekSummary());
    main.appendChild(renderDailyTip());
  }

  function renderHomePetCard(pet) {
    const card = document.createElement("div");
    card.className = "hpet-card";
    const badge = petBadgeStatus(pet.id);
    const speciesIcon = pet.species === "cat" ? ICONS.cat : ICONS.dog;
    let dot = "", chip = "";
    if (badge) {
      if (badge.status === "overdue") {
        dot = `<span class="hpet-dot overdue">${ICONS.alert}</span>`;
        chip = `<span class="chip alert">${badge.count > 1 ? badge.count + " atrasados" : "Atrasado"}</span>`;
      } else if (badge.status === "soon") {
        dot = `<span class="hpet-dot soon">${ICONS.calendar}</span>`;
        chip = `<span class="chip soon">Em breve</span>`;
      } else {
        dot = `<span class="hpet-dot ok">${ICONS.check}</span>`;
        chip = `<span class="chip ok">${ICONS.check} Tudo certo</span>`;
      }
    }
    const sexLabel = pet.sex === "F" ? "Fêmea" : "Macho";
    const breed = pet.breed || (pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Pet");
    card.innerHTML = `
      <div class="hpet-photo-wrap">
        ${pet.photo ? `<img class="hpet-photo" src="${pet.photo}" alt="Foto de ${escapeHtml(pet.name)}">` : `<div class="hpet-photo placeholder">${speciesIcon}</div>`}
        ${dot}
      </div>
      <h3>${escapeHtml(pet.name)}</h3>
      <div class="meta">${escapeHtml(breed)} · ${sexLabel}${pet.birthDate ? `<br>${calcAge(pet.birthDate)}` : ""}</div>
      ${chip}`;
    card.addEventListener("click", () => navigate(`#/pet/${pet.id}/overview`));
    return card;
  }

  function renderWeekSummary() {
    const today = todayISO();
    let apptToday = 0, apptTomorrow = 0, apptWeek = 0, overdueCount = 0;
    let nextVacDate = null, vacSoon = 0;
    STATE.pets.forEach((pet) => {
      careRecordsFor(pet.id).forEach((rec) => {
        if (!rec.nextDate) return;
        const d = daysBetween(today, rec.nextDate);
        if (d < 0) { overdueCount++; return; }
        if (d <= 7) {
          apptWeek++;
          if (d === 0) apptToday++;
          else if (d === 1) apptTomorrow++;
        }
        if (rec.category === "vaccine") {
          if (!nextVacDate || rec.nextDate < nextVacDate) nextVacDate = rec.nextDate;
          if (d <= 30) vacSoon++;
        }
      });
    });
    let dosesPending = 0;
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    STATE.records.filter((r) => r.category === "medication").forEach((med) => {
      (med.doses || []).forEach((dose) => {
        if (isDosePending(dose) && new Date(dose.scheduledAt) <= endOfToday) dosesPending++;
      });
    });

    const apptParts = [];
    if (apptToday) apptParts.push(apptToday + " hoje");
    if (apptTomorrow) apptParts.push(apptTomorrow + " amanhã");
    const apptSub = overdueCount > 0
      ? `<span style="color:var(--red);font-weight:700">${overdueCount} atrasado${overdueCount > 1 ? "s" : ""}</span>`
      : apptParts.length ? escapeHtml(apptParts.join(" · ")) : "Nenhum esta semana";

    let vacSub = "Nenhuma prevista";
    if (nextVacDate) {
      const nd = parseISODate(nextVacDate);
      vacSub = "Próxima: " + pad(nd.getDate()) + "/" + pad(nd.getMonth() + 1);
    }
    const medSub = dosesPending === 0 ? "Tudo em dia! ✅" : "Pendente" + (dosesPending > 1 ? "s" : "") + " hoje";

    const card = document.createElement("div");
    card.className = "week-card";
    card.innerHTML = `
      <div class="week-head">
        <h3>Resumo da semana</h3>
        <span class="week-pill">Próximos 7 dias</span>
      </div>
      <div class="week-grid">
        <div class="wstat">
          <div class="ic">${ICONS.calendar}</div>
          <div class="num">${apptWeek}</div>
          <div class="lbl">Compromisso${apptWeek === 1 ? "" : "s"}</div>
          <div class="sub">${apptSub}</div>
        </div>
        <div class="wstat">
          <div class="ic">${ICONS.syringe}</div>
          <div class="num">${vacSoon}</div>
          <div class="lbl">Vacina${vacSoon === 1 ? "" : "s"}</div>
          <div class="sub">${escapeHtml(vacSub)}</div>
        </div>
        <div class="wstat">
          <div class="ic">${ICONS.medkit}</div>
          <div class="num">${dosesPending}</div>
          <div class="lbl">Medicamento${dosesPending === 1 ? "" : "s"}</div>
          <div class="sub">${escapeHtml(medSub)}</div>
        </div>
      </div>`;
    return card;
  }

  function renderDailyTip() {
    const dayIndex = Math.floor(Date.now() / 86400000);
    const tipAt = (n) => DAILY_TIPS[(dayIndex + n) % DAILY_TIPS.length];
    const card = document.createElement("div");
    card.className = "tip-card";
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Dica do dia — toque para ver outra dica");
    card.innerHTML = `
      <div class="ic">${ICONS.bulb}</div>
      <div class="tx">
        <div class="t">Dica do dia</div>
        <div class="s">${escapeHtml(tipAt(tipOffset))}</div>
      </div>
      <span class="chev">${ICONS.chevronRight}</span>`;
    card.addEventListener("click", () => {
      tipOffset++;
      card.querySelector(".s").textContent = tipAt(tipOffset);
    });
    return card;
  }

  function renderAllPets(main) {
    const pets = petsSorted();
    if (pets.length === 0) {
      main.innerHTML = `
        <div class="empty-state">
          <div class="paw-stack"><img src="icons/favicon-192.png" alt="" style="width:64px;height:64px;opacity:.9;box-shadow:var(--shadow-sm);border-radius:50%"></div>
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
    { id: "consultation", label: "Consultas", icon: "stethoscope" },
    { id: "exam", label: "Exames", icon: "clipboard" },
    { id: "surgery", label: "Cirurgias", icon: "scissors" },
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
    let activeTabBtn = null;
    visibleTabs.forEach((t) => {
      const b = document.createElement("button");
      b.className = "tab" + (t.id === tab ? " active" : "");
      b.innerHTML = (t.icon ? ICONS[t.icon] : "") + `<span>${t.label}</span>`;
      b.addEventListener("click", () => navigate(`#/pet/${petId}/${t.id}`));
      tabsRow.appendChild(b);
      if (t.id === tab) activeTabBtn = b;
    });
    main.appendChild(tabsRow);
    if (activeTabBtn) {
      requestAnimationFrame(() => {
        activeTabBtn.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
      });
    }

    const content = document.createElement("div");
    main.appendChild(content);

    if (tab === "overview") renderOverviewTab(content, pet);
    else if (tab === "vaccine") renderCareListTab(content, pet, "vaccine");
    else if (tab === "medication") renderMedicationTab(content, pet);
    else if (tab === "antiparasitic") renderCareListTab(content, pet, "antiparasitic");
    else if (tab === "dewormer") renderCareListTab(content, pet, "dewormer");
    else if (tab === "exam") renderCareListTab(content, pet, "exam");
    else if (tab === "surgery") renderCareListTab(content, pet, "surgery");
    else if (tab === "consultation") renderCareListTab(content, pet, "consultation");
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
      <div class="settings-row">
        <div class="ic">${ICONS.heart}</div>
        <div class="lbl"><div class="t">Castrado(a)</div><div class="s">${pet.neutered ? "Sim" : "Não"}</div></div>
      </div>
      ${pet.microchip ? `<div class="settings-row"><div class="ic">${ICONS.chip}</div><div class="lbl"><div class="t">Microchip</div><div class="s">${escapeHtml(pet.microchip)}</div></div></div>` : ""}
      ${pet.notes ? `<div class="settings-row"><div class="ic">${ICONS.info}</div><div class="lbl"><div class="t">Observações</div><div class="s">${escapeHtml(pet.notes)}</div></div></div>` : ""}`;
    content.appendChild(infoCard);

    const measureTitle = document.createElement("div");
    measureTitle.className = "section-title";
    measureTitle.textContent = "Medidas (para roupas)";
    content.appendChild(measureTitle);

    const m = pet.measurements || {};
    const hasMeasurements = m.neck || m.chest || m.length;
    const measureCard = document.createElement("div");
    measureCard.className = "card";
    measureCard.style.cursor = "pointer";
    measureCard.innerHTML = `
      <div class="settings-row" style="padding-top:0">
        <div class="ic">${ICONS.ruler}</div>
        <div class="lbl"><div class="t">Pescoço</div><div class="s">${m.neck ? m.neck + " cm" : "Não informado"}</div></div>
      </div>
      <div class="settings-row">
        <div class="ic">${ICONS.ruler}</div>
        <div class="lbl"><div class="t">Peito/Tórax</div><div class="s">${m.chest ? m.chest + " cm" : "Não informado"}</div></div>
      </div>
      <div class="settings-row">
        <div class="ic">${ICONS.ruler}</div>
        <div class="lbl"><div class="t">Comprimento do dorso</div><div class="s">${m.length ? m.length + " cm" : "Não informado"}</div></div>
      </div>
      ${m.notes ? `<div class="settings-row"><div class="ic">${ICONS.info}</div><div class="lbl"><div class="t">Observações</div><div class="s">${escapeHtml(m.notes)}</div></div></div>` : ""}
      <div class="settings-row">
        <div class="ic">${ICONS.edit}</div>
        <div class="lbl"><div class="t" style="color:var(--pink-strong)">${hasMeasurements ? "Editar medidas" : "Adicionar medidas"}</div>${m.updatedAt ? `<div class="s">Atualizado em ${fmtDate(m.updatedAt)}</div>` : ""}</div>
        <span class="chevron">${ICONS.chevronRight}</span>
      </div>`;
    measureCard.addEventListener("click", () => openMeasurementsForm(pet));
    content.appendChild(measureCard);

    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = "Resumo de cuidados";
    content.appendChild(title);

    const summary = document.createElement("div");
    summary.className = "card";
    const careLatest = careRecordsFor(pet.id);
    function row(icon, label, list, category, hash) {
      const r = document.createElement("div");
      r.className = "settings-row";
      r.style.cursor = "pointer";
      const latestOfCategory = careLatest.filter((x) => x.category === category && x.nextDate);
      let worst = null;
      latestOfCategory.forEach((x) => {
        const s = dueStatus(x.nextDate);
        if (s.status === "overdue") worst = s.status === worst ? worst : "overdue";
        else if (s.status === "soon" && worst !== "overdue") worst = "soon";
      });
      let statusHtml = `<span class="s">${list.length} registro${list.length === 1 ? "" : "s"}</span>`;
      if (worst === "overdue") statusHtml = `<span class="s" style="color:var(--red);font-weight:700">Atrasado</span>`;
      else if (worst === "soon") statusHtml = `<span class="s" style="color:var(--peach);font-weight:700">Próxima em breve</span>`;
      r.innerHTML = `<div class="ic">${ICONS[icon]}</div><div class="lbl"><div class="t">${label}</div>${statusHtml}</div><span class="chevron">${ICONS.chevronRight}</span>`;
      r.addEventListener("click", () => navigate(hash));
      return r;
    }
    summary.appendChild(row("syringe", "Vacinas", vac, "vaccine", `#/pet/${pet.id}/vaccine`));
    const meds = STATE.records.filter((r) => r.petId === pet.id && r.category === "medication");
    const medActive = meds.filter((m) => m.doses.some(isDosePending));
    const medRow = document.createElement("div");
    medRow.className = "settings-row"; medRow.style.cursor = "pointer";
    let medStatus = `<span class="s">${meds.length} registrado${meds.length === 1 ? "" : "s"}</span>`;
    if (medActive.length > 0) medStatus = `<span class="s" style="color:var(--pink-strong);font-weight:700">${medActive.length} em andamento</span>`;
    medRow.innerHTML = `<div class="ic">${ICONS.medkit}</div><div class="lbl"><div class="t">Medicamentos</div>${medStatus}</div><span class="chevron">${ICONS.chevronRight}</span>`;
    medRow.addEventListener("click", () => navigate(`#/pet/${pet.id}/medication`));
    summary.appendChild(medRow);
    summary.appendChild(row("bug", "Antipulgas/Carrapatos", anti, "antiparasitic", `#/pet/${pet.id}/antiparasitic`));
    summary.appendChild(row("pill", "Vermífugos", derm, "dewormer", `#/pet/${pet.id}/dewormer`));
    summary.appendChild(row("stethoscope", "Consultas", recordsFor(pet.id, "consultation"), "consultation", `#/pet/${pet.id}/consultation`));
    summary.appendChild(row("clipboard", "Exames", recordsFor(pet.id, "exam"), "exam", `#/pet/${pet.id}/exam`));
    summary.appendChild(row("scissors", "Cirurgias", recordsFor(pet.id, "surgery"), "surgery", `#/pet/${pet.id}/surgery`));
    const wr = document.createElement("div");
    wr.className = "settings-row"; wr.style.cursor = "pointer";
    wr.innerHTML = `<div class="ic">${ICONS.scale}</div><div class="lbl"><div class="t">Peso</div><span class="s">${lastWeight ? lastWeight.weight + " kg em " + fmtDate(lastWeight.date) : "Sem registros"}</span></div><span class="chevron">${ICONS.chevronRight}</span>`;
    wr.addEventListener("click", () => navigate(`#/pet/${pet.id}/weight`));
    summary.appendChild(wr);
    content.appendChild(summary);
  }

  /* ----------------------- Faixa de peso ideal por raça (referência geral) ------------------------
     Faixas aproximadas de peso adulto, baseadas em padrões usuais de raça. Servem só como
     referência — avaliação de peso real depende de exame físico (escore de condição corporal)
     feito por um médico-veterinário. Não se aplica a filhotes nem a SRD/vira-lata (porte variável). */
  const BREED_WEIGHT_TABLE = [
    { keys: ["chihuahua"], min: 1.5, max: 3 },
    { keys: ["yorkshire"], min: 2, max: 3.5 },
    { keys: ["maltes", "maltês"], min: 2, max: 4 },
    { keys: ["pomerania", "lulu da pomerania", "spitz alemao", "spitz alemão"], min: 1.5, max: 3.5 },
    { keys: ["pinscher mini", "pinscher miniatura"], min: 3, max: 6 },
    { keys: ["pinscher"], min: 3, max: 6 },
    { keys: ["poodle toy", "poodle micro"], min: 2, max: 4 },
    { keys: ["poodle mini", "poodle miniatura"], min: 5, max: 8 },
    { keys: ["poodle standard", "poodle grande", "poodle gigante"], min: 20, max: 31 },
    { keys: ["poodle"], min: 5, max: 8 },
    { keys: ["shih tzu"], min: 4, max: 8 },
    { keys: ["lhasa apso"], min: 5, max: 8 },
    { keys: ["bichon"], min: 3, max: 6 },
    { keys: ["jack russell"], min: 5, max: 8 },
    { keys: ["cavalier"], min: 5, max: 8 },
    { keys: ["dachshund mini", "salsicha mini", "teckel mini"], min: 3, max: 5 },
    { keys: ["dachshund", "salsicha", "teckel"], min: 7, max: 12 },
    { keys: ["schnauzer mini", "schnauzer miniatura"], min: 4, max: 8 },
    { keys: ["schnauzer gigante"], min: 25, max: 35 },
    { keys: ["schnauzer"], min: 13, max: 20 },
    { keys: ["bulldog frances", "bulldog francês"], min: 8, max: 14 },
    { keys: ["pug"], min: 6, max: 10 },
    { keys: ["beagle"], min: 9, max: 15 },
    { keys: ["cocker"], min: 11, max: 16 },
    { keys: ["border collie"], min: 12, max: 20 },
    { keys: ["whippet"], min: 7, max: 14 },
    { keys: ["basset"], min: 18, max: 29 },
    { keys: ["shar pei"], min: 18, max: 30 },
    { keys: ["spitz japones", "spitz japonês"], min: 5, max: 10 },
    { keys: ["bulldog ingles", "bulldog inglês"], min: 18, max: 29 },
    { keys: ["labrador"], min: 25, max: 36 },
    { keys: ["golden"], min: 25, max: 34 },
    { keys: ["husky"], min: 16, max: 27 },
    { keys: ["pastor alemao", "pastor alemão"], min: 22, max: 40 },
    { keys: ["rottweiler"], min: 35, max: 60 },
    { keys: ["doberman"], min: 27, max: 45 },
    { keys: ["boxer"], min: 24, max: 32 },
    { keys: ["collie"], min: 18, max: 34 },
    { keys: ["setter"], min: 20, max: 32 },
    { keys: ["pointer"], min: 20, max: 34 },
    { keys: ["dalmata", "dálmata"], min: 16, max: 32 },
    { keys: ["akita"], min: 30, max: 45 },
    { keys: ["chow chow"], min: 20, max: 32 },
    { keys: ["weimaraner"], min: 25, max: 40 },
    { keys: ["pit bull"], min: 14, max: 27 },
    { keys: ["bernese"], min: 35, max: 55 },
    { keys: ["fila brasileiro", "fila"], min: 40, max: 55 },
    { keys: ["mastim", "dogue alemao", "dogue alemão", "great dane"], min: 45, max: 90 },
    { keys: ["sao bernardo", "são bernardo"], min: 55, max: 90 },
    { keys: ["maine coon"], min: 5, max: 11, species: "cat" },
    { keys: ["ragdoll"], min: 4.5, max: 9, species: "cat" },
    { keys: ["persa"], min: 3, max: 5.5, species: "cat" },
    { keys: ["siames", "siamês"], min: 3, max: 5, species: "cat" },
    { keys: ["sphynx"], min: 3, max: 5.5, species: "cat" },
    { keys: ["british shorthair", "british"], min: 4, max: 8, species: "cat" },
    { keys: ["bengal"], min: 4, max: 7, species: "cat" },
    { keys: ["noruegues", "norueguês", "norwegian"], min: 4.5, max: 9, species: "cat" },
    { keys: ["angora"], min: 2.5, max: 5, species: "cat" }
  ];
  function normalizeBreedText(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }
  function findBreedWeightRange(pet) {
    const text = normalizeBreedText(pet.breed);
    if (!text || /srd|sem raca|vira ?lata|mestic|indefinid/.test(text)) {
      if (pet.species === "cat") return { min: 3, max: 5.5, isGenericCat: true };
      return null;
    }
    for (const entry of BREED_WEIGHT_TABLE) {
      if (entry.species && entry.species !== pet.species) continue;
      if (!entry.species && pet.species === "cat") continue; // entradas de cão não valem para gato
      if (entry.keys.some((k) => text.includes(k))) return entry;
    }
    if (pet.species === "cat") return { min: 3, max: 5.5, isGenericCat: true };
    return null;
  }
  // Considera-se "adulto" para fins de comparação de peso a partir desta idade (meses);
  // racas pequenas maturam mais rápido, mas usamos um corte conservador único para o v1.
  const ADULT_MIN_MONTHS = 12;

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
      doses.push({ scheduledAt: t.toISOString(), status: "pending", doneAt: null });
    }
    return doses;
  }
  // "pending" | "done" | "missed" — d.done é mantido apenas para compatibilidade com dados antigos
  function doseStatus(d) { return d.status || (d.done ? "done" : "pending"); }
  function isDosePending(d) { return doseStatus(d) === "pending"; }
  function isDoseDone(d) { return doseStatus(d) === "done"; }
  function isDoseMissed(d) { return doseStatus(d) === "missed"; }
  function setDoseStatus(d, status) {
    d.status = status;
    d.done = status === "done"; // compatibilidade
    d.doneAt = status === "done" ? new Date().toISOString() : null;
  }
  function hoursLate(dose) { return (Date.now() - new Date(dose.scheduledAt).getTime()) / 3600000; }
  function isPendingExpired(dose, frequencyHours) { return isDosePending(dose) && hoursLate(dose) > frequencyHours; }
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
      dewormer: { label: "aplicação", title: "Vermífugo", icon: "pill", primaryKey: "product", primaryLabel: "Vermífugo aplicado", placeholder: "Ex: Drontal, Vermivet...", hasPhoto: false, emptyTitle: "Nada registrado ainda", emptyText: "Registre aqui os vermífugos aplicados no seu pet." },
      exam: {
        label: "exame", title: "Exame", icon: "clipboard", hasPhoto: false,
        emptyTitle: "Nenhum exame registrado",
        emptyText: "Toque no + para registrar um exame (raio-X, ultrassom, sangue...) e anexar os resultados (imagens ou PDF).",
        getTitle: (rec) => rec.examType || "Exame",
        getBadge: (rec) => rec.vet ? (rec.crm ? `${rec.vet} · CRMV ${rec.crm}` : rec.vet) : null
      },
      surgery: {
        label: "cirurgia", title: "Cirurgia", icon: "scissors", hasPhoto: false,
        emptyTitle: "Nenhuma cirurgia registrada",
        emptyText: "Toque no + para registrar uma cirurgia (castração, remoção de nódulo...) e anexar fotos ou laudos.",
        getTitle: (rec) => rec.surgeryType || "Cirurgia",
        getBadge: (rec) => rec.vet ? (rec.crm ? `${rec.vet} · CRMV ${rec.crm}` : rec.vet) : null
      },
      consultation: {
        label: "consulta", title: "Consulta", icon: "stethoscope", hasPhoto: false,
        emptyTitle: "Nenhuma consulta registrada",
        emptyText: "Toque no + para registrar uma consulta com o médico-veterinário.",
        getTitle: (rec) => rec.vet ? `Consulta — ${rec.vet}` : "Consulta",
        getBadge: (rec) => {
          const crmTxt = rec.crm ? `CRMV ${rec.crm}` : null;
          return [crmTxt, rec.reason].filter(Boolean).join(" · ") || null;
        }
      }
    };
    return CFG[category];
  }

  function renderCareListTab(content, pet, category) {
    const cfg = categoryConfig(category);
    const list = recordsFor(pet.id, category);
    const openForm = (rec) => {
      if (category === "vaccine") return openVaccineForm(pet.id, rec);
      if (category === "exam") return openExamForm(pet.id, rec);
      if (category === "surgery") return openSurgeryForm(pet.id, rec);
      if (category === "consultation") return openConsultationForm(pet.id, rec);
      return openRecordForm(category, pet.id, rec);
    };

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

    if (category === "vaccine") {
      const title = document.createElement("div");
      title.className = "section-title";
      title.textContent = "Histórico (por vacina)";
      content.appendChild(title);
      vaccineGroupsList(pet.id).forEach((group) => content.appendChild(renderVaccineGroupRow(group, pet)));
      return;
    }

    const latestIds = latestRecordIdsForCategory(pet.id, category);
    list.forEach((rec) => content.appendChild(renderRecordCard(rec, cfg, category, pet.id, latestIds.has(rec.id))));
  }

  function latestRecordIdsForCategory(petId, category) {
    const all = STATE.records.filter((r) => r.petId === petId && r.category === category);
    const map = new Map();
    all.forEach((r) => {
      const key = category === "vaccine" ? vaccineGroupKey(r) : category;
      const cur = map.get(key);
      if (!cur || r.date > cur.date) map.set(key, r);
    });
    return new Set([...map.values()].map((r) => r.id));
  }

  function vaccineGroupsList(petId) {
    const all = STATE.records.filter((r) => r.petId === petId && r.category === "vaccine");
    const map = new Map();
    all.forEach((r) => {
      const key = vaccineGroupKey(r);
      if (!map.has(key)) {
        const title = (r.vaccineType && r.vaccineType !== "outra") ? vaccineTypeLabel(r.vaccineType) : (r.name || "Vacina");
        map.set(key, { key, title, vaccineType: r.vaccineType, records: [] });
      }
      map.get(key).records.push(r);
    });
    const groups = [...map.values()];
    groups.forEach((g) => g.records.sort((a, b) => a.date.localeCompare(b.date))); // asc
    groups.sort((a, b) => {
      const lastA = a.records[a.records.length - 1].date;
      const lastB = b.records[b.records.length - 1].date;
      return lastB.localeCompare(lastA); // grupos com aplicação mais recente primeiro
    });
    return groups;
  }

function renderVaccineGroupRow(group, pet) {
  const last = group.records[group.records.length - 1];
  const st = dueStatus(last.nextDate);
  const div = document.createElement("div");
  div.className = "record";
  div.style.cursor = "pointer";
  let statusHtml = `<span class="sub">${group.records.length} dose${group.records.length === 1 ? "" : "s"} · última em ${fmtDate(last.date)}</span>`;
  let nextHtml = "";
  if (last.nextDate) {
    const color = st.status === "overdue" ? "var(--red)" : st.status === "soon" ? "var(--peach)" : "var(--mint)";
    const txt = st.status === "overdue" ? `Atrasado há ${st.days} dia${st.days === 1 ? "" : "s"}` : st.status === "soon" ? `Em ${st.days} dia${st.days === 1 ? "" : "s"}` : `Próxima em ${fmtDate(last.nextDate)}`;
    nextHtml = `
      <hr class="record-divider">
      <div class="record-next" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="color:${color}">${ICONS.calendar} ${txt}</span>
        <button class="btn btn-sm btn-secondary cal-btn" style="padding:5px 8px;font-size:14px;flex-shrink:0" aria-label="Agendar no calendário">📅</button>
      </div>`;
  }
  div.innerHTML = `
    <div class="record-stamp"><span class="d">${pad(parseISODate(last.date).getDate())}</span><span class="m">${MONTHS_ABBR[parseISODate(last.date).getMonth()]}</span></div>
    <div class="record-body" style="flex:1">
      <h4>${escapeHtml(group.title)}</h4>
      ${statusHtml}
      ${nextHtml}
    </div>
    <span class="chevron">${ICONS.chevronRight}</span>`;
  div.querySelector(".record-body").addEventListener("click", (e) => {
    if (e.target.closest(".cal-btn")) return;
    openVaccineGroupHistory(pet.id, group);
  });
  div.querySelector(".chevron").addEventListener("click", () => openVaccineGroupHistory(pet.id, group));
  const calBtn = div.querySelector(".cal-btn");
  if (calBtn) {
    calBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openCalendarModal(pet.name, group.title, last.nextDate, "");
    });
  }
  return div;
}

  function openVaccineGroupHistory(petId, group) {
    const last = group.records[group.records.length - 1];
    const st = dueStatus(last.nextDate);
    const rowsHtml = group.records.map((r) => {
      const cfg = categoryConfig("vaccine");
      const badge = cfg.getBadge(r);
      return `
        <div class="vtl-row">
          <div class="vtl-date">${fmtDate(r.date)}</div>
          <div class="vtl-spine"><span class="vtl-dot"></span></div>
          <div class="vtl-card" data-id="${r.id}">
            <h4>${badge ? escapeHtml(badge) : escapeHtml(group.title)}</h4>
            ${r.notes ? `<div class="sub">${escapeHtml(r.notes)}</div>` : ""}
            ${r.photo ? `<img class="vtl-thumb" src="${r.photo}" alt="Etiqueta" data-photo="${r.id}">` : ""}
          </div>
        </div>`;
    }).join("");

    let nextBannerHtml = "";
    if (last.nextDate) {
      const color = st.status === "overdue" ? "var(--red)" : st.status === "soon" ? "var(--peach)" : "var(--mint)";
      const bg = st.status === "overdue" ? "var(--red-soft)" : st.status === "soon" ? "var(--peach-soft)" : "var(--mint-soft)";
      const txt = st.status === "overdue" ? `Próxima dose atrasada há ${st.days} dia${st.days === 1 ? "" : "s"} (prevista para ${fmtDate(last.nextDate)})` : st.status === "soon" ? `Próxima dose em ${st.days} dia${st.days === 1 ? "" : "s"} (${fmtDate(last.nextDate)})` : `Próxima dose prevista para ${fmtDate(last.nextDate)}`;
      nextBannerHtml = `<div class="vtl-next" style="background:${bg};color:${color}">${ICONS.calendar} ${txt}</div>`;
    }

    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${escapeHtml(group.title)}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">Ordem cronológica · toque em uma dose para editar</p>
      <div class="vtl">${rowsHtml}</div>
      ${nextBannerHtml}
    `);
    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelectorAll(".vtl-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("img")) return;
        const rec = group.records.find((r) => r.id === card.dataset.id);
        if (rec) openVaccineForm(petId, rec);
      });
    });
    sheet.querySelectorAll(".vtl-thumb").forEach((img) => {
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        const rec = group.records.find((r) => r.id === img.dataset.photo);
        if (rec) showLightbox(rec.photo);
      });
    });
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
        <div class="vf-row" data-open="${type}">${dotsHtml}</div>`;
      card.querySelector(".vf-toggle").addEventListener("click", (e) => {
        e.stopPropagation();
        (async () => {
          const set = new Set(pet.disabledVaccineTypes || []);
          if (set.has(type)) set.delete(type); else set.add(type);
          pet.disabledVaccineTypes = [...set];
          await dbPut("pets", pet);
          await loadAll();
          render();
        })();
      });
      card.querySelector(".vf-row").addEventListener("click", () => {
        const group = vaccineGroupsList(pet.id).find((g) => g.key === "vaccine:" + type);
        if (group) openVaccineGroupHistory(pet.id, group);
      });
      content.appendChild(card);
    });
  }


function renderRecordCard(rec, cfg, category, petId, isLatest) {
  const div = document.createElement("div");
  div.className = "record";
  const d = parseISODate(rec.date);
  const st = dueStatus(rec.nextDate);
  const title = cfg.getTitle ? cfg.getTitle(rec) : (rec[cfg.primaryKey] || cfg.title);
  const badge = cfg.getBadge ? cfg.getBadge(rec) : null;
  const pet = getPet(petId);
  let nextHtml = "";
  if (rec.nextDate && isLatest !== false) {
    const color = st.status === "overdue" ? "var(--red)" : st.status === "soon" ? "var(--peach)" : "var(--mint)";
    const txt = st.status === "overdue" ? `Atrasado há ${st.days} dia${st.days === 1 ? "" : "s"}` : st.status === "soon" ? `Em ${st.days} dia${st.days === 1 ? "" : "s"} (${fmtDate(rec.nextDate)})` : `Próxima em ${fmtDate(rec.nextDate)}`;
    nextHtml = `
      <hr class="record-divider">
      <div class="record-next" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="color:${color}">${ICONS.calendar} ${txt}</span>
        <button class="btn btn-sm btn-secondary cal-btn" style="padding:5px 8px;font-size:14px;flex-shrink:0" aria-label="Agendar no calendário">📅</button>
      </div>`;
  } else if (rec.nextDate && isLatest === false) {
    nextHtml = `<hr class="record-divider"><div class="record-next" style="color:var(--text-faint)">${ICONS.check} Substituída por um registro mais novo</div>`;
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
  if (rec.attachments && rec.attachments.length) {
    div.querySelector(".record-body").appendChild(renderAttachStrip(rec.attachments));
  }
  const openEdit = () => {
    if (category === "vaccine") return openVaccineForm(petId, rec);
    if (category === "exam") return openExamForm(petId, rec);
    if (category === "surgery") return openSurgeryForm(petId, rec);
    if (category === "consultation") return openConsultationForm(petId, rec);
    return openRecordForm(category, petId, rec);
  };
  div.querySelector(".record-menu-btn").addEventListener("click", openEdit);
  div.querySelector(".record-body h4").addEventListener("click", openEdit);
  div.querySelector(".record-body .sub") && div.querySelector(".record-body .sub").addEventListener("click", openEdit);
  const calBtn = div.querySelector(".cal-btn");
  if (calBtn) {
    calBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openCalendarModal(pet ? pet.name : "", title, rec.nextDate, rec.notes || "");
    });
  }
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

    const assessment = renderWeightAssessmentCard(pet, latest.weight);
    if (assessment) content.appendChild(assessment);

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

  function renderWeightAssessmentCard(pet, currentWeight) {
    const div = document.createElement("div");
    div.className = "card weight-assessment";
    div.style.marginBottom = "16px";

    if (!pet.birthDate) {
      div.innerHTML = `
        <div style="display:flex;gap:10px;align-items:flex-start">
          <span style="display:flex;flex-shrink:0;color:var(--text-faint)">${ICONS.info}</span>
          <p style="font-size:12.5px;color:var(--text-muted);line-height:1.5">Informe a <strong>data de nascimento</strong> e a <strong>raça</strong> do pet (em "Editar pet") para ver aqui se o peso está dentro da faixa esperada.</p>
        </div>`;
      return div;
    }
    const months = ageMonths(pet.birthDate);
    if (months !== null && months < ADULT_MIN_MONTHS) {
      div.innerHTML = `
        <div style="display:flex;gap:10px;align-items:flex-start">
          <span style="display:flex;flex-shrink:0;color:var(--peach)">${ICONS.info}</span>
          <p style="font-size:12.5px;color:var(--text-muted);line-height:1.5"><strong style="color:var(--text)">Fase de crescimento</strong> — com ${calcAge(pet.birthDate)}, ainda não dá pra comparar com o peso ideal de um adulto. Continue acompanhando a curva de peso; o ganho deve ser gradual e constante.</p>
        </div>`;
      return div;
    }
    const range = findBreedWeightRange(pet);
    if (!range) {
      div.innerHTML = `
        <div style="display:flex;gap:10px;align-items:flex-start">
          <span style="display:flex;flex-shrink:0;color:var(--text-faint)">${ICONS.info}</span>
          <p style="font-size:12.5px;color:var(--text-muted);line-height:1.5">Não temos uma faixa de referência para "${escapeHtml(pet.breed || "essa raça")}" (comum em pets sem raça definida, já que o porte varia muito). Para avaliar o peso, o ideal é o médico-veterinário fazer o escore de condição corporal (palpação de costelas e cintura).</p>
        </div>`;
      return div;
    }

    const { min, max } = range;
    let status, color, bg;
    if (currentWeight < min) { status = "Abaixo da faixa esperada para a raça"; color = "var(--peach)"; bg = "var(--peach-soft)"; }
    else if (currentWeight > max) { status = "Acima da faixa esperada para a raça"; color = "var(--red)"; bg = "var(--red-soft)"; }
    else { status = "Dentro da faixa esperada para a raça"; color = "var(--mint)"; bg = "var(--mint-soft)"; }

    const dMin = min * 0.6, dMax = max * 1.4;
    const pos = (v) => Math.max(0, Math.min(100, ((v - dMin) / (dMax - dMin)) * 100));
    const zoneLeft = pos(min), zoneRight = pos(max);
    const markerPos = pos(currentWeight);

    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span style="font-size:13px;font-weight:700;padding:4px 10px;border-radius:var(--radius-pill);background:${bg};color:${color}">${status}</span>
      </div>
      <div class="weight-gauge">
        <div class="weight-gauge-track">
          <div class="weight-gauge-zone" style="left:${zoneLeft}%;width:${zoneRight - zoneLeft}%"></div>
          <div class="weight-gauge-marker" style="left:${markerPos}%;background:${color}"></div>
        </div>
        <div class="weight-gauge-labels"><span>${min} kg</span><span>${max} kg</span></div>
      </div>
      <p style="font-size:11.5px;color:var(--text-faint);line-height:1.4;margin-top:10px">Faixa de referência geral para a raça em adultos. Não substitui o escore de condição corporal avaliado por um médico-veterinário.</p>`;
    return div;
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
    const readOnly = !!pet.neutered;

    if (readOnly) {
      const banner = document.createElement("div");
      banner.className = "heat-banner";
      banner.style.background = "linear-gradient(135deg, var(--mint-soft), var(--mint-soft))";
      banner.innerHTML = `${ICONS.check}<div><div class="t" style="color:var(--mint)">Pet castrada</div><div class="s">Não são esperados novos ciclos de cio. O histórico abaixo é só para consulta.</div></div>`;
      content.appendChild(banner);
    }

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
      if (!readOnly) {
        banner.innerHTML = `${ICONS.heart}<div><div class="t">${sinceDays} dia${sinceDays === 1 ? "" : "s"} desde o último início</div><div class="s">Último cio em ${fmtDate(last.startDate)}${intervalTxt}</div></div>`;
        content.appendChild(banner);
      }
    }
    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      if (readOnly) {
        empty.innerHTML = `
          <div class="paw-stack">${ICONS.check.replace("<svg", '<svg style="width:42px;height:42px;stroke:var(--mint);fill:none"')}</div>
          <h3>Nenhum ciclo registrado</h3>
          <p>Este pet está marcado como castrado — não há histórico de cio para mostrar.</p>`;
      } else {
        empty.innerHTML = `
          <div class="paw-stack">${ICONS.heart.replace("<svg", '<svg style="width:42px;height:42px;stroke:var(--pink-soft);fill:none"')}</div>
          <h3>Nenhum ciclo registrado</h3>
          <p>Registre as datas de cio para acompanhar o ciclo da sua pet.</p>
          <button class="btn btn-primary" id="btn-add-rec">${ICONS.plus} Registrar cio</button>`;
      }
      content.appendChild(empty);
      if (!readOnly) empty.querySelector("#btn-add-rec").addEventListener("click", () => openRecordForm("heat", pet.id, null));
      return;
    }
    if (readOnly) {
      const title = document.createElement("div");
      title.className = "section-title";
      title.textContent = "Histórico (somente visualização)";
      content.appendChild(title);
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
        ${readOnly ? "" : `<button class="record-menu-btn" aria-label="Editar">${ICONS.dots}</button>`}`;
      if (!readOnly) {
        const openEdit = () => openRecordForm("heat", pet.id, rec);
        div.querySelector(".record-menu-btn").addEventListener("click", openEdit);
        div.querySelector(".record-body").addEventListener("click", openEdit);
      }
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
    const active = meds.filter((m) => m.doses.some(isDosePending));
    const done = meds.filter((m) => !m.doses.some(isDosePending));
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
    const doneCount = med.doses.filter(isDoseDone).length;
    const missedCount = med.doses.filter(isDoseMissed).length;
    const total = med.doses.length;
    const next = med.doses.find(isDosePending);
    const unit = med.doseUnit || MED_FORM_UNITS[med.form] || "dose(s)";
    const pct = Math.round((doneCount / total) * 100);
    const div = document.createElement("div");
    div.className = "record";
    const startD = new Date(med.startDateTime);
    let nextHtml = "";
    if (next) {
      const expired = isPendingExpired(next, med.frequencyHours);
      const overdue = new Date(next.scheduledAt) < new Date();
      const color = expired ? "var(--red)" : overdue ? "var(--peach)" : "var(--pink-strong)";
      const txt = expired ? "Pendente, provavelmente não aplicada — " : overdue ? "Atrasada — " : "Próxima dose: ";
      nextHtml = `<hr class="record-divider"><div class="record-next" style="color:${color}">${ICONS.clock} ${txt}${fmtDateTime(next.scheduledAt)}</div>`;
    } else {
      const extra = missedCount > 0 ? ` (${missedCount} não aplicada${missedCount === 1 ? "" : "s"})` : "";
      nextHtml = `<hr class="record-divider"><div class="record-next" style="color:var(--mint)">${ICONS.check} Tratamento concluído${extra}</div>`;
    }
    div.innerHTML = `
      <div class="record-stamp"><span class="d">${pad(startD.getDate())}</span><span class="m">${MONTHS_ABBR[startD.getMonth()]}</span></div>
      <div class="record-body">
        <h4>${escapeHtml(med.name)}</h4>
        <div class="sub">${med.doseAmount} ${unit} · a cada ${med.frequencyHours}h</div>
        <div class="sub">${doneCount} de ${total} doses aplicadas (${pct}%)${missedCount > 0 ? ` · ${missedCount} não aplicada${missedCount === 1 ? "" : "s"}` : ""}</div>
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
        const next = med.doses.find(isDosePending);
        if (!next) return;
        const overdue = new Date(next.scheduledAt) < new Date();
        const expired = isPendingExpired(next, med.frequencyHours);
        medItems.push({ pet, med, next, overdue, expired });
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
    const { pet, med, next, overdue, expired } = it;
    const div = document.createElement("div");
    div.className = "pet-card";
    const metaColor = expired ? "color:var(--red);font-weight:700" : overdue ? "color:var(--peach);font-weight:700" : "";
    const metaTxt = expired ? "Provavelmente não aplicada — " : overdue ? "Atrasada — " : "";
    div.innerHTML = `
      ${pet.photo ? `<img class="pet-avatar" style="width:46px;height:46px" src="${pet.photo}" alt="">` : `<div class="pet-avatar placeholder" style="width:46px;height:46px">${pet.species === "cat" ? ICONS.cat : ICONS.dog}</div>`}
      <div class="pet-card-info">
        <h3 style="font-size:15px">${escapeHtml(med.name)}</h3>
        <div class="meta" style="${metaColor}">${escapeHtml(pet.name)} · ${metaTxt}${fmtDateTime(next.scheduledAt)}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-sm btn-primary" id="quick-dose-btn" aria-label="Marcar como aplicada">${ICONS.check}</button>
        <button class="btn btn-sm btn-danger" id="quick-miss-btn" aria-label="Marcar como não aplicada">${ICONS.close}</button>
      </div>`;
    div.querySelector(".pet-card-info").addEventListener("click", () => navigate(`#/pet/${pet.id}/medication`));
    div.querySelector("#quick-dose-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      setDoseStatus(next, "done");
      await dbPut("records", med);
      await loadAll();
      toast("Dose marcada como aplicada!");
      render();
    });
    div.querySelector("#quick-miss-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      setDoseStatus(next, "missed");
      await dbPut("records", med);
      await loadAll();
      toast("Dose marcada como não aplicada");
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
    <div class="pet-card-info" style="cursor:pointer">
      <h3 style="font-size:15px">${escapeHtml(title)}</h3>
      <div class="meta">${escapeHtml(pet.name)} · ${cfg.title} · ${fmtDate(rec.nextDate)}</div>
    </div>
    <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
      <span class="chip" style="background:transparent;color:${color};font-weight:800">${txt}</span>
      <button class="btn btn-sm btn-secondary cal-btn" aria-label="Agendar no calendário" style="padding:6px 8px;font-size:16px">📅</button>
    </div>`;
  div.querySelector(".pet-card-info").addEventListener("click", () => navigate(`#/pet/${pet.id}/${rec.category}`));
  div.querySelector(".cal-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    openCalendarModal(pet.name, title, rec.nextDate, rec.notes || "");
  });
  return div;
}

  /* ================================ AJUSTES ==================================== */
  function renderSettings(main) {
    const tutor = getTutor();
    const profTitle = document.createElement("div");
    profTitle.className = "section-title";
    profTitle.textContent = "Meu perfil";
    main.appendChild(profTitle);

    const profCard = document.createElement("div");
    profCard.className = "card";
    profCard.style.marginBottom = "18px";
    const profSub = tutor
      ? ([tutor.city, tutor.email, tutor.phone].filter(Boolean).join(" · ") || "Toque para editar seus dados")
      : "Adicione seu nome e sua foto";
    profCard.innerHTML = `
      <div class="profile-row" id="profile-open" role="button" aria-label="${tutor ? "Editar perfil" : "Criar meu perfil"}">
        ${tutor && tutor.photo ? `<img class="profile-avatar" src="${tutor.photo}" alt="Foto do tutor">` : `<div class="profile-avatar placeholder">${ICONS.user}</div>`}
        <div style="flex:1;min-width:0">
          <div style="font-size:16px;font-weight:700">${tutor ? escapeHtml(tutor.name) : "Criar meu perfil"}</div>
          <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(profSub)}</div>
        </div>
        <span class="chevron">${ICONS.chevronRight}</span>
      </div>`;
    main.appendChild(profCard);
    profCard.querySelector("#profile-open").addEventListener("click", () => openTutorForm());

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
          Gere um resumo em PDF com vacinas, consultas, exames, cirurgias, antipulgas, vermífugos, peso e medicamentos — pronto para mostrar ou enviar ao médico-veterinário.
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

    const driveTitle = document.createElement("div");
    driveTitle.className = "section-title";
    driveTitle.textContent = "Backup automático (Google Drive)";
    main.appendChild(driveTitle);

    const driveCard = document.createElement("div");
    driveCard.className = "card";
    const driveConnected = isDriveConnected();
    const driveLast = getDriveLastBackup();
    const driveLastText = driveLast ? `Último backup: ${new Date(driveLast).toLocaleString("pt-BR")}` : "Ainda sem backup enviado";

    if (!isDriveConfigured()) {
      driveCard.innerHTML = `<p style="font-size:13.5px;color:var(--text-muted);line-height:1.5">
        Esse recurso ainda não foi configurado (falta o Client ID do Google no código). Veja o README do projeto para ativar em poucos minutos.
      </p>`;
    } else {
      driveCard.innerHTML = `
        <p style="font-size:13.5px;color:var(--text-muted);line-height:1.5;margin-bottom:14px">
          Conecte sua conta Google para o PataCare enviar um backup para o Google Drive automaticamente sempre que você abrir o app (no máximo 1x por dia).
        </p>
        ${driveConnected ? `<p style="font-size:13px;color:var(--mint);margin-bottom:12px">✓ Conectado — ${escapeHtml(driveLastText)}</p>` : ""}
        <button class="btn btn-primary btn-block" id="btn-drive-toggle" style="margin-bottom:10px">${driveConnected ? "Desconectar Google Drive" : `${ICONS.backup} Conectar Google Drive`}</button>
        ${driveConnected ? `<button class="btn btn-secondary btn-block" id="btn-drive-now" style="margin-bottom:10px">Fazer backup agora</button>
        <button class="btn btn-secondary btn-block" id="btn-drive-restore">Restaurar do Google Drive</button>` : ""}`;
    }
    main.appendChild(driveCard);

    if (isDriveConfigured()) {
      driveCard.querySelector("#btn-drive-toggle").addEventListener("click", async () => {
        if (driveConnected) { await driveDisconnect(); } else { await driveConnect(); }
        main.innerHTML = "";
        renderSettings(main);
      });
      if (driveConnected) {
        driveCard.querySelector("#btn-drive-now").addEventListener("click", async () => {
          try {
            await driveUploadBackup(false);
            toast("Backup enviado ao Google Drive!");
          } catch (err) {
            toast("Não foi possível enviar o backup");
          }
          main.innerHTML = "";
          renderSettings(main);
        });
        driveCard.querySelector("#btn-drive-restore").addEventListener("click", driveRestoreFlow);
      }
    }

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
<html lang="pt-BR"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>Relatório PataCare</title>
<style>
  *{ box-sizing: border-box; }
  html{ -webkit-text-size-adjust: 100%; }
  body{ font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color:#2b2b2b; max-width:780px; width:100%; margin:0 auto; padding:28px 24px 60px; overflow-x:hidden; }
  h1{ font-size:22px; margin:0 0 2px; color:#C23A6B; }
  .gen{ font-size:11.5px; color:#888; margin-bottom:22px; }
  .pet-block{ max-width:100%; }
  .pet-block h2{ font-size:18px; border-bottom:2px solid #F2598A; padding-bottom:6px; margin-top:0; word-wrap:break-word; }
  .pet-meta{ font-size:13px; color:#555; margin-bottom:16px; word-wrap:break-word; }
  h3{ font-size:14px; color:#C23A6B; margin:20px 0 6px; }
  table{ width:100%; max-width:100%; border-collapse: collapse; font-size:12.5px; margin-bottom:6px; table-layout:auto; }
  th{ text-align:left; background:#FFEFF3; padding:6px 8px; font-weight:700; color:#3A2236; border-bottom:1px solid #eee; overflow-wrap:anywhere; }
  td{ padding:6px 8px; border-bottom:1px solid #f0f0f0; vertical-align:top; overflow-wrap:break-word; word-break:break-word; }
  .empty{ font-size:12.5px; color:#999; font-style:italic; padding:4px 8px 14px; }
  .footer{ margin-top:36px; font-size:11px; color:#999; border-top:1px solid #eee; padding-top:12px; line-height:1.5; }
  .print-bar{ position:sticky; top:0; background:#fff; padding:10px 0 16px; text-align:right; }
  .print-bar button{ background:#F2598A; color:#fff; border:none; padding:10px 18px; border-radius:20px; font-weight:700; font-size:13px; cursor:pointer; }
  @media (max-width: 480px){
    body{ padding:18px 14px 48px; }
    h1{ font-size:19px; }
    table{ font-size:11.5px; }
    th, td{ padding:5px 6px; }
  }
  @media print{
    .print-bar{ display:none; }
    body{ padding:0 4mm; max-width:100%; }
    @page{ margin: 12mm; }
  }
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
    const consultations = recordsFor(pet.id, "consultation");
    const exams = recordsFor(pet.id, "exam");
    const surgeries = recordsFor(pet.id, "surgery");

    function table(headers, rows) {
      if (rows.length === 0) return `<div class="empty">Nenhum registro.</div>`;
      return `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    }
    // valores curtos (datas, doses, pesos) não devem quebrar no meio — só o texto livre (nome/produto/observações) quebra
    function nw(s) { return `<span style="white-space:nowrap">${s}</span>`; }

    const vacRows = vac.map((r) => [
      escapeHtml(r.vaccineType && r.vaccineType !== "outra" ? vaccineTypeLabel(r.vaccineType) : (r.name || "Vacina")),
      nw(fmtDate(r.date)),
      nw(escapeHtml(r.doseNumber ? (r.isBooster ? "Reforço anual" : `Dose ${r.doseNumber}`) : "—")),
      nw(r.nextDate ? fmtDate(r.nextDate) : "—")
    ]);
    const antiRows = anti.map((r) => [escapeHtml(r.product), nw(fmtDate(r.date)), nw(r.nextDate ? fmtDate(r.nextDate) : "—")]);
    const dermRows = derm.map((r) => [escapeHtml(r.product), nw(fmtDate(r.date)), nw(r.nextDate ? fmtDate(r.nextDate) : "—")]);
    const weightRows = weights.slice(0, 12).map((r) => [nw(fmtDate(r.date)), nw(r.weight + " kg"), escapeHtml(r.notes || "")]);
    const heatRows = heat.map((r) => [nw(fmtDate(r.startDate)), nw(r.endDate ? fmtDate(r.endDate) : "Em andamento")]);
    const medRows = meds.map((m) => {
      const done = m.doses.filter(isDoseDone).length;
      const missed = m.doses.filter(isDoseMissed).length;
      const progress = `${done}/${m.doses.length} aplicadas${missed > 0 ? ` · ${missed} não aplicada${missed === 1 ? "" : "s"}` : ""}`;
      return [escapeHtml(m.name), nw(`${m.doseAmount} ${escapeHtml(m.doseUnit || "")} a cada ${m.frequencyHours}h`), nw(progress)];
    });
    const consultRows = consultations.map((r) => [
      nw(fmtDate(r.date)), escapeHtml(r.vet || "—") + (r.crm ? ` <span style="white-space:nowrap;color:#999">(CRMV ${escapeHtml(r.crm)})</span>` : ""), escapeHtml(r.reason || "—"),
      nw(r.hasReturn && r.nextDate ? fmtDate(r.nextDate) : "—")
    ]);
    const examRows = exams.map((r) => [
      escapeHtml(r.examType || "Exame"), nw(fmtDate(r.date)), escapeHtml(r.vet || "—") + (r.crm ? ` <span style="white-space:nowrap;color:#999">(CRMV ${escapeHtml(r.crm)})</span>` : ""),
      nw(r.attachments && r.attachments.length ? `${r.attachments.length} anexo${r.attachments.length === 1 ? "" : "s"} (ver no app)` : "—")
    ]);
    const surgeryRows = surgeries.map((r) => [
      escapeHtml(r.surgeryType || "Cirurgia"), nw(fmtDate(r.date)), escapeHtml(r.vet || "—") + (r.crm ? ` <span style="white-space:nowrap;color:#999">(CRMV ${escapeHtml(r.crm)})</span>` : ""),
      nw(r.attachments && r.attachments.length ? `${r.attachments.length} anexo${r.attachments.length === 1 ? "" : "s"} (ver no app)` : "—")
    ]);

    return `
      <div class="pet-block">
        <h2>${escapeHtml(pet.name)}</h2>
        <div class="pet-meta">${pet.species === "cat" ? "Gato" : pet.species === "dog" ? "Cão" : "Outro"} · ${escapeHtml(pet.breed || "Raça não informada")} · ${pet.sex === "F" ? "Fêmea" : "Macho"} · ${pet.neutered ? "Castrado(a)" : "Não castrado(a)"}${pet.birthDate ? " · Nascimento: " + fmtDate(pet.birthDate) + " (" + calcAge(pet.birthDate) + ")" : ""}${pet.microchip ? " · Microchip: " + escapeHtml(pet.microchip) : ""}</div>

        <h3>Vacinas</h3>
        ${table(["Vacina", "Data", "Dose", "Próxima"], vacRows)}

        <h3>Consultas</h3>
        ${table(["Data", "Veterinário(a)", "Motivo", "Retorno"], consultRows)}

        <h3>Exames</h3>
        ${table(["Exame", "Data", "Veterinário(a)/Clínica", "Anexos"], examRows)}

        <h3>Cirurgias</h3>
        ${table(["Cirurgia", "Data", "Veterinário(a)/Clínica", "Anexos"], surgeryRows)}

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

  /* ======================= BACKUP AUTOMÁTICO — GOOGLE DRIVE ======================
     Como funciona: usamos o Google Identity Services (GIS) para autenticar no
     navegador (sem servidor próprio) e a Drive API v3 com o escopo "drive.file",
     que só dá acesso a arquivos/pastas que o próprio PataCare cria — nada além
     disso é visível para o app.
     O backup fica salvo numa pasta "PataCare Backups" no Google Drive do usuário,
     num único arquivo que é sobrescrito a cada novo backup (não sensível, mesmo
     não fica publicado/verificado pelo Google).
     Troque GOOGLE_CLIENT_ID pelo Client ID gerado no Google Cloud Console. ------- */
  const GOOGLE_CLIENT_ID = "696715565459-hs6qitu4aqok7410ual5agq54o4s7igo.apps.googleusercontent.com";
  const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
  const DRIVE_FOLDER_NAME = "PataCare Backups";
  const DRIVE_FILE_NAME = "patacare-backup.json";
  const DRIVE_CONNECTED_KEY = "patacare-drive-connected";
  const DRIVE_LAST_BACKUP_KEY = "patacare-drive-last-backup";

  let gTokenClient = null;
  let gAccessToken = null;
  let gTokenExpiresAt = 0;

  function isDriveConfigured() {
    return !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith("SEU_CLIENT_ID");
  }
  function isDriveConnected() {
    return localStorage.getItem(DRIVE_CONNECTED_KEY) === "1";
  }
  function getDriveLastBackup() {
    return localStorage.getItem(DRIVE_LAST_BACKUP_KEY);
  }

  function ensureGTokenClient() {
    if (gTokenClient) return gTokenClient;
    if (!window.google || !google.accounts || !google.accounts.oauth2) return null;
    gTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: () => {}, // sobrescrito a cada chamada de requestDriveToken
    });
    return gTokenClient;
  }

  function requestDriveToken(silent) {
    return new Promise((resolve, reject) => {
      const client = ensureGTokenClient();
      if (!client) { reject(new Error("Google Identity Services ainda não carregou")); return; }
      client.callback = (resp) => {
        if (resp && resp.error) { reject(new Error(resp.error)); return; }
        gAccessToken = resp.access_token;
        gTokenExpiresAt = Date.now() + (Number(resp.expires_in) || 3500) * 1000;
        resolve(gAccessToken);
      };
      try {
        client.requestAccessToken({ prompt: silent ? "" : "consent" });
      } catch (err) {
        reject(err);
      }
    });
  }

  async function getDriveToken(silent) {
    if (gAccessToken && Date.now() < gTokenExpiresAt - 30000) return gAccessToken;
    return requestDriveToken(silent);
  }

  async function driveApiFetch(url, options, silent) {
    const token = await getDriveToken(silent);
    const res = await fetch(url, {
      ...(options || {}),
      headers: { ...((options && options.headers) || {}), Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Drive API ${res.status}: ${text}`);
    }
    return res;
  }

  async function driveFindOrCreateFolder(silent) {
    const q = encodeURIComponent(`name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const listRes = await driveApiFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {}, silent);
    const listData = await listRes.json();
    if (listData.files && listData.files.length > 0) return listData.files[0].id;
    const createRes = await driveApiFetch(`https://www.googleapis.com/drive/v3/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: DRIVE_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
    }, silent);
    const createData = await createRes.json();
    return createData.id;
  }

  async function driveFindFile(folderId, silent) {
    const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and '${folderId}' in parents and trashed=false`);
    const res = await driveApiFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)`, {}, silent);
    const data = await res.json();
    return (data.files && data.files[0]) || null;
  }

  function buildBackupData() {
    return { app: "patacare", version: 1, exportedAt: new Date().toISOString(), pets: STATE.pets, records: STATE.records, tutor: getTutor() };
  }

  async function driveUploadBackup(silent) {
    const folderId = await driveFindOrCreateFolder(silent);
    const existing = await driveFindFile(folderId, silent);
    const data = buildBackupData();
    const metadata = existing ? { name: DRIVE_FILE_NAME } : { name: DRIVE_FILE_NAME, parents: [folderId] };
    const boundary = "patacare-" + Date.now();
    const body =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n` +
      `--${boundary}--`;
    const url = existing
      ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
    await driveApiFetch(url, {
      method: existing ? "PATCH" : "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    }, silent);
    localStorage.setItem(DRIVE_LAST_BACKUP_KEY, new Date().toISOString());
  }

  async function driveDownloadBackup(silent) {
    const folderId = await driveFindOrCreateFolder(silent);
    const existing = await driveFindFile(folderId, silent);
    if (!existing) throw new Error("Nenhum backup encontrado no Google Drive ainda.");
    const res = await driveApiFetch(`https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`, {}, silent);
    return res.json();
  }

  async function driveConnect() {
    try {
      await getDriveToken(false); // abre o consentimento do Google
      localStorage.setItem(DRIVE_CONNECTED_KEY, "1");
      await driveUploadBackup(true);
      toast("Google Drive conectado e backup enviado!");
    } catch (err) {
      toast("Não foi possível conectar ao Google Drive");
    }
  }

  async function driveDisconnect() {
    const ok = await confirmDialog({ title: "Desconectar Google Drive?", message: "O backup automático será desativado neste aparelho. O arquivo que já está salvo no seu Google Drive não será apagado.", confirmLabel: "Desconectar", danger: true });
    if (!ok) return;
    if (gAccessToken && window.google && google.accounts && google.accounts.oauth2) {
      try { google.accounts.oauth2.revoke(gAccessToken, () => {}); } catch (err) {}
    }
    gAccessToken = null;
    gTokenExpiresAt = 0;
    localStorage.removeItem(DRIVE_CONNECTED_KEY);
    toast("Google Drive desconectado");
  }

  async function driveRestoreFlow() {
    try {
      const data = await driveDownloadBackup(false);
      if (!data || !Array.isArray(data.pets) || !Array.isArray(data.records)) throw new Error("formato inválido");
      const ok = await confirmDialog({ title: "Restaurar do Google Drive?", message: "Isso vai substituir todos os dados atuais deste dispositivo pelos dados do backup salvo no Google Drive.", confirmLabel: "Restaurar e substituir", danger: true });
      if (!ok) return;
      await dbClear("pets"); await dbClear("records");
      for (const p of data.pets) await dbPut("pets", p);
      for (const r of data.records) await dbPut("records", r);
      if (data.tutor && typeof data.tutor === "object" && data.tutor.name) saveTutor(data.tutor);
      await loadAll();
      toast("Dados restaurados do Google Drive!");
      navigate("#/");
    } catch (err) {
      toast("Não foi possível restaurar do Google Drive");
    }
  }

  // Chamado uma vez ao abrir o app: se já estiver conectado, faz backup silencioso
  // (sem popup) no máximo uma vez por dia.
  async function driveAutoBackupOnOpen() {
    if (!isDriveConfigured() || !isDriveConnected()) return;
    const last = getDriveLastBackup();
    const today = new Date().toDateString();
    if (last && new Date(last).toDateString() === today) return;
    try {
      await driveUploadBackup(true);
    } catch (err) {
      // Silencioso: se a sessão expirou ou não há rede, apenas não faz nada agora.
      // O usuário pode tocar em "Fazer backup agora" nos Ajustes quando quiser.
    }
  }

  function exportBackup() {
    loadAll().then(() => {
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
        if (data.tutor && typeof data.tutor === "object" && data.tutor.name) saveTutor(data.tutor);
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
      <div class="field">
        <label>Espécie</label>
        <div class="seg" id="seg-species">
          <button data-v="dog" type="button">Cão</button>
          <button data-v="cat" type="button">Gato</button>
          <button data-v="other" type="button">Outro</button>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Sexo</label>
          <div class="seg" id="seg-sex">
            <button data-v="M" type="button">Macho</button>
            <button data-v="F" type="button">Fêmea</button>
          </div>
        </div>
        <div class="field">
          <label>Castrado(a)?</label>
          <div class="seg" id="seg-neutered">
            <button data-v="0" type="button">Não</button>
            <button data-v="1" type="button">Sim</button>
          </div>
        </div>
      </div>
      <div class="field">
        <label>Raça</label>
        <input type="text" id="f-breed" placeholder="Ex: SRD, Poodle..." value="${existing ? escapeHtml(existing.breed || "") : ""}">
      </div>
      <div class="field">
        <label>Data de nascimento</label>
        <input type="date" id="f-birth" value="${existing ? existing.birthDate || "" : ""}">
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
    setSeg("seg-neutered", existing && existing.neutered ? "1" : "0");
    sheet.querySelectorAll("#seg-species button").forEach((b) => b.addEventListener("click", () => setSeg("seg-species", b.dataset.v)));
    sheet.querySelectorAll("#seg-sex button").forEach((b) => b.addEventListener("click", () => setSeg("seg-sex", b.dataset.v)));
    sheet.querySelectorAll("#seg-neutered button").forEach((b) => b.addEventListener("click", () => setSeg("seg-neutered", b.dataset.v)));

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
      const neutered = sheet.querySelector("#seg-neutered .active").dataset.v === "1";
      const breed = sheet.querySelector("#f-breed").value.trim();
      const birthDate = sheet.querySelector("#f-birth").value;
      const microchip = sheet.querySelector("#f-microchip").value.trim();
      const notes = sheet.querySelector("#f-notes").value.trim();
      const pet = existing ? Object.assign({}, existing) : { id: uid(), createdAt: Date.now() };
      Object.assign(pet, { name, species, sex, neutered, breed, birthDate, microchip, notes, photo: photoData });
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

  /* ========================== FORMULÁRIO: MEDIDAS (ROUPAS) =============================== */
  function openMeasurementsForm(pet) {
    const m = pet.measurements || {};
    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>Medidas de ${escapeHtml(pet.name)}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <p style="font-size:12.5px;color:var(--text-muted);line-height:1.5;margin:-4px 0 14px">Úteis na hora de comprar roupas, coleiras e peitorais. Meça com uma fita métrica, com o pet em pé.</p>
      <div class="field-row">
        <div class="field">
          <label>Pescoço (cm)</label>
          <input type="number" inputmode="decimal" step="0.5" id="me-neck" placeholder="Ex: 32" value="${m.neck || ""}">
        </div>
        <div class="field">
          <label>Peito/Tórax (cm)</label>
          <input type="number" inputmode="decimal" step="0.5" id="me-chest" placeholder="Ex: 45" value="${m.chest || ""}">
        </div>
      </div>
      <div class="field">
        <label>Comprimento do dorso (cm)</label>
        <input type="number" inputmode="decimal" step="0.5" id="me-length" placeholder="Ex: 38" value="${m.length || ""}">
        <p style="font-size:11.5px;color:var(--text-faint);line-height:1.4;margin-top:6px">Do ponto mais alto da base do pescoço até a base do rabo.</p>
      </div>
      <div class="field">
        <label>Observações</label>
        <textarea id="me-notes" placeholder="Ex: veste roupa tamanho P, coleira ajustada no 3º furo...">${escapeHtml(m.notes || "")}</textarea>
      </div>
      <button class="btn btn-primary btn-block" id="me-save">${ICONS.check} Salvar</button>
      ${(m.neck || m.chest || m.length || m.notes) ? `<button class="btn btn-danger btn-block" id="me-clear" style="margin-top:10px">${ICONS.trash} Limpar medidas</button>` : ""}
    `);

    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelector("#me-save").addEventListener("click", async () => {
      const neck = sheet.querySelector("#me-neck").value.trim();
      const chest = sheet.querySelector("#me-chest").value.trim();
      const length = sheet.querySelector("#me-length").value.trim();
      const notes = sheet.querySelector("#me-notes").value.trim();
      if (!neck && !chest && !length && !notes) { toast("Informe pelo menos uma medida"); return; }

      const updated = Object.assign({}, pet);
      updated.measurements = {
        neck: neck ? Number(neck) : null,
        chest: chest ? Number(chest) : null,
        length: length ? Number(length) : null,
        notes,
        updatedAt: todayISO()
      };
      await dbPut("pets", updated);
      await loadAll();
      closeSheet();
      toast("Medidas salvas!");
      render();
    });

    const clearBtn = sheet.querySelector("#me-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", async () => {
        const ok = await confirmDialog({ title: "Limpar medidas?", message: "As medidas registradas para este pet serão removidas.", confirmLabel: "Limpar", danger: true });
        if (!ok) return;
        const updated = Object.assign({}, pet);
        delete updated.measurements;
        await dbPut("pets", updated);
        await loadAll();
        closeSheet();
        toast("Medidas removidas");
        render();
      });
    }
  }

  /* ========================== FORMULÁRIO: REGISTROS =============================== */
  const RECORD_FORMS = {
    antiparasitic: { title: "antipulgas/carrapatos", fields: [
      { key: "product", label: "Produto aplicado", type: "text", required: true, placeholder: "Ex: Bravecto, Simparic, NexGard...", suggest: true },
      { key: "date", label: "Data aplicada", type: "date", required: true },
      { key: "nextDate", label: "Próxima aplicação (opcional)", type: "date" },
      { key: "notes", label: "Observações", type: "textarea" }
    ]},
    dewormer: { title: "vermífugo", fields: [
      { key: "product", label: "Vermífugo aplicado", type: "text", required: true, placeholder: "Ex: Drontal, Vermivet...", suggest: true },
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

  // Sugestões de preenchimento: valores já usados antes para o mesmo campo/categoria (entre todos os pets)
  function distinctValues(category, key) {
    const recs = STATE.records.filter((r) => r.category === category && r[key])
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const seen = new Set();
    const out = [];
    recs.forEach((r) => {
      const v = r[key];
      if (!seen.has(v)) { seen.add(v); out.push(v); }
    });
    return out;
  }

  function fieldHtml(f, value, suggestions) {
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
    if (f.type === "text" && suggestions && suggestions.length) {
      const listId = "dl-" + f.key;
      return `<div class="field"><label>${f.label}</label><input type="text" list="${listId}" id="rf-${f.key}" placeholder="${f.placeholder || ""}" value="${escapeHtml(v)}" autocomplete="off"><datalist id="${listId}">${suggestions.map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist></div>`;
    }
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
        <input type="text" id="vf-name" list="dl-vf-name" autocomplete="off" placeholder="Ex: Leptospirose extra, Polivalente felina..." value="${existing ? escapeHtml(existing.name || "") : ""}">
        <datalist id="dl-vf-name">${distinctValues("vaccine", "name").map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
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

    const fieldsHtml = cfg.fields.map((f) => fieldHtml(f, existing ? existing[f.key] : defaults[f.key], f.suggest ? distinctValues(category, f.key) : null)).join("");
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

  /* ========================== FORMULÁRIO: EXAME =============================== */
  const EXAM_TYPE_SUGGESTIONS = ["Raio-X", "Ultrassom", "Hemograma completo", "Exame de sangue (bioquímico)", "Urinálise", "Ecocardiograma", "Eletrocardiograma", "Tomografia", "Ressonância magnética", "Endoscopia", "Citologia", "Parasitológico de fezes"];

  function openExamForm(petId, existing) {
    const isEdit = !!existing;
    const today = todayISO();
    const examSuggestions = [...new Set([...EXAM_TYPE_SUGGESTIONS, ...distinctValues("exam", "examType")])];

    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${isEdit ? "Editar exame" : "Novo exame"}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <div class="field">
        <label>Tipo de exame</label>
        <input type="text" list="dl-exam-type" id="ex-type" autocomplete="off" placeholder="Ex: Raio-X, Ultrassom, Hemograma..." value="${existing ? escapeHtml(existing.examType || "") : ""}">
        <datalist id="dl-exam-type">${examSuggestions.map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
      </div>
      <div class="field">
        <label>Data do exame</label>
        <input type="date" id="ex-date" value="${existing ? existing.date : today}">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Veterinário(a)/Clínica (opcional)</label>
          <input type="text" list="dl-exam-vet" id="ex-vet" autocomplete="off" placeholder="Ex: Dra. Ana Souza / Clínica PetVida" value="${existing ? escapeHtml(existing.vet || "") : ""}">
          <datalist id="dl-exam-vet">${distinctValues("exam", "vet").map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
        </div>
        <div class="field" style="max-width:130px">
          <label>CRMV (opcional)</label>
          <input type="text" list="dl-exam-crm" id="ex-crm" autocomplete="off" placeholder="Ex: SP-12345" value="${existing ? escapeHtml(existing.crm || "") : ""}">
          <datalist id="dl-exam-crm">${distinctValues("exam", "crm").map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
        </div>
      </div>
      <div class="field">
        <label>Resultado / Observações</label>
        <textarea id="ex-notes" placeholder="Resultado do exame, observações do veterinário...">${existing ? escapeHtml(existing.notes || "") : ""}</textarea>
      </div>
      <div class="field">
        <label>Anexos (imagens, PDF...)</label>
        <div id="rf-attach-list" class="attach-list"></div>
        <button type="button" class="attach-add-btn" id="rf-attach-add">${ICONS.paperclip} Adicionar imagem ou PDF</button>
        <input type="file" accept="image/*,application/pdf" multiple class="visually-hidden" id="rf-attach-input">
      </div>
      <button class="btn btn-primary btn-block" id="ex-save">${ICONS.check} Salvar</button>
      ${isEdit ? `<button class="btn btn-danger btn-block" id="ex-delete" style="margin-top:10px">${ICONS.trash} Excluir registro</button>` : ""}
    `);

    const attachCtrl = setupAttachmentField(sheet, existing ? existing.attachments : []);

    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelector("#ex-save").addEventListener("click", async () => {
      const examType = sheet.querySelector("#ex-type").value.trim();
      const date = sheet.querySelector("#ex-date").value;
      const vet = sheet.querySelector("#ex-vet").value.trim();
      const crm = sheet.querySelector("#ex-crm").value.trim();
      const notes = sheet.querySelector("#ex-notes").value.trim();
      if (!examType) { toast("Informe o tipo de exame"); return; }
      if (!date) { toast("Informe a data do exame"); return; }

      const rec = existing ? Object.assign({}, existing) : { id: uid(), petId, category: "exam", createdAt: Date.now() };
      Object.assign(rec, { examType, date, vet, crm, notes, attachments: attachCtrl.getAttachments() });
      await dbPut("records", rec);
      await loadAll();
      closeSheet();
      toast(isEdit ? "Exame atualizado!" : "Exame registrado!");
      render();
    });

    if (isEdit) {
      sheet.querySelector("#ex-delete").addEventListener("click", async () => {
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

  /* ========================== FORMULÁRIO: CONSULTA =============================== */
  function openConsultationForm(petId, existing) {
    const isEdit = !!existing;
    const today = todayISO();
    const hasReturnInitial = !!(existing && existing.nextDate);

    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${isEdit ? "Editar consulta" : "Nova consulta"}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <div class="field">
        <label>Data da consulta</label>
        <input type="date" id="co-date" value="${existing ? existing.date : today}">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Veterinário(a)/Dr(a).</label>
          <input type="text" list="dl-co-vet" id="co-vet" autocomplete="off" placeholder="Ex: Dr. João Lima" value="${existing ? escapeHtml(existing.vet || "") : ""}">
          <datalist id="dl-co-vet">${distinctValues("consultation", "vet").map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
        </div>
        <div class="field" style="max-width:130px">
          <label>CRMV (opcional)</label>
          <input type="text" list="dl-co-crm" id="co-crm" autocomplete="off" placeholder="Ex: SP-12345" value="${existing ? escapeHtml(existing.crm || "") : ""}">
          <datalist id="dl-co-crm">${distinctValues("consultation", "crm").map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
        </div>
      </div>
      <div class="field">
        <label>Motivo da consulta (opcional)</label>
        <input type="text" id="co-reason" placeholder="Ex: Check-up, vômito, coceira..." value="${existing ? escapeHtml(existing.reason || "") : ""}">
      </div>
      <div class="field">
        <label>Observações / Diagnóstico</label>
        <textarea id="co-notes" placeholder="Diagnóstico, orientações, receita...">${existing ? escapeHtml(existing.notes || "") : ""}</textarea>
      </div>
      <div class="switch-row">
        <div>
          <div class="lbl">Agendar retorno?</div>
          <div class="sub">Habilite para definir uma data de retorno</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="co-has-return" ${hasReturnInitial ? "checked" : ""}>
          <span class="track"></span>
        </label>
      </div>
      <div class="field" id="co-return-field" style="${hasReturnInitial ? "" : "display:none"}">
        <label>Data de retorno</label>
        <input type="date" id="co-return-date" value="${existing && existing.nextDate ? existing.nextDate : ""}">
      </div>
      <button class="btn btn-primary btn-block" id="co-save">${ICONS.check} Salvar</button>
      ${isEdit ? `<button class="btn btn-danger btn-block" id="co-delete" style="margin-top:10px">${ICONS.trash} Excluir registro</button>` : ""}
    `);

    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelector("#co-has-return").addEventListener("change", (e) => {
      sheet.querySelector("#co-return-field").style.display = e.target.checked ? "" : "none";
    });

    sheet.querySelector("#co-save").addEventListener("click", async () => {
      const date = sheet.querySelector("#co-date").value;
      const vet = sheet.querySelector("#co-vet").value.trim();
      const crm = sheet.querySelector("#co-crm").value.trim();
      const reason = sheet.querySelector("#co-reason").value.trim();
      const notes = sheet.querySelector("#co-notes").value.trim();
      const hasReturn = sheet.querySelector("#co-has-return").checked;
      const returnDate = sheet.querySelector("#co-return-date").value;
      if (!date) { toast("Informe a data da consulta"); return; }
      if (!vet) { toast("Informe o veterinário(a)/Dr(a)."); return; }
      if (hasReturn && !returnDate) { toast("Informe a data de retorno ou desative a opção"); return; }

      const rec = existing ? Object.assign({}, existing) : { id: uid(), petId, category: "consultation", createdAt: Date.now() };
      Object.assign(rec, { date, vet, crm, reason, notes, hasReturn, nextDate: hasReturn ? returnDate : null });
      await dbPut("records", rec);
      await loadAll();
      closeSheet();
      toast(isEdit ? "Consulta atualizada!" : "Consulta registrada!");
      render();
    });

    if (isEdit) {
      sheet.querySelector("#co-delete").addEventListener("click", async () => {
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

  /* ========================== FORMULÁRIO: CIRURGIA =============================== */
  const SURGERY_TYPE_SUGGESTIONS = ["Castração (Orquiectomia)", "Castração (Ovário-histerectomia)", "Remoção de nódulo/tumor", "Cirurgia ortopédica", "Cirurgia odontológica", "Cesariana", "Correção de hérnia", "Limpeza de tártaro com anestesia", "Outra"];
  function isNeuterSurgeryType(s) {
    const t = normalizeBreedText(s);
    return /castr|orquiectomia|ovario.?histerectomia|ovariohisterectomia/.test(t);
  }

  function openSurgeryForm(petId, existing) {
    const isEdit = !!existing;
    const today = todayISO();
    const pet = getPet(petId);
    const petAlreadyNeutered = !!(pet && pet.neutered);
    const surgerySuggestions = [...new Set([...SURGERY_TYPE_SUGGESTIONS, ...distinctValues("surgery", "surgeryType")])];
    const markInitial = petAlreadyNeutered || (existing ? !!existing.markedNeutered : false);

    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${isEdit ? "Editar cirurgia" : "Nova cirurgia"}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <div class="field">
        <label>Tipo de cirurgia</label>
        <input type="text" list="dl-surgery-type" id="su-type" autocomplete="off" placeholder="Ex: Castração, remoção de nódulo..." value="${existing ? escapeHtml(existing.surgeryType || "") : ""}">
        <datalist id="dl-surgery-type">${surgerySuggestions.map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
      </div>
      <div class="field">
        <label>Data da cirurgia</label>
        <input type="date" id="su-date" value="${existing ? existing.date : today}">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Veterinário(a)/Clínica (opcional)</label>
          <input type="text" list="dl-surgery-vet" id="su-vet" autocomplete="off" placeholder="Ex: Dr. Carlos Melo / Clínica VetBem" value="${existing ? escapeHtml(existing.vet || "") : ""}">
          <datalist id="dl-surgery-vet">${distinctValues("surgery", "vet").map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
        </div>
        <div class="field" style="max-width:130px">
          <label>CRMV (opcional)</label>
          <input type="text" list="dl-surgery-crm" id="su-crm" autocomplete="off" placeholder="Ex: SP-12345" value="${existing ? escapeHtml(existing.crm || "") : ""}">
          <datalist id="dl-surgery-crm">${distinctValues("surgery", "crm").map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
        </div>
      </div>
      <div class="field">
        <label>Observações / Cuidados pós-operatórios</label>
        <textarea id="su-notes" placeholder="Recomendações, medicação pós-cirúrgica, retirada de pontos...">${existing ? escapeHtml(existing.notes || "") : ""}</textarea>
      </div>
      <div class="field">
        <label>Fotos / Anexos (laudo, PDF...)</label>
        <div id="rf-attach-list" class="attach-list"></div>
        <button type="button" class="attach-add-btn" id="rf-attach-add">${ICONS.paperclip} Adicionar foto ou PDF</button>
        <input type="file" accept="image/*,application/pdf" multiple class="visually-hidden" id="rf-attach-input">
      </div>
      <div class="switch-row" id="su-neuter-row" style="${petAlreadyNeutered ? "opacity:.6" : ""}">
        <div>
          <div class="lbl">Marcar pet como castrado(a)</div>
          <div class="sub">${petAlreadyNeutered ? "Este pet já está marcado como castrado(a)" : "Atualiza o cadastro do pet automaticamente"}</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="su-mark-neutered" ${markInitial ? "checked" : ""} ${petAlreadyNeutered ? "disabled" : ""}>
          <span class="track"></span>
        </label>
      </div>
      <button class="btn btn-primary btn-block" id="su-save">${ICONS.check} Salvar</button>
      ${isEdit ? `<button class="btn btn-danger btn-block" id="su-delete" style="margin-top:10px">${ICONS.trash} Excluir registro</button>` : ""}
    `);

    const attachCtrl = setupAttachmentField(sheet, existing ? existing.attachments : []);

    // Sugere marcar automaticamente como castrado(a) quando o tipo digitado indica isso
    sheet.querySelector("#su-type").addEventListener("input", (e) => {
      if (petAlreadyNeutered) return;
      const checkbox = sheet.querySelector("#su-mark-neutered");
      if (isNeuterSurgeryType(e.target.value)) checkbox.checked = true;
    });

    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelector("#su-save").addEventListener("click", async () => {
      const surgeryType = sheet.querySelector("#su-type").value.trim();
      const date = sheet.querySelector("#su-date").value;
      const vet = sheet.querySelector("#su-vet").value.trim();
      const crm = sheet.querySelector("#su-crm").value.trim();
      const notes = sheet.querySelector("#su-notes").value.trim();
      const markedNeutered = sheet.querySelector("#su-mark-neutered").checked;
      if (!surgeryType) { toast("Informe o tipo de cirurgia"); return; }
      if (!date) { toast("Informe a data da cirurgia"); return; }

      const rec = existing ? Object.assign({}, existing) : { id: uid(), petId, category: "surgery", createdAt: Date.now() };
      Object.assign(rec, { surgeryType, date, vet, crm, notes, markedNeutered, attachments: attachCtrl.getAttachments() });
      await dbPut("records", rec);

      if (markedNeutered && pet && !pet.neutered) {
        pet.neutered = true;
        await dbPut("pets", pet);
      }

      await loadAll();
      closeSheet();
      toast(isEdit ? "Cirurgia atualizada!" : "Cirurgia registrada!");
      render();
    });

    if (isEdit) {
      sheet.querySelector("#su-delete").addEventListener("click", async () => {
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
        <input type="text" id="mf-name" list="dl-mf-name" autocomplete="off" placeholder="Ex: Amoxicilina, Meloxicam..." value="${existing ? escapeHtml(existing.name) : ""}">
        <datalist id="dl-mf-name">${distinctValues("medication", "name").map((s) => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist>
      </div>
      <div class="field">
        <label>Forma de administração</label>
        <select id="mf-form">
          <option value="comprimido">Comprimido</option>
          <option value="gota">Gota</option>
          <option value="liquido">Líquido (ml)</option>
          <option value="injecao">Injeção</option>
          <option value="outro">Outra</option>
        </select>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Qtd. por dose</label>
          <input type="number" id="mf-amount" step="0.5" placeholder="Ex: 1" value="${existing ? existing.doseAmount : "1"}">
        </div>
        <div class="field">
          <label>A cada (horas)</label>
          <input type="number" id="mf-freq" step="1" placeholder="Ex: 8" value="${existing ? existing.frequencyHours : "8"}">
        </div>
      </div>
      <div class="field">
        <label>Início — data e hora da 1ª dose</label>
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

    sheet.querySelector('#mf-form').value = existing ? existing.form : "comprimido";

    if (!isEdit) {
      sheet.querySelector("#mf-name").addEventListener("change", (e) => {
        const typed = e.target.value.trim();
        const prev = STATE.records.filter((r) => r.category === "medication" && r.name === typed)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
        if (!prev) return;
        sheet.querySelector("#mf-form").value = prev.form;
        sheet.querySelector("#mf-amount").value = prev.doseAmount;
        sheet.querySelector("#mf-freq").value = prev.frequencyHours;
        toast("Preenchido com base no último uso de " + typed);
      });
    }

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
      const form = sheet.querySelector("#mf-form").value;
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
        // preserva doses já resolvidas (aplicadas ou marcadas como não aplicadas); recalcula só as pendentes
        const resolvedOnes = existing.doses.filter((d) => !isDosePending(d));
        if (resolvedOnes.length >= totalDoses) {
          doses = resolvedOnes.slice(0, totalDoses);
        } else {
          const newSchedule = buildMedicationDoses(startDateTime, frequencyHours, totalDoses);
          doses = resolvedOnes.concat(newSchedule.slice(resolvedOnes.length));
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
    const doneCount = med.doses.filter(isDoseDone).length;
    const missedCount = med.doses.filter(isDoseMissed).length;
    const rowsHtml = med.doses.map((d, i) => {
      const status = doseStatus(d);
      const overdue = status === "pending" && new Date(d.scheduledAt) < new Date();
      const expired = isPendingExpired(d, med.frequencyHours);
      let iconBg, iconHtml, subText, subStyle;
      if (status === "done") {
        iconBg = "var(--mint-soft)";
        iconHtml = `<span style="color:var(--mint);display:flex">${ICONS.check}</span>`;
        subText = "Aplicada em " + fmtDateTime(d.doneAt);
        subStyle = "";
      } else if (status === "missed") {
        iconBg = "var(--red-soft)";
        iconHtml = `<span style="color:var(--red);display:flex">${ICONS.close}</span>`;
        subText = "Marcada como não aplicada";
        subStyle = "color:var(--red);font-weight:700";
      } else {
        iconBg = expired ? "var(--red-soft)" : overdue ? "var(--peach-soft)" : "var(--surface-2)";
        iconHtml = `<span style="color:${expired ? "var(--red)" : overdue ? "var(--peach)" : "var(--pink-strong)"};display:flex">${ICONS.clock}</span>`;
        subText = (expired ? "Provavelmente não aplicada — prevista " : overdue ? "Atrasada — prevista " : "Prevista para ") + fmtDateTime(d.scheduledAt);
        subStyle = expired ? "color:var(--red);font-weight:700" : overdue ? "color:var(--peach);font-weight:700" : "";
      }
      const actionsHtml = status === "pending"
        ? `<button class="dose-act-btn ok" data-act="done" data-i="${i}" aria-label="Marcar como aplicada">${ICONS.check}</button>
           <button class="dose-act-btn bad" data-act="missed" data-i="${i}" aria-label="Marcar como não aplicada">${ICONS.close}</button>`
        : `<button class="dose-undo-btn" data-act="undo" data-i="${i}">Desfazer</button>`;
      return `
        <div class="settings-row med-dose-row">
          <div class="ic" style="background:${iconBg}">${iconHtml}</div>
          <div class="lbl">
            <div class="t">Dose ${i + 1} de ${med.doses.length}</div>
            <div class="s" style="${subStyle}">${subText}</div>
          </div>
          <div class="dose-actions">${actionsHtml}</div>
        </div>`;
    }).join("");

    const sheet = openSheetEl(`
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <h3>${escapeHtml(med.name)}</h3>
        <button class="icon-btn" id="sheet-close">${ICONS.close}</button>
      </div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">${med.doseAmount} ${med.doseUnit} · a cada ${med.frequencyHours}h · ${doneCount} de ${med.doses.length} aplicadas${missedCount > 0 ? ` · ${missedCount} não aplicada${missedCount === 1 ? "" : "s"}` : ""}</p>
      <div class="card" style="padding:6px 12px;margin-bottom:16px">${rowsHtml}</div>
      <button class="btn btn-secondary btn-block" id="mc-edit">${ICONS.edit} Editar medicamento</button>
    `);
    sheet.querySelector("#sheet-close").addEventListener("click", closeSheet);
    sheet.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const i = parseInt(btn.dataset.i, 10);
        const dose = med.doses[i];
        const act = btn.dataset.act;
        if (act === "done") setDoseStatus(dose, "done");
        else if (act === "missed") setDoseStatus(dose, "missed");
        else if (act === "undo") setDoseStatus(dose, "pending");
        await dbPut("records", med);
        await loadAll();
        closeSheet();
        const msg = act === "done" ? "Dose marcada como aplicada!" : act === "missed" ? "Dose marcada como não aplicada" : "Dose voltou para pendente";
        toast(msg);
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

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }
  }

  function init() {
    loadAll().then(() => {
      render();
      registerServiceWorker();
      driveAutoBackupOnOpen();
    }).catch((err) => {
      document.getElementById("app").innerHTML = `<div class="empty-state"><h3>Não foi possível carregar</h3><p>${escapeHtml(err.message || "Erro desconhecido")}</p></div>`;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
