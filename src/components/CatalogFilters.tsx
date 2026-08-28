import {
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useI18n } from "../i18n/LanguageProvider";
import type { CatalogFilters, DatePreset } from "../types";

const EVENT_TYPES = [
  { key: "pool_party", emoji: "🏖️" },
  { key: "boat_party", emoji: "🛥️" },
  { key: "nightclubs", emoji: "🌙" },
  { key: "open_bar", emoji: "🍹" },
] as const;

type OpenPanel = "date" | "type" | null;

function FilterSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="fixed inset-0 z-[70] cursor-default bg-black/[0.62] backdrop-blur-sm"
      />

      <section className="custom-scrollbar fixed inset-x-3 bottom-3 z-[75] max-h-[min(82vh,720px)] overflow-y-auto rounded-[28px] border border-white/10 bg-[#171717] p-5 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[420px] sm:max-h-[620px]">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h3 className="font-title text-lg uppercase">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/[0.55] hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="pt-5">{children}</div>
      </section>
    </>
  );
}

export function CatalogFiltersBar({
  filters,
  onChange,
  onReset,
}: {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  onReset: () => void;
}) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const { t } = useI18n();

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count += 1;
    if (filters.eventTypes.length > 0) count += 1;
    if (filters.datePreset !== "all") count += 1;
    return count;
  }, [filters]);

  const dateLabel = useMemo(() => {
    if (filters.datePreset === "today") return t("filters.today");
    if (filters.datePreset === "tomorrow") return t("filters.tomorrow");
    if (filters.datePreset === "weekend") return t("filters.weekend");
    if (filters.datePreset === "range") {
      if (filters.startDate && filters.endDate) {
        return `${filters.startDate} → ${filters.endDate}`;
      }
      return t("filters.range");
    }
    return t("filters.allDates");
  }, [filters.datePreset, filters.endDate, filters.startDate, t]);

  const typeLabel =
    filters.eventTypes.length === 0
      ? t("filters.allTypes")
      : t("filters.selected", { count: filters.eventTypes.length });

  const chooseDatePreset = (preset: DatePreset) => {
    onChange({
      ...filters,
      datePreset: preset,
      startDate: preset === "range" ? filters.startDate : "",
      endDate: preset === "range" ? filters.endDate : "",
    });

    if (preset !== "range") {
      setOpenPanel(null);
    }
  };

  const toggleType = (type: string) => {
    const exists = filters.eventTypes.includes(type);
    onChange({
      ...filters,
      eventTypes: exists
        ? filters.eventTypes.filter((item) => item !== type)
        : [...filters.eventTypes, type],
    });
  };

  return (
    <section className="relative rounded-[28px] border border-white/10 bg-[#151515]/[0.92] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <label className="flex min-h-14 items-center gap-3 rounded-[20px] border border-white/[0.08] bg-background/80 px-4 transition focus-within:border-secondary/50 focus-within:ring-4 focus-within:ring-secondary/[0.08]">
          <Search size={19} className="shrink-0 text-white/[0.28]" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
            placeholder={t("filters.searchPlaceholder")}
            className="w-full bg-transparent font-body text-sm text-white outline-none placeholder:text-white/[0.24]"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: "" })}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/30 hover:bg-white/[0.08] hover:text-white"
              aria-label={t("common.reset")}
            >
              <X size={16} />
            </button>
          )}
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenPanel((value) => (value === "date" ? null : "date"))}
            className={`flex min-h-14 w-full items-center gap-3 rounded-[20px] border px-4 text-left transition lg:min-w-[230px] ${
              filters.datePreset !== "all"
                ? "border-secondary/[0.35] bg-secondary/10"
                : "border-white/[0.08] bg-background/80 hover:border-white/[0.16]"
            }`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-secondary">
              <CalendarDays size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-subtext text-[10px] uppercase tracking-[0.14em] text-white/[0.28]">
                {t("filters.date")}
              </span>
              <strong className="mt-0.5 block truncate font-subtitle text-sm text-white/75">
                {dateLabel}
              </strong>
            </span>
            <ChevronDown
              size={17}
              className={`shrink-0 text-white/30 transition ${openPanel === "date" ? "rotate-180" : ""}`}
            />
          </button>

          <FilterSheet
            open={openPanel === "date"}
            title={t("filters.date")}
            onClose={() => setOpenPanel(null)}
          >
            <div className="grid gap-2">
              {(
                [
                  ["all", t("filters.allDates")],
                  ["today", t("filters.today")],
                  ["tomorrow", t("filters.tomorrow")],
                  ["weekend", t("filters.weekend")],
                  ["range", t("filters.range")],
                ] as Array<[DatePreset, string]>
              ).map(([value, label]) => {
                const active = filters.datePreset === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => chooseDatePreset(value)}
                    className={`flex min-h-[52px] items-center gap-3 rounded-[18px] border px-4 text-left font-subtitle text-sm transition ${
                      active
                        ? "border-secondary/[0.35] bg-secondary/[0.12] text-white"
                        : "border-white/[0.08] bg-black/20 text-white/[0.52] hover:border-white/[0.15] hover:text-white"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full ${
                        active ? "bg-secondary text-ink" : "bg-white/[0.06] text-white/30"
                      }`}
                    >
                      {active ? <Check size={16} /> : <CalendarDays size={16} />}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>

            {filters.datePreset === "range" && (
              <div className="mt-5 rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block font-subtitle text-xs text-white/[0.55]">
                      {t("filters.startDate")}
                    </span>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(event) =>
                        onChange({ ...filters, startDate: event.target.value })
                      }
                      className="form-input"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block font-subtitle text-xs text-white/[0.55]">
                      {t("filters.endDate")}
                    </span>
                    <input
                      type="date"
                      min={filters.startDate || undefined}
                      value={filters.endDate}
                      onChange={(event) =>
                        onChange({ ...filters, endDate: event.target.value })
                      }
                      className="form-input"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  disabled={!filters.startDate}
                  onClick={() => setOpenPanel(null)}
                  className="primary-button mt-4 w-full"
                >
                  {t("common.apply")}
                </button>
              </div>
            )}
          </FilterSheet>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenPanel((value) => (value === "type" ? null : "type"))}
            className={`flex min-h-14 w-full items-center gap-3 rounded-[20px] border px-4 text-left transition lg:min-w-[220px] ${
              filters.eventTypes.length > 0
                ? "border-primary/[0.35] bg-primary/10"
                : "border-white/[0.08] bg-background/80 hover:border-white/[0.16]"
            }`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-primary">
              <SlidersHorizontal size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-subtext text-[10px] uppercase tracking-[0.14em] text-white/[0.28]">
                {t("filters.type")}
              </span>
              <strong className="mt-0.5 block truncate font-subtitle text-sm text-white/75">
                {typeLabel}
              </strong>
            </span>
            <ChevronDown
              size={17}
              className={`shrink-0 text-white/30 transition ${openPanel === "type" ? "rotate-180" : ""}`}
            />
          </button>

          <FilterSheet
            open={openPanel === "type"}
            title={t("filters.type")}
            onClose={() => setOpenPanel(null)}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {EVENT_TYPES.map((item) => {
                const active = filters.eventTypes.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleType(item.key)}
                    className={`flex min-h-14 items-center gap-3 rounded-[18px] border px-4 text-left transition ${
                      active
                        ? "border-primary/40 bg-primary/[0.12] text-white"
                        : "border-white/[0.08] bg-black/20 text-white/[0.52] hover:border-white/[0.15] hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="flex-1 font-subtitle text-sm">
                      {t(`eventTypes.${item.key}`)}
                    </span>
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full border ${
                        active
                          ? "border-primary bg-primary text-ink"
                          : "border-white/[0.12] bg-white/[0.04] text-transparent"
                      }`}
                    >
                      <Check size={14} />
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => onChange({ ...filters, eventTypes: [] })}
                className="secondary-button flex-1"
              >
                {t("common.reset")}
              </button>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                className="primary-button flex-1"
              >
                {t("common.apply")}
              </button>
            </div>
          </FilterSheet>
        </div>

        <button
          type="button"
          onClick={() => {
            onReset();
            setOpenPanel(null);
          }}
          disabled={activeCount === 0}
          className="flex min-h-14 items-center justify-center gap-2 rounded-[20px] border border-white/[0.08] bg-white/[0.035] px-4 font-subtitle text-xs text-white/[0.45] transition hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white disabled:cursor-default disabled:opacity-25"
          aria-label={t("common.reset")}
        >
          {activeCount > 0 ? <Filter size={17} /> : <RotateCcw size={17} />}
          <span className="lg:hidden">
            {activeCount > 0
              ? t("filters.active", { count: activeCount })
              : t("common.reset")}
          </span>
        </button>
      </div>
    </section>
  );
}
