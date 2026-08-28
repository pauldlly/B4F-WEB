import { demoEvents } from "../data/demoCatalog";
import { supabase } from "../lib/supabase";

import type {
  PublicEvent,
  PublicEventOption,
} from "../types";

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
  media_link: string | null;

  women_price:
    | number
    | string
    | null;

  men_price:
    | number
    | string
    | null;

  women_capacity:
    | number
    | null;

  men_capacity:
    | number
    | null;

  soldout:
    | boolean
    | null;

  status:
    | string
    | null;

  is_visible_only_in_packs:
    | boolean
    | null;

  is_visible_only_in_app:
    | boolean
    | null;
};

type OptionRow = {
  id: number;
  event_id: number;

  name:
    | string
    | null;

  description:
    | string
    | null;

  price:
    | number
    | string
    | null;

  archived:
    | boolean
    | null;
};

function numberValue(
  value:
    | number
    | string
    | null,
) {
  const parsed = Number(
    value ?? 0,
  );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

export async function getPublicEvents(): Promise<{
  events: PublicEvent[];
  source:
    | "supabase"
    | "demo";
}> {
  /*
   * Si Supabase n'est pas configuré,
   * on utilise les données de démonstration.
   */
  if (!supabase) {
    return {
      events: demoEvents,
      source: "demo",
    };
  }

  /*
   * ÉVÉNEMENTS PUBLICS
   *
   * On affiche uniquement :
   *
   * - les événements actifs
   * - les événements non sold-out
   * - les événements qui ne sont pas
   *   réservés uniquement aux packs
   * - les événements qui ne sont pas
   *   réservés uniquement à l'application
   */
  const {
    data: eventRows,
    error: eventError,
  } = await supabase
    .from("Event")
    .select(
      `
        id,
        name,
        location,
        address,
        type,
        description,
        event_date,
        start_time,
        end_time,
        image_url,
        media_link,
        women_price,
        men_price,
        women_capacity,
        men_capacity,
        soldout,
        status,
        is_visible_only_in_packs,
        is_visible_only_in_app
      `,
    )
    .eq(
      "status",
      "active",
    )
    .eq(
      "soldout",
      false,
    )
    .eq(
      "is_visible_only_in_packs",
      false,
    )
    .eq(
      "is_visible_only_in_app",
      false,
    )
    .order(
      "event_date",
      {
        ascending: true,
      },
    )
    .order(
      "start_time",
      {
        ascending: true,
      },
    );

  if (eventError) {
    throw eventError;
  }

  /*
   * IDs des événements récupérés.
   */
  const eventIds = (
    eventRows ?? []
  ).map(
    (event) =>
      Number(
        event.id,
      ),
  );

  /*
   * OPTIONS
   */
  let optionRows:
    OptionRow[] = [];

  if (
    eventIds.length > 0
  ) {
    const {
      data,
      error,
    } = await supabase
      .from(
        "EventOption",
      )
      .select(
        `
          id,
          event_id,
          name,
          description,
          price,
          archived
        `,
      )
      .in(
        "event_id",
        eventIds,
      )
      .eq(
        "archived",
        false,
      );

    if (error) {
      throw error;
    }

    optionRows =
      (data ??
        []) as OptionRow[];
  }

  /*
   * Conversion des options
   * Supabase -> Frontend
   */
  const options:
    PublicEventOption[] =
    optionRows.map(
      (
        option,
      ) => ({
        id:
          Number(
            option.id,
          ),

        eventId:
          Number(
            option.event_id,
          ),

        name:
          option.name ||
          "Option",

        description:
          option.description,

        price:
          numberValue(
            option.price,
          ),
      }),
    );

  /*
   * Conversion des événements
   * Supabase -> PublicEvent
   */
  const events = (
    (
      eventRows ??
      []
    ) as EventRow[]
  ).map(
    (
      event,
    ): PublicEvent => ({
      id:
        Number(
          event.id,
        ),

      name:
        event.name ||
        "Événement B4F",

      location:
        event.location,

      address:
        event.address,

      type:
        event.type,

      description:
        event.description,

      eventDate:
        event.event_date,

      startTime:
        event.start_time,

      endTime:
        event.end_time,

      imageUrl:
        event.image_url,

      mediaLink:
        event.media_link,

      womenPrice:
        numberValue(
          event.women_price,
        ),

      menPrice:
        numberValue(
          event.men_price,
        ),

      womenCapacity:
        event.women_capacity,

      menCapacity:
        event.men_capacity,

      /*
       * Pour le moment le service
       * ne récupère pas les ventes.
       *
       * On met donc 0 pour satisfaire
       * PublicEvent.
       */
      womenSold:
        0,

      menSold:
        0,

      soldout:
        Boolean(
          event.soldout,
        ),

      options:
        options.filter(
          (
            option,
          ) =>
            option.eventId ===
            Number(
              event.id,
            ),
        ),

      /*
       * Les tables pourront être
       * chargées séparément ensuite.
       */
      tables:
        [],
    }),
  );

  return {
    events,
    source:
      "supabase",
  };
}