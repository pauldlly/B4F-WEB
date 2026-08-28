import type {
  CatalogFilters,
  PublicEvent,
  PublicPack,
} from "../types";

export function formatMoney(value: number, locale = "fr-FR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseEventDate(date: string | null, time?: string | null) {
  if (!date) return null;

  const safeTime = time?.trim() || "00:00:00";
  const normalizedTime = safeTime.length === 5 ? `${safeTime}:00` : safeTime;
  const value = new Date(`${date}T${normalizedTime}`);

  return Number.isNaN(value.getTime()) ? null : value;
}

export function eventEndTimestamp(event: PublicEvent) {
  const start = parseEventDate(event.eventDate, event.startTime);
  const end = parseEventDate(event.eventDate, event.endTime || event.startTime);

  if (!start || !end) return null;

  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1);
  }

  return end.getTime();
}

export function isEventPast(event: PublicEvent) {
  const end = eventEndTimestamp(event);

  if (end !== null) return end <= Date.now();

  const date = parseEventDate(event.eventDate);
  return date ? date.getTime() < Date.now() : false;
}

export function eventTimestamp(event: PublicEvent) {
  return (
    parseEventDate(event.eventDate, event.startTime)?.getTime() ??
    Number.MAX_SAFE_INTEGER
  );
}

export function packTimestamp(pack: PublicPack) {
  return pack.earliestEventDate
    ? new Date(`${pack.earliestEventDate}T00:00:00`).getTime()
    : Number.MAX_SAFE_INTEGER;
}

export function formatEventDate(
  date: string | null,
  time?: string | null,
  options: {
    includeWeekday?: boolean;
    includeTime?: boolean;
    includeYear?: boolean;
    locale?: string;
  } = {},
) {
  const value = parseEventDate(date, time);

  if (!value) return "—";

  return new Intl.DateTimeFormat(options.locale ?? "fr-FR", {
    weekday: options.includeWeekday === false ? undefined : "long",
    day: "numeric",
    month: "long",
    year: options.includeYear === false ? undefined : "numeric",
    hour: options.includeTime === false || !time ? undefined : "2-digit",
    minute: options.includeTime === false || !time ? undefined : "2-digit",
  }).format(value);
}

export function formatShortEventDate(
  date: string | null,
  time?: string | null,
  locale = "fr-FR",
) {
  const value = parseEventDate(date, time);

  if (!value) return "—";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: time ? "2-digit" : undefined,
    minute: time ? "2-digit" : undefined,
  }).format(value);
}

export function eventTypeLabel(
  type: string | null,
  translate?: (key: string) => string,
) {
  if (!type) return "Event";

  const labels: Record<string, string> = {
    pool_party: "Pool party",
    boat_party: "Boat party",
    nightclubs: "Nightclub",
    open_bar: "Open bar",
  };

  const translated = translate?.(`eventTypes.${type}`);
  if (translated && translated !== `eventTypes.${type}`) return translated;

  return labels[type] ?? type.replaceAll("_", " ");
}

export function shortReference(id: string) {
  return id.replace(/-/g, "").slice(0, 10).toUpperCase();
}

export function isoLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateRange(filters: CatalogFilters) {
  const now = new Date();
  const today = isoLocalDate(now);

  if (filters.datePreset === "today") {
    return { start: today, end: today };
  }

  if (filters.datePreset === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const iso = isoLocalDate(tomorrow);
    return { start: iso, end: iso };
  }

  if (filters.datePreset === "weekend") {
    const day = now.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + daysUntilSaturday);

    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    return {
      start: isoLocalDate(saturday),
      end: isoLocalDate(sunday),
    };
  }

  if (filters.datePreset === "range") {
    const start = filters.startDate || today;
    const end = filters.endDate || filters.startDate || null;

    return { start, end };
  }

  return {
    start: today,
    end: null,
  };
}

export function matchesFilters(event: PublicEvent, filters: CatalogFilters) {
  const query = filters.search.trim().toLocaleLowerCase("fr-FR");

  if (query) {
    const content = [
      event.name,
      event.location,
      event.address,
      event.description,
      event.type,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("fr-FR");

    if (!content.includes(query)) return false;
  }

  if (
    filters.eventTypes.length > 0 &&
    (!event.type || !filters.eventTypes.includes(event.type))
  ) {
    return false;
  }

  const range = getDateRange(filters);

  if (event.eventDate && event.eventDate < range.start) {
    return false;
  }

  if (range.end && event.eventDate && event.eventDate > range.end) {
    return false;
  }

  return !isEventPast(event);
}

export function eventGenderRemaining(
  event: PublicEvent,
  gender: "man" | "woman",
) {
  const total = gender === "man" ? event.menCapacity : event.womenCapacity;
  const used = gender === "man" ? event.menSold : event.womenSold;

  if (total === null) return null;

  return Math.max(total - used, 0);
}

/**
 * Dans l'application mobile, women_capacity / men_capacity du Pack sont déjà
 * utilisés comme nombres encore disponibles. On ne retranche donc jamais
 * capacity_*_init une seconde fois côté web.
 */
export function packGenderRemaining(
  pack: PublicPack,
  gender: "man" | "woman",
) {
  const remaining = gender === "man" ? pack.menCapacity : pack.womenCapacity;

  if (remaining === null) return null;
  return Math.max(remaining, 0);
}

export function minimumKnown(values: Array<number | null>) {
  const known = values.filter((value): value is number => value !== null);
  return known.length > 0 ? Math.min(...known) : null;
}

export function clampToMaximum(value: number, maximum: number | null) {
  const safeValue = Math.max(0, Math.floor(Number(value) || 0));
  return maximum === null ? safeValue : Math.min(maximum, safeValue);
}
