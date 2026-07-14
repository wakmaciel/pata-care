import type { CSSProperties } from "react";

/* Ícones SVG do PataCare — traço arredondado, consistente com a identidade visual. */
export const ICONS = {
  paw: '<svg viewBox="0 0 24 24"><circle cx="12" cy="15.5" r="4.2"/><circle cx="5.2" cy="10" r="2.3"/><circle cx="9.6" cy="6.3" r="2.3"/><circle cx="14.4" cy="6.3" r="2.3"/><circle cx="18.8" cy="10" r="2.3"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9.5a.5.5 0 0 0 .5.5H9.5a.5.5 0 0 0 .5-.5V15a2 2 0 0 1 4 0v4.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V10"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10a6 6 0 1 1 12 0c0 3 1 4.5 2 6H4c1-1.5 2-3 2-6Z"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6.3"/><circle cx="12" cy="12" r="2.3"/><path d="M18.5 12L20.7 12M16.6 16.6L18.15 18.15M12 18.5L12 20.7M7.4 16.6L5.85 18.15M5.5 12L3.3 12M7.4 7.4L5.85 5.85M12 5.5L12 3.3M16.6 7.4L18.15 5.85"/></svg>',
  medkit:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="6" width="17" height="14" rx="2.2"/><path d="M8 6V4.8c0-.4.4-.8.9-.8h6.2c.5 0 .9.4.9.8V6"/><path d="M12 10v6M9 13h6"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.2 2"/></svg>',
  vet: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6M9 6h6"/><circle cx="12" cy="14.5" r="6.5"/><path d="M9.3 14.5h5.4M12 11.8v5.4"/></svg>',
  chevronDown:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  chevronRight:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  chevronLeft:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19.5 8.5a2 2 0 0 0 0-2.8L18.3 4.5a2 2 0 0 0-2.8 0L4 16v4Z"/><path d="M13.5 6.5l3.5 3.5"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7M6.5 7l.7 12c.05.9.8 1.5 1.6 1.5h6.4c.85 0 1.55-.6 1.6-1.5l.7-12"/></svg>',
  camera:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5C4 7.7 4.7 7 5.5 7H8l1-1.7c.2-.3.5-.5.9-.5h4.2c.4 0 .7.2.9.5L16 7h2.5c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z"/><circle cx="12" cy="13" r="3.3"/></svg>',
  syringe:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3l-3 3M11.5 6.5l6 6M9.5 8.5l7 7-1.6 1.6-2-1.1-1.7 1.7 1.1 2-1.6 1.6-7-7 1.6-1.6 2 1.1 1.7-1.7-1.1-2 1.6-1.6Z"/><path d="M3 21l3.5-3.5"/></svg>',
  bug: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 6.5a2.5 2.5 0 1 1 5 0"/><path d="M7.5 10.5h9c0 5-2 8-4.5 8s-4.5-3-4.5-8Z"/><path d="M4.5 8l3 1.6M19.5 8l-3 1.6M4 13.5h3.5M20 13.5h-3.5M5 19l3-2.4M19 19l-3-2.4M9 5l-1.7-2M15 5l1.7-2"/></svg>',
  pill: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9.5" width="17" height="5" rx="2.5" transform="rotate(-35 12 12)"/><path d="M11 7l2 2"/></svg>',
  scale:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M7 6h10l2 9a2 2 0 0 1-2 2.4H7A2 2 0 0 1 5 15Z"/><path d="M9 11h6"/></svg>',
  heart:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z"/></svg>',
  monitor:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="12" rx="1.6"/><path d="M8 20h8M12 16.5V20"/></svg>',
  download:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v12M7.5 11l4.5 4.5L16.5 11"/><path d="M4.5 19h15"/></svg>',
  upload:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16.5v-12M7.5 8.5 12 4l4.5 4.5"/><path d="M4.5 19h15"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 21.5 20H2.5Z"/><path d="M12 10v4M12 17v.1"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 9.5 17 19 6.5"/></svg>',
  dog: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9c0-2.5 1-4.5 2.5-4.5S9 7 9 9M19 9c0-2.5-1-4.5-2.5-4.5S15 7 15 9"/><path d="M5.5 9.2C5.5 7 8 6 12 6s6.5 1 6.5 3.2c0 4-1 8.3-6.5 8.3S5.5 13.2 5.5 9.2Z"/><circle cx="9.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/></svg>',
  cat: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5 8 10M18 5l-2 5"/><path d="M5.8 9.5c0-2 2.7-3 6.2-3s6.2 1 6.2 3c0 4.5-1.3 8-6.2 8s-6.2-3.5-6.2-8Z"/><circle cx="9.7" cy="11" r=".8" fill="currentColor" stroke="none"/><circle cx="14.3" cy="11" r=".8" fill="currentColor" stroke="none"/><path d="M11 13.2h2l-1 1.1Z"/></svg>',
  backup:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8a7 7 0 1 1 1.8 8.4"/><path d="M3.5 12.5 5 8l4 1.4"/><path d="M12 8v4.3l3 1.7"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.2M12 8v.1"/></svg>',
  chip: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 6V3.5M15 6V3.5M9 20.5V18M15 20.5V18M6 9H3.5M6 15H3.5M20.5 9H18M20.5 15H18"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5.5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18.5" r="1.6"/></svg>',
  clipboard:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4.5" width="14" height="17" rx="2"/><rect x="9" y="3" width="6" height="3.2" rx="1"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5"/></svg>',
  stethoscope:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a4 4 0 0 0 8 0V4"/><path d="M6 4H4.5M14 4h1.5"/><path d="M18 12v2.5a5.5 5.5 0 0 1-11 0V13"/><circle cx="19.3" cy="11" r="1.7"/></svg>',
  paperclip:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12.5l6.5-6.5a3 3 0 0 1 4.2 4.2L11.5 17.4a5 5 0 1 1-7-7L12 3"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z"/><path d="M14 3.5V8h4"/></svg>',
  scissors:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6.3" r="2.3"/><circle cx="6" cy="17.7" r="2.3"/><path d="M7.8 7.8 19 17M7.8 16.2 19 7"/></svg>',
  ruler:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.7" y="7.5" width="18.6" height="9" rx="1.6" transform="rotate(-45 12 12)"/><path d="M8.5 8.5 10 10M11 5.5 13 7.5M14.5 9 16 10.5M6 11l1.5 1.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.2" r="3.7"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.2 18h5.6M10.2 21h3.6"/><path d="M12 3a6 6 0 0 1 3.6 10.8c-.8.6-1.2 1.4-1.3 2.2h-4.6c-.1-.8-.5-1.6-1.3-2.2A6 6 0 0 1 12 3Z"/></svg>',
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  className?: string;
  style?: CSSProperties;
}

/* display:contents faz o wrapper "sumir" do layout: o <svg> se comporta como
   filho direto, mantendo compatíveis os seletores CSS (.btn svg, .chip svg...). */
export function Icon({ name, className, style }: IconProps) {
  if (className || style) {
    return (
      <span
        className={className}
        style={{ display: "inline-flex", ...style }}
        dangerouslySetInnerHTML={{ __html: ICONS[name] }}
      />
    );
  }
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}
