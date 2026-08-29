import {
  demoEvents,
  demoPacks,
} from "../data/demoCatalog";

import {
  eventTimestamp,
  getDateRange,
  isEventPast,
  matchesFilters,
  packTimestamp,
  toNumber,
} from "../lib/format";

import { supabase } from "../lib/supabase";

import type {
  CatalogFilters,
  PaginatedResult,
  PublicEvent,
  PublicEventOption,
  PublicEventTable,
  PublicPack,
  PublicPackEvent,
} from "../types";

export const EVENT_PAGE_SIZE = 9;
export const PACK_PAGE_SIZE = 6;

/* =========================================================
   TYPES DATABASE
========================================================= */

type EventRow = {
  id: number;

  name: string | null;
  location: string | null;
  address: string | null;
  type: string | null;

  description: string | null;

  /*
   * AJOUT
   */
  mini_description: string | null;

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

  capacity_women_init:
    | number
    | null;

  capacity_men_init:
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

type PackRow = {
  id: string;

  name:
    | string
    | null;

  description:
    | string
    | null;

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

  capacity_women_init:
    | number
    | null;

  capacity_men_init:
    | number
    | null;

  image_url:
    | string
    | null;

  color_name:
    | string
    | null;

  color_hex:
    | string
    | null;

  soldout:
    | boolean
    | null;

  status:
    | string
    | null;

  created_at:
    | string
    | null;

  is_visible_only_in_app:
    | boolean
    | null;
};

type PackEventRow = {
  id: string;
  pack_id: string;
  event_id: number;

  event_type:
    | "required"
    | "choice";

  choice_group_key:
    | string
    | null;

  choice_group_title:
    | string
    | null;

  min_choices:
    | number
    | null;

  max_choices:
    | number
    | null;

  is_active:
    | boolean
    | null;

  removed_at:
    | string
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

type TableRow = {
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

  deposit_percentage:
    | number
    | string
    | null;

  archived:
    | boolean
    | null;
};

type PackEventOptionRow = {
  pack_event_id: string;
  option_id: number;
};

type PackEventTableRow = {
  pack_event_id: string;
  table_id: number;
};

/* =========================================================
   NORMALIZE EVENT
========================================================= */

function normalizeEvent(
  row: EventRow,
  options: PublicEventOption[] = [],
  tables: PublicEventTable[] = [],
): PublicEvent {
  const womenSold =
    toNumber(
      row.capacity_women_init,
    );

  const menSold =
    toNumber(
      row.capacity_men_init,
    );

  return {
    id:
      Number(
        row.id,
      ),

    name:
      row.name ||
      "Événement B4F",

    location:
      row.location,

    address:
      row.address,

    type:
      row.type,

    description:
      row.description,

    /*
     * IMPORTANT :
     * snake_case Supabase
     * ->
     * camelCase frontend
     */
    miniDescription:
      row.mini_description ??
      null,

    eventDate:
      row.event_date,

    startTime:
      row.start_time,

    endTime:
      row.end_time,

    imageUrl:
      row.image_url,

    mediaLink:
      row.media_link,

    womenPrice:
      toNumber(
        row.women_price,
      ),

    menPrice:
      toNumber(
        row.men_price,
      ),

    womenCapacity:
      row.women_capacity,

    menCapacity:
      row.men_capacity,

    womenSold,

    menSold,

    soldout:
      Boolean(
        row.soldout,
      ),

    options,

    tables,
  };
}

/* =========================================================
   NORMALIZE OPTION
========================================================= */

function normalizeOption(
  row: OptionRow,
): PublicEventOption {
  return {
    id:
      Number(
        row.id,
      ),

    eventId:
      Number(
        row.event_id,
      ),

    name:
      row.name ||
      "Option",

    description:
      row.description,

    price:
      toNumber(
        row.price,
      ),
  };
}

/* =========================================================
   NORMALIZE TABLE
========================================================= */

function normalizeTable(
  row: TableRow,
): PublicEventTable {
  const fullPrice =
    toNumber(
      row.price,
    );

  const depositPercentage =
    toNumber(
      row.deposit_percentage,
    );

  return {
    id:
      Number(
        row.id,
      ),

    eventId:
      Number(
        row.event_id,
      ),

    name:
      row.name ||
      "Table",

    description:
      row.description,

    fullPrice,

    depositPercentage,

    depositPrice:
      depositPercentage >
      0
        ? (
            fullPrice *
            depositPercentage
          ) /
          100
        : 0,
  };
}

/* =========================================================
   SEARCH
========================================================= */

function safeSearch(
  value: string,
) {
  return value
    .replace(
      /[(),]/g,
      " ",
    )
    .trim()
    .slice(
      0,
      80,
    );
}

/* =========================================================
   EVENT FILTERS
========================================================= */

function applyEventFiltersToQuery(
  query: any,
  filters: CatalogFilters,
) {
  const range =
    getDateRange(
      filters,
    );

  let next =
    query.gte(
      "event_date",
      range.start,
    );

  if (
    range.end
  ) {
    next =
      next.lte(
        "event_date",
        range.end,
      );
  }

  if (
    filters.eventTypes
      .length > 0
  ) {
    next =
      next.in(
        "type",
        filters.eventTypes,
      );
  }

  const search =
    safeSearch(
      filters.search,
    );

  if (
    search
  ) {
    next =
      next.or(
        [
          `name.ilike.%${search}%`,
          `location.ilike.%${search}%`,
          `address.ilike.%${search}%`,
          `description.ilike.%${search}%`,
          `mini_description.ilike.%${search}%`,
        ].join(","),
      );
  }

  return next;
}

/* =========================================================
   GET EVENTS
========================================================= */

export async function getEventsPage({
  offset,
  filters,
}: {
  offset: number;
  filters: CatalogFilters;
}): Promise<
  PaginatedResult<PublicEvent>
> {
  /* =====================================================
     DEMO MODE
  ===================================================== */

  if (
    !supabase
  ) {
    const filtered =
      demoEvents
        .filter(
          (
            event,
          ) =>
            matchesFilters(
              event,
              filters,
            ),
        )
        .sort(
          (
            a,
            b,
          ) =>
            eventTimestamp(
              a,
            ) -
            eventTimestamp(
              b,
            ),
        );

    const items =
      filtered.slice(
        offset,
        offset +
          EVENT_PAGE_SIZE,
      );

    return {
      items,

      nextOffset:
        offset +
          EVENT_PAGE_SIZE <
        filtered.length
          ? offset +
            EVENT_PAGE_SIZE
          : null,

      source:
        "demo",
    };
  }

  /* =====================================================
     SUPABASE
  ===================================================== */

  let query =
    supabase
      .from(
        "Event",
      )
      .select(
        `
          id,
          name,
          location,
          address,
          type,
          description,
          mini_description,
          event_date,
          start_time,
          end_time,
          image_url,
          media_link,
          women_price,
          men_price,
          women_capacity,
          men_capacity,
          capacity_women_init,
          capacity_men_init,
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
        "is_visible_only_in_packs",
        false,
      )
      .eq(
        "is_visible_only_in_app",
        false,
      );

  query =
    applyEventFiltersToQuery(
      query,
      filters,
    );

  const {
    data,
    error,
  } =
    await query
      .order(
        "event_date",
        {
          ascending:
            true,
        },
      )
      .order(
        "start_time",
        {
          ascending:
            true,
        },
      )
      .range(
        offset,
        offset +
          EVENT_PAGE_SIZE -
          1,
      );

  if (
    error
  ) {
    throw error;
  }

  const rawRows =
    (
      data ??
      []
    ) as EventRow[];

  const items =
    rawRows
      .filter(
        (
          row,
        ) =>
          row.is_visible_only_in_app !==
          true,
      )
      .map(
        (
          row,
        ) =>
          normalizeEvent(
            row,
          ),
      )
      .filter(
        (
          event,
        ) =>
          !isEventPast(
            event,
          ),
      )
      .sort(
        (
          a,
          b,
        ) =>
          eventTimestamp(
            a,
          ) -
          eventTimestamp(
            b,
          ),
      );

  return {
    items,

    nextOffset:
      rawRows.length ===
      EVENT_PAGE_SIZE
        ? offset +
          EVENT_PAGE_SIZE
        : null,

    source:
      "supabase",
  };
}

/* =========================================================
   GET EVENT DETAIL
========================================================= */

export async function getEventDetail(
  eventId: number,
): Promise<
  PublicEvent | null
> {
  /* =====================================================
     DEMO
  ===================================================== */

  if (
    !supabase
  ) {
    return (
      demoEvents.find(
        (
          event,
        ) =>
          event.id ===
          eventId,
      ) ??
      null
    );
  }

  /* =====================================================
     EVENT
  ===================================================== */

  const {
    data:
      eventRow,
    error:
      eventError,
  } =
    await supabase
      .from(
        "Event",
      )
      .select(
        `
          id,
          name,
          location,
          address,
          type,
          description,
          mini_description,
          event_date,
          start_time,
          end_time,
          image_url,
          media_link,
          women_price,
          men_price,
          women_capacity,
          men_capacity,
          capacity_women_init,
          capacity_men_init,
          soldout,
          status,
          is_visible_only_in_packs,
          is_visible_only_in_app
        `,
      )
      .eq(
        "id",
        eventId,
      )
      .eq(
        "status",
        "active",
      )
      .eq(
        "is_visible_only_in_app",
        false,
      )
      .maybeSingle();

  if (
    eventError
  ) {
    throw eventError;
  }

  if (
    !eventRow
  ) {
    return null;
  }

  /* =====================================================
     OPTIONS + TABLES
  ===================================================== */

  const [
    optionResult,
    tableResult,
  ] =
    await Promise.all([
      supabase
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
        .eq(
          "event_id",
          eventId,
        )
        .eq(
          "archived",
          false,
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "EventTable",
        )
        .select(
          `
            id,
            event_id,
            name,
            description,
            price,
            deposit_percentage,
            archived
          `,
        )
        .eq(
          "event_id",
          eventId,
        )
        .eq(
          "archived",
          false,
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          },
        ),
    ]);

  if (
    optionResult.error
  ) {
    throw optionResult.error;
  }

  if (
    tableResult.error
  ) {
    throw tableResult.error;
  }

  const event =
    normalizeEvent(
      eventRow as EventRow,

      (
        optionResult.data ??
        []
      ).map(
        normalizeOption,
      ),

      (
        tableResult.data ??
        []
      ).map(
        normalizeTable,
      ),
    );

  return isEventPast(
    event,
  )
    ? null
    : event;
}

/* =========================================================
   HYDRATE PACKS
========================================================= */

async function hydratePacks(
  packRows:
    PackRow[],

  includeExtras:
    boolean,
): Promise<
  PublicPack[]
> {
  if (
    !supabase ||
    packRows.length ===
      0
  ) {
    return [];
  }

  const webPackRows =
    packRows.filter(
      (
        pack,
      ) =>
        pack.is_visible_only_in_app !==
        true,
    );

  if (
    webPackRows.length ===
    0
  ) {
    return [];
  }

  const packIds =
    webPackRows.map(
      (
        pack,
      ) =>
        pack.id,
    );

  /* =====================================================
     PACK EVENTS
  ===================================================== */

  const {
    data:
      packEventData,

    error:
      packEventError,
  } =
    await supabase
      .from(
        "PackEvent",
      )
      .select(
        `
          id,
          pack_id,
          event_id,
          event_type,
          choice_group_key,
          choice_group_title,
          min_choices,
          max_choices,
          is_active,
          removed_at
        `,
      )
      .in(
        "pack_id",
        packIds,
      )
      .eq(
        "is_active",
        true,
      )
      .is(
        "removed_at",
        null,
      );

  if (
    packEventError
  ) {
    throw packEventError;
  }

  const packEventRows =
    (
      packEventData ??
      []
    ) as PackEventRow[];

  const eventIds =
    Array.from(
      new Set(
        packEventRows.map(
          (
            row,
          ) =>
            Number(
              row.event_id,
            ),
        ),
      ),
    );

  /* =====================================================
     EVENTS DU PACK
  ===================================================== */

  let eventRows:
    EventRow[] =
    [];

  if (
    eventIds.length >
    0
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "Event",
        )
        .select(
          `
            id,
            name,
            location,
            address,
            type,
            description,
            mini_description,
            event_date,
            start_time,
            end_time,
            image_url,
            media_link,
            women_price,
            men_price,
            women_capacity,
            men_capacity,
            capacity_women_init,
            capacity_men_init,
            soldout,
            status,
            is_visible_only_in_packs
          `,
        )
        .in(
          "id",
          eventIds,
        )
        .eq(
          "status",
          "active",
        )
        .eq(
          "is_visible_only_in_app",
          false,
        );

    if (
      error
    ) {
      throw error;
    }

    eventRows =
      (
        data ??
        []
      ) as EventRow[];
  }

  const eventsById =
    new Map<
      number,
      PublicEvent
    >();

  eventRows.forEach(
    (
      row,
    ) => {
      const event =
        normalizeEvent(
          row,
        );

      if (
        !isEventPast(
          event,
        )
      ) {
        eventsById.set(
          event.id,
          event,
        );
      }
    },
  );

  const activePackEvents =
    packEventRows.filter(
      (
        row,
      ) =>
        eventsById.has(
          Number(
            row.event_id,
          ),
        ),
    );

  const packEventIds =
    activePackEvents.map(
      (
        row,
      ) =>
        row.id,
    );

  const optionsByPackEvent =
    new Map<
      string,
      PublicEventOption[]
    >();

  const tablesByPackEvent =
    new Map<
      string,
      PublicEventTable[]
    >();

  /* =====================================================
     PACK EXTRAS
  ===================================================== */

  if (
    includeExtras &&
    packEventIds.length >
      0
  ) {
    const [
      packOptionResult,
      packTableResult,
    ] =
      await Promise.all([
        supabase
          .from(
            "PackEventOption",
          )
          .select(
            "pack_event_id,option_id",
          )
          .in(
            "pack_event_id",
            packEventIds,
          ),

        supabase
          .from(
            "PackEventTable",
          )
          .select(
            "pack_event_id,table_id",
          )
          .in(
            "pack_event_id",
            packEventIds,
          ),
      ]);

    if (
      packOptionResult.error
    ) {
      throw packOptionResult.error;
    }

    if (
      packTableResult.error
    ) {
      throw packTableResult.error;
    }

    const packOptionRows =
      (
        packOptionResult.data ??
        []
      ) as PackEventOptionRow[];

    const packTableRows =
      (
        packTableResult.data ??
        []
      ) as PackEventTableRow[];

    const optionIds =
      Array.from(
        new Set(
          packOptionRows.map(
            (
              row,
            ) =>
              Number(
                row.option_id,
              ),
          ),
        ),
      );

    const tableIds =
      Array.from(
        new Set(
          packTableRows.map(
            (
              row,
            ) =>
              Number(
                row.table_id,
              ),
          ),
        ),
      );

    let optionRows:
      OptionRow[] =
      [];

    let tableRows:
      TableRow[] =
      [];

    /* ===================================================
       OPTIONS
    =================================================== */

    if (
      optionIds.length >
      0
    ) {
      const {
        data,
        error,
      } =
        await supabase
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
            "id",
            optionIds,
          )
          .eq(
            "archived",
            false,
          );

      if (
        error
      ) {
        throw error;
      }

      optionRows =
        (
          data ??
          []
        ) as OptionRow[];
    }

    /* ===================================================
       TABLES
    =================================================== */

    if (
      tableIds.length >
      0
    ) {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "EventTable",
          )
          .select(
            `
              id,
              event_id,
              name,
              description,
              price,
              deposit_percentage,
              archived
            `,
          )
          .in(
            "id",
            tableIds,
          )
          .eq(
            "archived",
            false,
          );

      if (
        error
      ) {
        throw error;
      }

      tableRows =
        (
          data ??
          []
        ) as TableRow[];
    }

    const optionById =
      new Map(
        optionRows.map(
          (
            row,
          ) => [
            Number(
              row.id,
            ),

            normalizeOption(
              row,
            ),
          ],
        ),
      );

    const tableById =
      new Map(
        tableRows.map(
          (
            row,
          ) => [
            Number(
              row.id,
            ),

            normalizeTable(
              row,
            ),
          ],
        ),
      );

    /* ===================================================
       RELATION OPTIONS
    =================================================== */

    packOptionRows.forEach(
      (
        relation,
      ) => {
        const option =
          optionById.get(
            Number(
              relation.option_id,
            ),
          );

        if (
          !option
        ) {
          return;
        }

        const list =
          optionsByPackEvent.get(
            relation.pack_event_id,
          ) ??
          [];

        list.push(
          option,
        );

        optionsByPackEvent.set(
          relation.pack_event_id,
          list,
        );
      },
    );

    /* ===================================================
       RELATION TABLES
    =================================================== */

    packTableRows.forEach(
      (
        relation,
      ) => {
        const table =
          tableById.get(
            Number(
              relation.table_id,
            ),
          );

        if (
          !table
        ) {
          return;
        }

        const list =
          tablesByPackEvent.get(
            relation.pack_event_id,
          ) ??
          [];

        list.push(
          table,
        );

        tablesByPackEvent.set(
          relation.pack_event_id,
          list,
        );
      },
    );
  }

  /* =====================================================
     BUILD PACKS
  ===================================================== */

  return webPackRows
    .map(
      (
        packRow,
      ):
        | PublicPack
        | null => {
        const allRelatedRows =
          packEventRows.filter(
            (
              row,
            ) =>
              row.pack_id ===
              packRow.id,
          );

        const relatedRows =
          activePackEvents.filter(
            (
              row,
            ) =>
              row.pack_id ===
              packRow.id,
          );

        const requiredRows =
          allRelatedRows.filter(
            (
              row,
            ) =>
              row.event_type ===
              "required",
          );

        /*
         * Si un événement obligatoire
         * n'est plus disponible,
         * on retire le pack.
         */

        const hasUnavailableRequiredEvent =
          requiredRows.some(
            (
              row,
            ) =>
              !eventsById.has(
                Number(
                  row.event_id,
                ),
              ),
          );

        if (
          hasUnavailableRequiredEvent
        ) {
          return null;
        }

        /* =================================================
           EVENTS
        ================================================= */

        const events:
          PublicPackEvent[] =
          relatedRows
            .map(
              (
                row,
              ) => {
                const event =
                  eventsById.get(
                    Number(
                      row.event_id,
                    ),
                  );

                if (
                  !event
                ) {
                  return null;
                }

                return {
                  id:
                    row.id,

                  packId:
                    row.pack_id,

                  eventId:
                    Number(
                      row.event_id,
                    ),

                  eventType:
                    row.event_type,

                  choiceGroupKey:
                    row.choice_group_key,

                  choiceGroupTitle:
                    row.choice_group_title,

                  minChoices:
                    Math.max(
                      0,
                      Number(
                        row.min_choices ??
                          1,
                      ),
                    ),

                  maxChoices:
                    Math.max(
                      1,
                      Number(
                        row.max_choices ??
                          1,
                      ),
                    ),

                  event,

                  options:
                    optionsByPackEvent.get(
                      row.id,
                    ) ??
                    [],

                  tables:
                    tablesByPackEvent.get(
                      row.id,
                    ) ??
                    [],
                };
              },
            )
            .filter(
              (
                value,
              ): value is PublicPackEvent =>
                value !==
                null,
            )
            .sort(
              (
                a,
                b,
              ) =>
                eventTimestamp(
                  a.event,
                ) -
                eventTimestamp(
                  b.event,
                ),
            );

        if (
          events.length ===
          0
        ) {
          return null;
        }

        const womenSold =
          toNumber(
            packRow.capacity_women_init,
          );

        const menSold =
          toNumber(
            packRow.capacity_men_init,
          );

        return {
          id:
            packRow.id,

          name:
            packRow.name ||
            "Pack B4F",

          description:
            packRow.description,

          womenPrice:
            toNumber(
              packRow.women_price,
            ),

          menPrice:
            toNumber(
              packRow.men_price,
            ),

          womenCapacity:
            packRow.women_capacity,

          menCapacity:
            packRow.men_capacity,

          womenSold,

          menSold,

          imageUrl:
            packRow.image_url,

          colorName:
            packRow.color_name,

          colorHex:
            packRow.color_hex,

          soldout:
            Boolean(
              packRow.soldout,
            ),

          earliestEventDate:
            events[0]
              ?.event
              .eventDate ??
            null,

          events,
        };
      },
    )
    .filter(
      (
        pack,
      ): pack is PublicPack =>
        pack !==
        null,
    );
}

/* =========================================================
   PACK FILTERS
========================================================= */

function packMatchesFilters(
  pack:
    PublicPack,

  filters:
    CatalogFilters,
) {
  const query =
    filters.search
      .trim()
      .toLocaleLowerCase(
        "fr-FR",
      );

  if (
    query
  ) {
    const content =
      [
        pack.name,
        pack.description,
        pack.colorName,

        ...pack.events.flatMap(
          (
            item,
          ) => [
            item.event.name,
            item.event.location,
            item.event.address,
            item.event.description,
            item.event.miniDescription,
            item.event.type,
          ],
        ),
      ]
        .filter(
          Boolean,
        )
        .join(
          " ",
        )
        .toLocaleLowerCase(
          "fr-FR",
        );

    if (
      !content.includes(
        query,
      )
    ) {
      return false;
    }
  }

  if (
    filters.eventTypes
      .length >
      0 &&
    !pack.events.some(
      (
        item,
      ) =>
        Boolean(
          item.event.type,
        ) &&
        filters.eventTypes.includes(
          item.event
            .type as string,
        ),
    )
  ) {
    return false;
  }

  const filtersWithoutSearch =
    {
      ...filters,

      search:
        "",

      eventTypes:
        [],
    };

  return pack.events.some(
    (
      item,
    ) =>
      matchesFilters(
        item.event,
        filtersWithoutSearch,
      ),
  );
}

/* =========================================================
   GET PACKS PAGE
========================================================= */

export async function getPacksPage({
  offset,
  filters,
}: {
  offset:
    number;

  filters:
    CatalogFilters;
}): Promise<
  PaginatedResult<PublicPack>
> {
  if (
    !supabase
  ) {
    const filtered =
      demoPacks
        .filter(
          (
            pack,
          ) =>
            packMatchesFilters(
              pack,
              filters,
            ),
        )
        .sort(
          (
            a,
            b,
          ) =>
            packTimestamp(
              a,
            ) -
            packTimestamp(
              b,
            ),
        );

    const items =
      filtered.slice(
        offset,
        offset +
          PACK_PAGE_SIZE,
      );

    return {
      items,

      nextOffset:
        offset +
          PACK_PAGE_SIZE <
        filtered.length
          ? offset +
            PACK_PAGE_SIZE
          : null,

      source:
        "demo",
    };
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "Pack",
      )
      .select(
        `
          id,
          name,
          description,
          women_price,
          men_price,
          women_capacity,
          men_capacity,
          capacity_women_init,
          capacity_men_init,
          image_url,
          color_name,
          color_hex,
          soldout,
          status,
          created_at,
          is_visible_only_in_app
        `,
      )
      .eq(
        "status",
        "active",
      )
      .eq(
        "is_visible_only_in_app",
        false,
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      )
      .range(
        offset,
        offset +
          PACK_PAGE_SIZE -
          1,
      );

  if (
    error
  ) {
    throw error;
  }

  const rawRows =
    (
      data ??
      []
    ) as PackRow[];

  const hydrated =
    await hydratePacks(
      rawRows,
      false,
    );

  const items =
    hydrated
      .filter(
        (
          pack,
        ) =>
          packMatchesFilters(
            pack,
            filters,
          ),
      )
      .sort(
        (
          a,
          b,
        ) =>
          packTimestamp(
            a,
          ) -
          packTimestamp(
            b,
          ),
      );

  return {
    items,

    nextOffset:
      rawRows.length ===
      PACK_PAGE_SIZE
        ? offset +
          PACK_PAGE_SIZE
        : null,

    source:
      "supabase",
  };
}

/* =========================================================
   GET PACK DETAIL
========================================================= */

export async function getPackDetail(
  packId: string,
): Promise<
  PublicPack | null
> {
  if (
    !supabase
  ) {
    return (
      demoPacks.find(
        (
          pack,
        ) =>
          pack.id ===
          packId,
      ) ??
      null
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "Pack",
      )
      .select(
        `
          id,
          name,
          description,
          women_price,
          men_price,
          women_capacity,
          men_capacity,
          capacity_women_init,
          capacity_men_init,
          image_url,
          color_name,
          color_hex,
          soldout,
          status,
          created_at,
          is_visible_only_in_app
        `,
      )
      .eq(
        "id",
        packId,
      )
      .eq(
        "status",
        "active",
      )
      .eq(
        "is_visible_only_in_app",
        false,
      )
      .maybeSingle();

  if (
    error
  ) {
    throw error;
  }

  if (
    !data
  ) {
    return null;
  }

  const packs =
    await hydratePacks(
      [
        data as PackRow,
      ],
      true,
    );

  return (
    packs[0] ??
    null
  );
}