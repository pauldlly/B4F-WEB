import {
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  RefreshCw,
  Search,
  Ticket,
  Tickets,
  UserRound,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { Seo } from "../components/Seo";

import {
  useEventsInfinite,
  usePacksInfinite,
} from "../hooks/useCatalogQueries";

import { useI18n } from "../i18n/LanguageProvider";

import {
  formatEventDate,
  formatMoney,
} from "../lib/format";

import { useAuth } from "../providers/AuthProvider";

import { useOrders } from "../providers/OrdersProvider";

import {
  getGuestOrderAccess,
} from "../services/orderAccess";

import {
  getPublicOrders,
} from "../services/orders";

import type {
  CatalogFilters,
  GuestOrder,
} from "../types";

/* =====================================================
   CATALOG
===================================================== */

const catalogFilters: CatalogFilters = {
  search: "",
  eventTypes: [],
  datePreset: "all",
  startDate: "",
  endDate: "",
};

/* =====================================================
   HELPERS
===================================================== */

type LooseRecord =
  Record<string, unknown>;

type CatalogVisual = {
  id: string;
  name: string;
  imageUrl: string | null;
  eventDate?: string | null;
  kind: "event" | "pack";
};

function getRecord(
  value: unknown,
): LooseRecord | null {
  if (
    typeof value === "object" &&
    value !== null
  ) {
    return value as LooseRecord;
  }

  return null;
}

function getString(
  value: unknown,
) {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return String(value);
  }

  return null;
}

function getField(
  record: LooseRecord,
  keys: string[],
) {
  for (
    const key
    of keys
  ) {
    const value =
      getString(
        record[key],
      );

    if (value) {
      return value;
    }
  }

  return null;
}

function normalizeText(
  value:
    | string
    | null
    | undefined,
) {
  return String(
    value ?? "",
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim()
    .toLowerCase();
}

/* =====================================================
   IMAGE DIRECTE DE LA COMMANDE
===================================================== */

function getImageFromUnknown(
  value: unknown,
): string | null {
  const direct =
    getString(
      value,
    );

  if (direct) {
    return direct;
  }

  const record =
    getRecord(
      value,
    );

  if (!record) {
    return null;
  }

  return getField(
    record,
    [
      "url",
      "uri",
      "src",
      "image",
      "imageUrl",
      "image_url",
      "eventImage",
      "event_image",
      "packImage",
      "pack_image",
      "coverUrl",
      "cover_url",
      "thumbnail",
      "thumbnailUrl",
      "thumbnail_url",
    ],
  );
}

function getDirectTicketImage(
  ticket: unknown,
): string | null {
  const record =
    getRecord(
      ticket,
    );

  if (!record) {
    return null;
  }

  const candidates = [
    record.imageUrl,
    record.image_url,
    record.image,

    record.eventImage,
    record.event_image,
    record.eventImageUrl,
    record.event_image_url,

    record.packImage,
    record.pack_image,
    record.packImageUrl,
    record.pack_image_url,

    record.coverUrl,
    record.cover_url,

    record.thumbnail,
    record.thumbnailUrl,
    record.thumbnail_url,
  ];

  for (
    const candidate
    of candidates
  ) {
    const image =
      getImageFromUnknown(
        candidate,
      );

    if (image) {
      return image;
    }
  }

  /*
   * EVENT IMBRIQUÉ
   */
  const event =
    getRecord(
      record.event,
    );

  if (event) {
    const image =
      getField(
        event,
        [
          "imageUrl",
          "image_url",
          "image",
          "coverUrl",
          "cover_url",
          "thumbnail",
          "thumbnail_url",
        ],
      );

    if (image) {
      return image;
    }
  }

  /*
   * PACK IMBRIQUÉ
   */
  const pack =
    getRecord(
      record.pack,
    );

  if (pack) {
    const image =
      getField(
        pack,
        [
          "imageUrl",
          "image_url",
          "image",
          "coverUrl",
          "cover_url",
          "thumbnail",
          "thumbnail_url",
        ],
      );

    if (image) {
      return image;
    }
  }

  return null;
}

/* =====================================================
   INFORMATIONS EVENT / PACK D'UN TICKET
===================================================== */

function getTicketEventId(
  ticket: unknown,
) {
  const record =
    getRecord(
      ticket,
    );

  if (!record) {
    return null;
  }

  const direct =
    getField(
      record,
      [
        "eventId",
        "event_id",
      ],
    );

  if (direct) {
    return direct;
  }

  const event =
    getRecord(
      record.event,
    );

  if (!event) {
    return null;
  }

  return getField(
    event,
    [
      "id",
      "eventId",
      "event_id",
    ],
  );
}

function getTicketPackId(
  ticket: unknown,
) {
  const record =
    getRecord(
      ticket,
    );

  if (!record) {
    return null;
  }

  const direct =
    getField(
      record,
      [
        "packId",
        "pack_id",
      ],
    );

  if (direct) {
    return direct;
  }

  const pack =
    getRecord(
      record.pack,
    );

  if (!pack) {
    return null;
  }

  return getField(
    pack,
    [
      "id",
      "packId",
      "pack_id",
    ],
  );
}

function getTicketEventName(
  ticket: unknown,
) {
  const record =
    getRecord(
      ticket,
    );

  if (!record) {
    return "";
  }

  const direct =
    getField(
      record,
      [
        "eventName",
        "event_name",
        "eventTitle",
        "event_title",
        "name",
        "title",
      ],
    );

  if (direct) {
    return direct;
  }

  const event =
    getRecord(
      record.event,
    );

  if (!event) {
    return "";
  }

  return (
    getField(
      event,
      [
        "name",
        "title",
      ],
    ) ?? ""
  );
}

function getTicketPackName(
  ticket: unknown,
) {
  const record =
    getRecord(
      ticket,
    );

  if (!record) {
    return "";
  }

  const direct =
    getField(
      record,
      [
        "packName",
        "pack_name",
        "packTitle",
        "pack_title",
      ],
    );

  if (direct) {
    return direct;
  }

  const pack =
    getRecord(
      record.pack,
    );

  if (!pack) {
    return "";
  }

  return (
    getField(
      pack,
      [
        "name",
        "title",
      ],
    ) ?? ""
  );
}

function getTicketEventDate(
  ticket: unknown,
) {
  const record =
    getRecord(
      ticket,
    );

  if (!record) {
    return "";
  }

  const value =
    getField(
      record,
      [
        "eventDate",
        "event_date",
        "date",
      ],
    );

  if (value) {
    return value.slice(
      0,
      10,
    );
  }

  const event =
    getRecord(
      record.event,
    );

  if (!event) {
    return "";
  }

  return (
    getField(
      event,
      [
        "eventDate",
        "event_date",
        "date",
      ],
    ) ?? ""
  ).slice(
    0,
    10,
  );
}

/* =====================================================
   IMAGE DE COMMANDE
===================================================== */

function getOrderImage(
  order: GuestOrder,
  catalog:
    CatalogVisual[],
): string | null {

  /*
   * 1. IMAGE DÉJÀ FOURNIE
   * PAR LA COMMANDE
   */
  for (
    const ticket
    of order.tickets
  ) {
    const directImage =
      getDirectTicketImage(
        ticket,
      );

    if (
      directImage
    ) {
      return directImage;
    }
  }

  /*
   * 2. PACK
   *
   * Prioritaire si la commande
   * contient un pack.
   */
  for (
    const ticket
    of order.tickets
  ) {
    const packId =
      getTicketPackId(
        ticket,
      );

    const packName =
      normalizeText(
        getTicketPackName(
          ticket,
        ),
      );

    if (packId) {
      const pack =
        catalog.find(
          (
            item,
          ) =>
            item.kind ===
              "pack" &&
            item.id ===
              String(
                packId,
              ),
        );

      if (
        pack?.imageUrl
      ) {
        return pack.imageUrl;
      }
    }

    if (packName) {
      const pack =
        catalog.find(
          (
            item,
          ) =>
            item.kind ===
              "pack" &&
            normalizeText(
              item.name,
            ) ===
              packName,
        );

      if (
        pack?.imageUrl
      ) {
        return pack.imageUrl;
      }
    }
  }

  /*
   * 3. EVENT PAR ID
   */
  for (
    const ticket
    of order.tickets
  ) {
    const eventId =
      getTicketEventId(
        ticket,
      );

    if (!eventId) {
      continue;
    }

    const event =
      catalog.find(
        (
          item,
        ) =>
          item.kind ===
            "event" &&
          item.id ===
            String(
              eventId,
            ),
      );

    if (
      event?.imageUrl
    ) {
      return event.imageUrl;
    }
  }

  /*
   * 4. EVENT PAR NOM + DATE
   */
  for (
    const ticket
    of order.tickets
  ) {
    const name =
      normalizeText(
        getTicketEventName(
          ticket,
        ),
      );

    const date =
      getTicketEventDate(
        ticket,
      );

    if (!name) {
      continue;
    }

    const exact =
      catalog.find(
        (
          item,
        ) =>
          item.kind ===
            "event" &&
          normalizeText(
            item.name,
          ) ===
            name &&
          (
            !date ||
            String(
              item.eventDate ??
                "",
            ).slice(
              0,
              10,
            ) ===
              date
          ),
      );

    if (
      exact?.imageUrl
    ) {
      return exact.imageUrl;
    }
  }

  /*
   * 5. EVENT PAR NOM UNIQUEMENT
   */
  for (
    const ticket
    of order.tickets
  ) {
    const name =
      normalizeText(
        getTicketEventName(
          ticket,
        ),
      );

    if (!name) {
      continue;
    }

    const event =
      catalog.find(
        (
          item,
        ) =>
          item.kind ===
            "event" &&
          normalizeText(
            item.name,
          ) ===
            name,
      );

    if (
      event?.imageUrl
    ) {
      return event.imageUrl;
    }
  }

  return null;
}

/* =====================================================
   DATES
===================================================== */

function parseLocalDate(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return null;
  }

  const clean =
    String(
      value,
    ).slice(
      0,
      10,
    );

  const match =
    clean.match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );

  if (!match) {
    return null;
  }

  return new Date(
    Number(
      match[1],
    ),
    Number(
      match[2],
    ) - 1,
    Number(
      match[3],
    ),
    12,
    0,
    0,
  );
}

function getOrderDates(
  order: GuestOrder,
) {
  const dates =
    new Map<
      string,
      Date
    >();

  order.tickets.forEach(
    (
      ticket,
    ) => {
      const eventDate =
        getTicketEventDate(
          ticket,
        );

      if (!eventDate) {
        return;
      }

      const parsed =
        parseLocalDate(
          eventDate,
        );

      if (!parsed) {
        return;
      }

      dates.set(
        eventDate,
        parsed,
      );
    },
  );

  return Array.from(
    dates.entries(),
  )
    .map(
      ([
        value,
        date,
      ]) => ({
        value,
        date,
      }),
    )
    .sort(
      (
        a,
        b,
      ) =>
        a.date.getTime() -
        b.date.getTime(),
    );
}

function formatRangeDate(
  date: Date,
  locale: string,
  includeYear:
    boolean,
) {
  return new Intl.DateTimeFormat(
    locale ||
      "fr-FR",
    {
      day:
        "numeric",

      month:
        "short",

      ...(includeYear
        ? {
            year:
              "numeric" as const,
          }
        : {}),
    },
  )
    .format(
      date,
    )
    .replace(
      /\./g,
      "",
    );
}

function getOrderDateLabel(
  order: GuestOrder,
  locale: string,
) {
  const dates =
    getOrderDates(
      order,
    );

  if (
    dates.length ===
    0
  ) {
    return "";
  }

  /*
   * UNE SEULE DATE
   */
  if (
    dates.length ===
    1
  ) {
    const targetDate =
      dates[0].value;

    const ticket =
      order.tickets.find(
        (
          item,
        ) =>
          getTicketEventDate(
            item,
          ) ===
          targetDate,
      );

    const record =
      getRecord(
        ticket,
      );

    const startTime =
      record
        ? getField(
            record,
            [
              "startTime",
              "start_time",
            ],
          )
        : null;

    return formatEventDate(
      targetDate,
      startTime,
      {
        locale,
      },
    );
  }

  /*
   * PLUSIEURS DATES :
   * première -> dernière
   */
  const first =
    dates[0].date;

  const last =
    dates[
      dates.length -
        1
    ].date;

  const differentYear =
    first.getFullYear() !==
    last.getFullYear();

  const firstLabel =
    formatRangeDate(
      first,
      locale,
      differentYear,
    );

  const lastLabel =
    formatRangeDate(
      last,
      locale,
      true,
    );

  return `Du ${firstLabel} au ${lastLabel}`;
}

/* =====================================================
   PAGE
===================================================== */

export function MyTicketsPage() {
  const navigate =
    useNavigate();

  const {
    user,
    openAuth,
  } = useAuth();

  const {
    orders:
      demoOrders,
  } = useOrders();

  const {
    t,
    locale,
  } = useI18n();

  const [
    reference,
    setReference,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const demoMode =
    import.meta.env
      .VITE_DEMO_MODE ===
    "true";

  /* =====================================================
     CATALOGUE EVENT + PACK
  ===================================================== */

  const eventsQuery =
    useEventsInfinite(
      catalogFilters,
    );

  const packsQuery =
    usePacksInfinite(
      catalogFilters,
    );

  const catalog =
    useMemo<
      CatalogVisual[]
    >(() => {
      const events =
        eventsQuery.data?.pages.flatMap(
          (
            page,
          ) =>
            page.items,
        ) ?? [];

      const packs =
        packsQuery.data?.pages.flatMap(
          (
            page,
          ) =>
            page.items,
        ) ?? [];

      return [
        ...events.map(
          (
            event,
          ) => ({
            id:
              String(
                event.id,
              ),

            name:
              event.name,

            imageUrl:
              event.imageUrl ??
              null,

            eventDate:
              event.eventDate ??
              null,

            kind:
              "event" as const,
          }),
        ),

        ...packs.map(
          (
            pack,
          ) => ({
            id:
              String(
                pack.id,
              ),

            name:
              pack.name,

            imageUrl:
              pack.imageUrl ??
              null,

            kind:
              "pack" as const,
          }),
        ),
      ];
    }, [
      eventsQuery.data,
      packsQuery.data,
    ]);

  /* =====================================================
     ORDERS
  ===================================================== */

  const ordersQuery =
    useQuery({
      queryKey: [
        "public-customer-orders",
        user?.id ??
          "guest",
      ],

      queryFn:
        getPublicOrders,

      enabled:
        !demoMode,

      staleTime:
        20_000,

      refetchOnMount:
        true,
    });

  const visibleOrders =
    useMemo(() => {
      const source =
        demoMode
          ? demoOrders
          : ordersQuery.data ??
            [];

      const map =
        new Map<
          string,
          GuestOrder
        >();

      source.forEach(
        (
          order,
        ) => {
          map.set(
            order.id,
            order,
          );
        },
      );

      if (
        !demoMode
      ) {
        demoOrders.forEach(
          (
            order,
          ) => {
            map.set(
              order.id,
              order,
            );
          },
        );
      }

      return Array.from(
        map.values(),
      ).sort(
        (
          a,
          b,
        ) =>
          String(
            b.createdAt,
          ).localeCompare(
            String(
              a.createdAt,
            ),
          ),
      );
    }, [
      demoMode,
      demoOrders,
      ordersQuery.data,
    ]);

  /* =====================================================
     OPEN ORDER
  ===================================================== */

  const openOrder = (
    order:
      GuestOrder,
  ) => {
    const accessToken =
      order.accessToken ||
      getGuestOrderAccess(
        order.id,
      )?.accessToken ||
      "";

    navigate(
      `/commande/${order.id}${
        accessToken
          ? `?token=${encodeURIComponent(
              accessToken,
            )}`
          : ""
      }`,
    );
  };

  /* =====================================================
     FIND ORDER
  ===================================================== */

  const findByReference =
    () => {
      const query =
        reference
          .trim()
          .toUpperCase();

      if (
        !query
      ) {
        setError(
          "Entre une référence de commande.",
        );

        return;
      }

      const order =
        visibleOrders.find(
          (
            item,
          ) =>
            item.reference
              .toUpperCase() ===
            query,
        );

      if (
        !order
      ) {
        setError(
          "Commande introuvable. Vérifie la référence ou connecte-toi avec le compte utilisé lors de la réservation.",
        );

        return;
      }

      setError(
        "",
      );

      openOrder(
        order,
      );
    };

  return (
    <div className="min-h-screen bg-[#090909]">
      <Seo
        title={t(
          "tickets.title",
        )}
        description={t(
          "tickets.description",
        )}
        path="/mes-billets"
        noIndex
      />

      <div className="page-shell pb-20 pt-32 sm:pb-24 sm:pt-36">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span
              className="
                grid
                h-10
                w-10
                place-items-center
                rounded-[13px]
                border
                border-secondary/15
                bg-secondary/[0.08]
                text-secondary
              "
            >
              <Tickets
                size={19}
              />
            </span>

            <span className="eyebrow">
              Mes réservations
            </span>
          </div>

          <h1
            className="
              mt-5
              font-title
              text-[clamp(3rem,6vw,5.4rem)]
              uppercase
              leading-[0.84]
              tracking-[-0.05em]
            "
          >
            Mes billets
          </h1>
        </section>

        {/* =================================================
            LOGIN
        ================================================= */}

        {!user && (
          <section
            className="
              relative
              mt-8
              overflow-hidden
              rounded-[26px]
              border
              border-white/[0.08]
              bg-[#111]
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[radial-gradient(circle_at_0%_0%,rgba(251,146,60,.13),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(255,79,154,.07),transparent_42%)]
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                gap-5
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:p-6
              "
            >
              <div className="flex items-center gap-4">
                <span
                  className="
                    grid
                    h-14
                    w-14
                    shrink-0
                    place-items-center
                    rounded-[17px]
                    border
                    border-secondary/15
                    bg-secondary/[0.08]
                    text-secondary
                  "
                >
                  <UserRound
                    size={23}
                  />
                </span>

                <div>
                  <span
                    className="
                      font-subtitle
                      text-[8px]
                      uppercase
                      tracking-[0.14em]
                      text-secondary
                    "
                  >
                    Ton espace B4F
                  </span>

                  <h2
                    className="
                      mt-1
                      font-title
                      text-[22px]
                      uppercase
                      leading-none
                      text-white
                    "
                  >
                    Tes billets.
                    Toujours avec toi.
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      font-body
                      text-[11px]
                      leading-5
                      text-white/35
                    "
                  >
                    Connecte-toi pour
                    accéder à tes achats
                    depuis tous tes
                    appareils.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  openAuth(
                    "login",
                  )
                }
                className="
                  group
                  flex
                  min-h-[46px]
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-[14px]
                  bg-secondary
                  px-5
                  font-subtitle
                  text-[11px]
                  text-black
                  transition
                  hover:brightness-105
                "
              >
                Se connecter

                <ArrowRight
                  size={15}
                  className="
                    transition-transform
                    group-hover:translate-x-0.5
                  "
                />
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            mt-8
            grid
            gap-7
            lg:grid-cols-[minmax(0,1fr)_340px]
            lg:items-start
          "
        >

          {/* =================================================
              ORDERS
          ================================================= */}

          <section className="min-w-0">

            {/* LOADING */}
            {ordersQuery.isPending &&
            !demoMode ? (
              <div
                className="
                  grid
                  min-h-[360px]
                  place-items-center
                  rounded-[28px]
                  border
                  border-white/[0.07]
                  bg-[#111]
                  p-8
                "
              >
                <div className="text-center">
                  <span
                    className="
                      mx-auto
                      grid
                      h-14
                      w-14
                      place-items-center
                      rounded-full
                      bg-secondary/[0.08]
                    "
                  >
                    <LoaderCircle
                      size={25}
                      className="animate-spin text-secondary"
                    />
                  </span>

                  <p className="mt-5 font-body text-sm text-white/35">
                    Chargement de tes billets…
                  </p>
                </div>
              </div>
            ) : ordersQuery.error &&
              !demoMode ? (
              /* ERROR */
              <div
                className="
                  rounded-[28px]
                  border
                  border-red-500/[0.15]
                  bg-red-500/[0.04]
                  p-8
                  text-center
                "
              >
                <h2 className="font-title text-2xl uppercase">
                  Chargement impossible
                </h2>

                <p className="mt-3 font-body text-sm leading-6 text-white/40">
                  {ordersQuery.error instanceof
                  Error
                    ? ordersQuery
                        .error
                        .message
                    : "Une erreur est survenue."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void ordersQuery.refetch()
                  }
                  className="secondary-button mt-6"
                >
                  <RefreshCw
                    size={17}
                  />

                  Réessayer
                </button>
              </div>
            ) : visibleOrders.length ===
              0 ? (
              /* EMPTY */
              <div
                className="
                  grid
                  min-h-[400px]
                  place-items-center
                  rounded-[28px]
                  border
                  border-white/[0.07]
                  bg-[#111]
                  p-8
                  text-center
                "
              >
                <div className="max-w-md">
                  <span
                    className="
                      mx-auto
                      grid
                      h-20
                      w-20
                      place-items-center
                      rounded-[24px]
                      border
                      border-white/[0.07]
                      bg-[#171717]
                    "
                  >
                    <Ticket
                      className="text-white/18"
                      size={36}
                    />
                  </span>

                  <h2 className="mt-6 font-title text-3xl uppercase">
                    Aucun billet
                  </h2>

                  <p className="mx-auto mt-3 font-body text-sm leading-6 text-white/35">
                    Tes prochains billets
                    apparaîtront ici après
                    ton achat.
                  </p>

                  <Link
                    to="/events"
                    className="
                      mt-6
                      inline-flex
                      min-h-[48px]
                      items-center
                      justify-center
                      gap-2
                      rounded-[14px]
                      bg-secondary
                      px-5
                      font-subtitle
                      text-xs
                      text-black
                      transition
                      hover:brightness-105
                    "
                  >
                    Voir les soirées

                    <ArrowRight
                      size={16}
                    />
                  </Link>
                </div>
              </div>
            ) : (
              /* =================================================
                  ORDER LIST
              ================================================= */

              <div className="space-y-3">
                {visibleOrders.map(
                  (
                    order,
                  ) => {
                    const image =
                      getOrderImage(
                        order,
                        catalog,
                      );

                    const dateLabel =
                      getOrderDateLabel(
                        order,
                        locale,
                      );

                    return (
                      <article
                        key={
                          order.id
                        }
                        className="
                          group
                          overflow-hidden
                          rounded-[24px]
                          border
                          border-white/[0.07]
                          bg-[#111]
                          transition-all
                          duration-300
                          hover:border-white/[0.13]
                          hover:bg-[#131313]
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openOrder(
                              order,
                            )
                          }
                          className="
                            flex
                            w-full
                            flex-col
                            gap-4
                            p-4
                            text-left
                            sm:flex-row
                            sm:items-center
                            sm:p-5
                          "
                        >

                          {/* =================================================
                              IMAGE EVENT / PACK
                          ================================================= */}

                          <div
                            className="
                              relative
                              h-[115px]
                              w-full
                              shrink-0
                              overflow-hidden
                              rounded-[17px]
                              border
                              border-white/[0.06]
                              bg-[#171717]
                              sm:h-[96px]
                              sm:w-[128px]
                            "
                          >
                            {image ? (
                              <>
                                <img
                                  src={
                                    image
                                  }
                                  alt="Événement"
                                  loading="lazy"
                                  className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition-transform
                                    duration-500
                                    group-hover:scale-[1.05]
                                  "
                                />

                                <div
                                  className="
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    bg-gradient-to-t
                                    from-black/25
                                    via-transparent
                                    to-transparent
                                  "
                                />
                              </>
                            ) : (
                              <div
                                className="
                                  grid
                                  h-full
                                  w-full
                                  place-items-center
                                  bg-gradient-to-br
                                  from-[#1c1c1c]
                                  to-[#101010]
                                "
                              >
                                <Ticket
                                  size={26}
                                  className="text-white/12"
                                />
                              </div>
                            )}
                          </div>

                          {/* =================================================
                              INFOS
                          ================================================= */}

                          <div className="min-w-0 flex-1">
                            <span
                              className="
                                font-subtitle
                                text-[8px]
                                uppercase
                                tracking-[0.13em]
                                text-white/25
                              "
                            >
                              Commande
                            </span>

                            <strong
                              className="
                                mt-1
                                block
                                truncate
                                font-subtitle
                                text-sm
                                text-white/85
                              "
                            >
                              {
                                order.reference
                              }
                            </strong>

                            <div
                              className="
                                mt-2.5
                                flex
                                flex-wrap
                                items-center
                                gap-x-3
                                gap-y-2
                                font-body
                                text-[10px]
                                text-white/30
                              "
                            >
                              <span className="flex items-center gap-1.5">
                                <Tickets
                                  size={12}
                                  className="shrink-0"
                                />

                                {
                                  order
                                    .tickets
                                    .length
                                }{" "}
                                billet
                                {order
                                  .tickets
                                  .length >
                                1
                                  ? "s"
                                  : ""}
                              </span>

                              {dateLabel && (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-white/15" />

                                  <span
                                    className="
                                      flex
                                      min-w-0
                                      items-center
                                      gap-1.5
                                    "
                                  >
                                    <CalendarDays
                                      size={12}
                                      className="shrink-0"
                                    />

                                    <span>
                                      {
                                        dateLabel
                                      }
                                    </span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* =================================================
                              PRICE
                          ================================================= */}

                          <div
                            className="
                              flex
                              shrink-0
                              items-center
                              justify-between
                              gap-5
                              border-t
                              border-white/[0.06]
                              pt-4
                              sm:border-l
                              sm:border-t-0
                              sm:pl-5
                              sm:pt-0
                            "
                          >
                            <div className="sm:text-right">
                              <span
                                className="
                                  block
                                  font-body
                                  text-[8px]
                                  uppercase
                                  tracking-[0.08em]
                                  text-white/22
                                "
                              >
                                Total
                              </span>

                              <strong
                                className="
                                  mt-0.5
                                  block
                                  font-title
                                  text-2xl
                                  text-white/90
                                "
                              >
                                {formatMoney(
                                  order.total,
                                  locale,
                                )}
                              </strong>
                            </div>

                            <span
                              className="
                                grid
                                h-11
                                w-11
                                shrink-0
                                place-items-center
                                rounded-full
                                bg-secondary
                                text-black
                                transition-all
                                duration-300
                                group-hover:translate-x-0.5
                                group-hover:brightness-105
                              "
                            >
                              <ArrowRight
                                size={18}
                              />
                            </span>
                          </div>
                        </button>
                      </article>
                    );
                  },
                )}
              </div>
            )}
          </section>

          {/* =================================================
              RETROUVER COMMANDE
          ================================================= */}

          <aside
            className="
              h-fit
              rounded-[26px]
              border
              border-white/[0.07]
              bg-[#111]
              p-5
              sm:p-6
              lg:sticky
              lg:top-28
            "
          >

            {/* PETIT HEADER SEULEMENT */}
            <div className="flex items-center gap-3">
              <span
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-[12px]
                  border
                  border-secondary/15
                  bg-secondary/[0.07]
                  text-secondary
                "
              >
                <Search
                  size={17}
                />
              </span>

              <span
                className="
                  font-subtitle
                  text-[8px]
                  uppercase
                  tracking-[0.14em]
                  text-secondary
                "
              >
                Accès rapide
              </span>
            </div>

            <h2
              className="
                mt-5
                font-title
                text-[24px]
                uppercase
                leading-[0.92]
              "
            >
              Retrouver
              <br />
              une commande
            </h2>

            
            <div className="mt-2">
              <label
                className="
                  font-subtitle
                  text-[9px]
                  uppercase
                  tracking-[0.1em]
                  text-white/30
                "
              >
                Référence
              </label>

              <div
                className={`
                  mt-2
                  flex
                  min-h-[52px]
                  items-center
                  gap-3
                  rounded-[15px]
                  border
                  bg-[#171717]
                  px-4
                  transition

                  ${
                    error
                      ? "border-red-400/30"
                      : "border-white/[0.07] focus-within:border-white/[0.15]"
                  }
                `}
              >
                <Search
                  size={16}
                  className="shrink-0 text-white/20"
                />

                <input
                  value={
                    reference
                  }
                  onChange={(
                    event,
                  ) => {
                    setReference(
                      event.target.value,
                    );

                    if (
                      error
                    ) {
                      setError(
                        "",
                      );
                    }
                  }}
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      findByReference();
                    }
                  }}
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    font-body
                    text-sm
                    uppercase
                    text-white/80
                    outline-none
                    ring-0
                    placeholder:normal-case
                    placeholder:text-white/18
                    focus:outline-none
                    focus:ring-0
                  "
                  placeholder="B4F-WEB-…"
                />
              </div>

              {/* ERROR */}
              {error && (
                <p
                  className="
                    mt-2
                    font-body
                    text-[10px]
                    leading-5
                    text-red-300/80
                  "
                >
                  {error}
                </p>
              )}

              {/* BUTTON */}
              <button
                type="button"
                onClick={
                  findByReference
                }
                className="
                  group
                  mt-3
                  flex
                  min-h-[50px]
                  w-full
                  items-center
                  justify-center
                  gap-2.5
                  rounded-[14px]
                  bg-secondary
                  px-5
                  font-subtitle
                  text-xs
                  text-black
                  transition
                  hover:brightness-105
                "
              >
                Rechercher

                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    group-hover:translate-x-0.5
                  "
                />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}