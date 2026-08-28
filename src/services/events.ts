import { demoEvents } from "../data/demoEvents";
import { supabase } from "../lib/supabase";
import type { PublicEvent, PublicEventOption } from "../types";

type EventRow = {
  id: number;
  name: string | null;
  location: string | null;
  address: string | null;
  type: string | null;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  image_url: string | null;
  women_price: number | string | null;
  men_price: number | string | null;
  women_capacity: number | null;
  men_capacity: number | null;
  soldout: boolean | null;
  status: string | null;
  is_visible_only_in_packs: boolean | null;
};

type OptionRow = {
  id: number;
  event_id: number;
  name: string | null;
  description: string | null;
  price: number | string | null;
  archived: boolean | null;
};

function numberValue(value: number | string | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getPublicEvents(): Promise<{
  events: PublicEvent[];
  source: "supabase" | "demo";
}> {
  if (!supabase) {
    return {
      events: demoEvents,
      source: "demo",
    };
  }

  const { data: eventRows, error: eventError } = await supabase
    .from("Event")
    .select(
      "id,name,location,address,type,description,event_date,start_time,end_time,image_url,women_price,men_price,women_capacity,men_capacity,soldout,status,is_visible_only_in_packs",
    )
    .eq("status", "active")
    .eq("soldout", false)
    .eq("is_visible_only_in_packs", false)
    .order("event_date", { ascending: true });

  if (eventError) throw eventError;

  const eventIds = (eventRows ?? []).map((event) => Number(event.id));

  let optionRows: OptionRow[] = [];

  if (eventIds.length > 0) {
    const { data, error } = await supabase
      .from("EventOption")
      .select("id,event_id,name,description,price,archived")
      .in("event_id", eventIds)
      .eq("archived", false);

    if (error) throw error;
    optionRows = (data ?? []) as OptionRow[];
  }

  const options: PublicEventOption[] = optionRows.map((option) => ({
    id: Number(option.id),
    eventId: Number(option.event_id),
    name: option.name || "Option",
    description: option.description,
    price: numberValue(option.price),
  }));

  const events = ((eventRows ?? []) as EventRow[]).map(
    (event): PublicEvent => ({
      id: Number(event.id),
      name: event.name || "Événement B4F",
      location: event.location,
      address: event.address,
      type: event.type,
      description: event.description,
      eventDate: event.event_date,
      startTime: event.start_time,
      endTime: event.end_time,
      imageUrl: event.image_url,
      womenPrice: numberValue(event.women_price),
      menPrice: numberValue(event.men_price),
      womenCapacity: event.women_capacity,
      menCapacity: event.men_capacity,
      soldout: Boolean(event.soldout),
      options: options.filter(
        (option) => option.eventId === Number(event.id),
      ),
    }),
  );

  return {
    events,
    source: "supabase",
  };
}
