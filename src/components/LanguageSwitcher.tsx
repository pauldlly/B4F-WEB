import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "../i18n/LanguageProvider";
import { languages, type LanguageCode } from "../i18n/translations";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { language, setLanguage, t } = useI18n();
  const selected = languages.find((item) => item.code === language) ?? languages[0];

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  const choose = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 items-center gap-2 rounded-full border bg-black/25 px-2.5 text-white backdrop-blur-xl transition hover:border-white/25 sm:h-11 ${
          open ? "border-secondary/[0.55]" : "border-white/10"
        }`}
        aria-label={`${t("nav.language")} : ${selected.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full border border-white/[0.15] bg-white/5 sm:h-8 sm:w-8">
          <img
            src={selected.flag}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </span>
        <span className="hidden font-subtitle text-[10px] tracking-[0.1em] text-white/70 xl:block">
          {selected.short}
        </span>
        <ChevronDown
          size={13}
          className={`hidden text-white/[0.35] transition xl:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[220px] overflow-hidden rounded-[20px] border border-white/10 bg-[#111]/95 p-2 shadow-[0_24px_80px_rgba(0,0,0,.65)] backdrop-blur-2xl"
        >
          {languages.map((item) => {
            const active = item.code === language;

            return (
              <button
                key={item.code}
                type="button"
                role="menuitem"
                onClick={() => choose(item.code)}
                className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left font-body text-sm transition ${
                  active
                    ? "bg-secondary/[0.13] text-white"
                    : "text-white/[0.55] hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-white/10 bg-black/30">
                  <img src={item.flag} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="flex-1">{item.label}</span>
                {active && <Check size={16} className="text-secondary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
