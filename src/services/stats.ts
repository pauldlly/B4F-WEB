import { supabase } from "../lib/supabase";

export type AgencyStats = {
  tickets: number;
  promoters: number;
  events: number;
  customers: number;
  source: "live" | "configured" | "demo";
};

const configuredValues = {
  tickets: Number(import.meta.env.VITE_STATS_TICKETS || 0),
  promoters: Number(import.meta.env.VITE_STATS_PROMOTERS || 0),
  events: Number(import.meta.env.VITE_STATS_EVENTS || 0),
  customers: Number(import.meta.env.VITE_STATS_CUSTOMERS || 0),
};

const hasConfiguredValues = Object.values(configuredValues).every((value) => value > 0);

const demo: AgencyStats = {
  tickets: 89000,
  promoters: 1056,
  events: 2300,
  customers: 50,
  source: "demo",
};

export async function getAgencyStats(): Promise<AgencyStats> {
  if (supabase) {
    const { data, error } = await supabase.rpc("public_agency_stats");

    if (!error && data) {
      const value = Array.isArray(data) ? data[0] : data;

      return {
        tickets: Number(value?.tickets ?? 0),
        promoters: Number(value?.promoters ?? 0),
        events: Number(value?.events ?? 0),
        customers: Number(value?.customers ?? 0),
        source: "live",
      };
    }
  }

  if (hasConfiguredValues) {
    return { ...configuredValues, source: "configured" };
  }

  return demo;
}
