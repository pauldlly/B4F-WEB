import {
  ArrowLeft,
  Armchair,
  BadgePlus,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  MapPin,
  ShoppingBag,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { QuantityInput } from "../components/QuantityInput";
import { Seo } from "../components/Seo";
import { PageSkeleton } from "../components/Skeletons";

import { useEventDetail } from "../hooks/useCatalogQueries";

import { useI18n } from "../i18n/LanguageProvider";

import {
  eventGenderRemaining,
  eventTypeLabel,
  formatEventDate,
  formatMoney,
  parseEventDate,
} from "../lib/format";

import { useCart } from "../providers/CartProvider";

import type {
  SelectedExtra,
} from "../types";

/* =========================================================
   HELPERS
========================================================= */

function formatClock(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  return value.slice(
    0,
    5,
  );
}

function formatExtraMoney(
  value: number,
  locale: string,
) {
  const hasDecimals =
    Math.abs(
      value % 1,
    ) >
    Number.EPSILON;

  return new Intl.NumberFormat(
    locale ||
      "fr-FR",
    {
      style:
        "currency",

      currency:
        "EUR",

      minimumFractionDigits:
        hasDecimals
          ? 2
          : 0,

      maximumFractionDigits:
        hasDecimals
          ? 2
          : 0,
    },
  ).format(
    value,
  );
}

/* =========================================================
   PAGE
========================================================= */

export function EventPage() {
  const {
    eventId,
  } =
    useParams();

  const navigate =
    useNavigate();

  const id =
    Number(
      eventId,
    );

  const query =
    useEventDetail(
      id,
    );

  const {
    addItem,
    items:
      cartItems,
    setOpen,
  } =
    useCart();

  const {
    t,
    locale,
  } =
    useI18n();

  const [
    womenQuantity,
    setWomenQuantity,
  ] =
    useState(
      0,
    );

  const [
    menQuantity,
    setMenQuantity,
  ] =
    useState(
      0,
    );

  const [
    optionQuantities,
    setOptionQuantities,
  ] =
    useState<
      Record<
        number,
        number
      >
    >({});

  const [
    selectedTableId,
    setSelectedTableId,
  ] =
    useState<
      number |
      null
    >(
      null,
    );

  const [
    cartError,
    setCartError,
  ] =
    useState(
      "",
    );

  const event =
    query.data ??
    null;

  /* =====================================================
     STOCK
  ===================================================== */

  const womenRemaining =
    event
      ? eventGenderRemaining(
          event,
          "woman",
        )
      : null;

  const menRemaining =
    event
      ? eventGenderRemaining(
          event,
          "man",
        )
      : null;

  /* =====================================================
     RESET
  ===================================================== */

  useEffect(
    () => {
      if (
        !event
      ) {
        return;
      }

      setWomenQuantity(
        0,
      );

      setMenQuantity(
        0,
      );

      setOptionQuantities(
        {},
      );

      setSelectedTableId(
        null,
      );

      setCartError(
        "",
      );
    },
    [
      event?.id,
    ],
  );

  /* =====================================================
     STOCK WOMEN
  ===================================================== */

  useEffect(
    () => {
      if (
        womenRemaining ===
        null
      ) {
        return;
      }

      setWomenQuantity(
        (
          current,
        ) =>
          Math.min(
            Math.max(
              current,
              0,
            ),

            Math.max(
              womenRemaining,
              0,
            ),
          ),
      );
    },
    [
      womenRemaining,
    ],
  );

  /* =====================================================
     STOCK MEN
  ===================================================== */

  useEffect(
    () => {
      if (
        menRemaining ===
        null
      ) {
        return;
      }

      setMenQuantity(
        (
          current,
        ) =>
          Math.min(
            Math.max(
              current,
              0,
            ),

            Math.max(
              menRemaining,
              0,
            ),
          ),
      );
    },
    [
      menRemaining,
    ],
  );

  /* =====================================================
     TOTAL TICKETS
  ===================================================== */

  const totalTicketQuantity =
    womenQuantity +
    menQuantity;

  /* =====================================================
     OPTIONS LIMIT
  ===================================================== */

  useEffect(
    () => {
      setOptionQuantities(
        (
          current,
        ) =>
          Object.fromEntries(
            Object.entries(
              current,
            ).map(
              (
                [
                  key,
                  value,
                ],
              ) => [
                key,

                Math.min(
                  Math.max(
                    0,
                    Number(
                      value,
                    ) ||
                      0,
                  ),

                  totalTicketQuantity,
                ),
              ],
            ),
          ),
      );
    },
    [
      totalTicketQuantity,
    ],
  );

  /* =====================================================
     EXTRAS
  ===================================================== */

  const extras =
    useMemo<
      SelectedExtra[]
    >(
      () => {
        const optionExtras =
          (
            event?.options ??
            []
          )
            .map(
              (
                option,
              ) => ({
                key:
                  `event-option:${event?.id}:${option.id}`,

                kind:
                  "option" as const,

                id:
                  option.id,

                packEventId:
                  null,

                eventId:
                  event?.id ??
                  0,

                name:
                  option.name,

                quantity:
                  optionQuantities[
                    option.id
                  ] ??
                  0,

                unitPrice:
                  option.price,
              }),
            )
            .filter(
              (
                option,
              ) =>
                option.quantity >
                0,
            );

        const selectedTable =
          (
            event?.tables ??
            []
          ).find(
            (
              table,
            ) =>
              table.id ===
              selectedTableId,
          );

        const tableExtra:
          SelectedExtra[] =
          selectedTable
            ? [
                {
                  key:
                    `event-table:${event?.id}:${selectedTable.id}`,

                  kind:
                    "table",

                  id:
                    selectedTable.id,

                  packEventId:
                    null,

                  eventId:
                    event?.id ??
                    0,

                  name:
                    selectedTable.name,

                  quantity:
                    1,

                  unitPrice:
                    selectedTable.depositPrice,

                  fullPrice:
                    selectedTable.fullPrice,

                  depositPercentage:
                    selectedTable.depositPercentage,
                },
              ]
            : [];

        return [
          ...optionExtras,
          ...tableExtra,
        ];
      },
      [
        event,
        optionQuantities,
        selectedTableId,
      ],
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    query.isPending
  ) {
    return (
      <PageSkeleton />
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (
    query.error ||
    !event
  ) {
    return (
      <div
        className="
          page-shell
          pb-16
          pt-[72px]
          text-center

          sm:pb-20
          sm:pt-24

          lg:pb-24
          lg:pt-32
        "
      >
        <Seo
          title={t(
            "event.unavailableTitle",
          )}
          description={t(
            "event.unavailableText",
          )}
          noIndex
        />

        <CircleAlert
          className="
            mx-auto
            text-white/20
          "
          size={
            48
          }
        />

        <h1
          className="
            mt-4
            font-title
            text-3xl
            uppercase
          "
        >
          {t(
            "event.unavailableTitle",
          )}
        </h1>

        <p
          className="
            mt-2
            font-body
            text-white/40
          "
        >
          {t(
            "event.unavailableText",
          )}
        </p>

        <Link
          to="/events"
          className="
            secondary-button
            mt-5
          "
        >
          {t(
            "common.back",
          )}
        </Link>
      </div>
    );
  }

  /* =====================================================
     MINI DESCRIPTION
  ===================================================== */

  const miniDescription =
    (
      event as typeof event & {
        miniDescription?:
          | string
          | null;

        mini_description?:
          | string
          | null;
      }
    ).miniDescription ??
    (
      event as typeof event & {
        mini_description?:
          | string
          | null;
      }
    ).mini_description ??
    null;

  /* =====================================================
     TOTALS
  ===================================================== */

  const ticketTotal =
    event.womenPrice *
      womenQuantity +
    event.menPrice *
      menQuantity;

  const extrasTotal =
    extras.reduce(
      (
        sum,
        extra,
      ) =>
        sum +
        extra.unitPrice *
          extra.quantity,
      0,
    );

  const total =
    ticketTotal +
    extrasTotal;

  const cannotBuy =
    event.soldout ||
    totalTicketQuantity <=
      0;

  /* =====================================================
     SEO DATA
  ===================================================== */

  const siteUrl =
    import.meta.env
      .VITE_PUBLIC_SITE_URL ||
    window.location.origin;

  const startDate =
    parseEventDate(
      event.eventDate,
      event.startTime,
    );

  const typeKey =
    event.type
      ? `eventTypes.${event.type}`
      : "";

  const translatedType =
    typeKey &&
    t(
      typeKey,
    ) !==
      typeKey
      ? t(
          typeKey,
        )
      : eventTypeLabel(
          event.type,
        );

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const addToCart =
    () => {
      if (
        cannotBuy
      ) {
        return;
      }

      /* ===============================================
         NO PACK + EVENT MIX
      =============================================== */

      if (
        cartItems.some(
          (
            item,
          ) =>
            item.kind ===
            "pack",
        )
      ) {
        setCartError(
          t(
            "pack.noMixedCart",
          ),
        );

        return;
      }

      setCartError(
        "",
      );

      let extrasAdded =
        false;

      /* ===============================================
         WOMEN
      =============================================== */

      if (
        womenQuantity >
        0
      ) {
        addItem({
          kind:
            "event",

          key:
            `event:${event.id}:woman`,

          eventId:
            event.id,

          eventName:
            event.name,

          eventDate:
            event.eventDate,

          startTime:
            event.startTime,

          location:
            event.location,

          imageUrl:
            event.imageUrl,

          gender:
            "woman",

          quantity:
            womenQuantity,

          unitPrice:
            event.womenPrice,

          maximumAvailable:
            womenRemaining,

          extras,
        });

        extrasAdded =
          extras.length >
          0;
      }

      /* ===============================================
         MEN
      =============================================== */

      if (
        menQuantity >
        0
      ) {
        addItem({
          kind:
            "event",

          key:
            `event:${event.id}:man`,

          eventId:
            event.id,

          eventName:
            event.name,

          eventDate:
            event.eventDate,

          startTime:
            event.startTime,

          location:
            event.location,

          imageUrl:
            event.imageUrl,

          gender:
            "man",

          quantity:
            menQuantity,

          unitPrice:
            event.menPrice,

          maximumAvailable:
            menRemaining,

          extras:
            extrasAdded
              ? []
              : extras,
        });
      }

      navigate(
        "/events",
      );

      setOpen(
        true,
      );
    };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="
        min-h-screen
        bg-[#090909]
      "
    >
      {/* =================================================
          SEO
      ================================================= */}

      <Seo
        title={
          event.name
        }
        description={
          event.description ||
          `B4F EVENTS — ${event.name}`
        }
        path={
          `/event/${event.id}`
        }
        image={
          event.imageUrl
        }
        structuredData={{
          "@context":
            "https://schema.org",

          "@type":
            "Event",

          name:
            event.name,

          description:
            event.description,

          startDate:
            startDate?.toISOString(),

          eventStatus:
            "https://schema.org/EventScheduled",

          eventAttendanceMode:
            "https://schema.org/OfflineEventAttendanceMode",

          location: {
            "@type":
              "Place",

            name:
              event.location,

            address:
              event.address,
          },

          offers: {
            "@type":
              "Offer",

            url:
              `${siteUrl}/event/${event.id}`,

            price:
              Math.min(
                event.womenPrice,
                event.menPrice,
              ),

            priceCurrency:
              "EUR",

            availability:
              event.soldout
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
          },

          organizer: {
            "@type":
              "Organization",

            name:
              "B4F EVENTS",

            url:
              siteUrl,
          },
        }}
      />

      {/* =================================================
          MAIN
      ================================================= */}

      <div
        className="
          page-shell

          pb-12
          pt-[72px]

          sm:pb-16
          sm:pt-24

          lg:pb-20
          lg:pt-28
        "
      >
        {/* =================================================
            BACK
        ================================================= */}

        <Link
          to="/events"
          className="
            group
            inline-flex

            h-9

            items-center
            gap-2
            rounded-full
            border
            border-white/[0.09]
            bg-[#141414]

            pl-1.5
            pr-3.5

            font-subtitle
            text-[9px]
            uppercase
            tracking-[0.12em]
            text-white/45

            transition-all
            duration-300

            sm:h-10
            sm:gap-2.5
            sm:pl-2
            sm:pr-4
            sm:text-[10px]

            hover:border-white/[0.16]
            hover:bg-[#181818]
            hover:text-white
          "
        >
          <span
            className="
              grid
              h-6
              w-6
              place-items-center
              rounded-full
              bg-white/[0.06]
              transition-transform
              duration-300

              sm:h-7
              sm:w-7

              group-hover:-translate-x-0.5
            "
          >
            <ArrowLeft
              size={
                13
              }
            />
          </span>

          Retour aux soirées
        </Link>

        {/* =================================================
            GRID
        ================================================= */}

        <div
          className="
            mt-3
            grid
            gap-5

            sm:mt-5
            sm:gap-7

            lg:mt-6
            lg:grid-cols-[minmax(0,1fr)_430px]
            lg:items-start
            lg:gap-8
          "
        >
          {/* =================================================
              LEFT
          ================================================= */}

          <section className="min-w-0">
            {/* ===============================================
                IMAGE
            =============================================== */}

            <div
              className="
                relative

                h-[320px]

                overflow-hidden
                rounded-[22px]
                border
                border-white/[0.08]
                bg-[#111]

                sm:h-[480px]
                sm:rounded-[26px]

                lg:h-[560px]
                lg:rounded-[28px]
              "
            >
              {event.imageUrl ? (
                <img
                  src={
                    event.imageUrl
                  }
                  alt={
                    event.name
                  }
                  className={`
                    h-full
                    w-full
                    object-cover

                    ${
                      event.soldout
                        ? "sold-out-image"
                        : ""
                    }
                  `}
                  fetchPriority="high"
                />
              ) : (
                <div
                  className="
                    grid
                    h-full
                    place-items-center
                  "
                >
                  <span
                    className="
                      font-title
                      text-7xl
                      text-white/[0.07]

                      sm:text-8xl
                    "
                  >
                    B4F
                  </span>
                </div>
              )}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[linear-gradient(180deg,rgba(0,0,0,.12)_0%,transparent_50%,rgba(0,0,0,.32)_100%)]
                "
              />

              {event.soldout && (
                <div
                  className="
                    sold-out-shade
                    absolute
                    inset-0
                  "
                />
              )}

              {/* TYPE */}

              <div
                className="
                  absolute

                  left-3
                  right-3
                  top-3

                  flex
                  items-start
                  justify-between
                  gap-3

                  sm:left-5
                  sm:right-5
                  sm:top-5
                "
              >
                <span
                  className="
                    rounded-full
                    border
                    border-white/[0.12]
                    bg-black/50

                    px-3
                    py-1.5

                    font-subtitle
                    text-[8px]
                    uppercase
                    tracking-[0.14em]
                    text-white/75
                    backdrop-blur-xl

                    sm:px-4
                    sm:py-2
                    sm:text-[9px]
                  "
                >
                  {
                    translatedType
                  }
                </span>

                {event.soldout && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-red-300/25
                      bg-red-500/[0.18]

                      px-3
                      py-1.5

                      font-subtitle
                      text-[8px]
                      uppercase
                      tracking-[0.14em]
                      text-red-100
                      backdrop-blur-xl

                      sm:px-4
                      sm:py-2
                      sm:text-[9px]
                    "
                  >
                    <CircleAlert
                      size={
                        13
                      }
                    />

                    {t(
                      "common.soldOut",
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* ===============================================
                TITLE
            =============================================== */}

            <div
              className="
                mt-3

                sm:mt-5
              "
            >
              <h1
                className="
                  max-w-4xl
                  bg-gradient-to-r
                  from-[#ff963f]
                  via-[#ff724d]
                  to-[#ff4f9a]
                  bg-clip-text
                  font-title

                  text-2xl

                  uppercase
                  leading-[0.88]
                  text-transparent

                  sm:text-4xl
                "
              >
                {
                  event.name
                }
              </h1>
            </div>

            {/* ===============================================
                INFOS
            =============================================== */}

            <div
              className="
                mt-4
                overflow-hidden

                rounded-[20px]

                border
                border-white/[0.08]
                bg-[#111]

                sm:mt-5
                sm:rounded-[24px]
              "
            >
              <div
                className="
                  grid
                  divide-y
                  divide-white/[0.07]

                  md:grid-cols-[0.9fr_0.8fr_1.3fr]
                  md:divide-x
                  md:divide-y-0
                "
              >
                {/* DATE */}

                <div
                  className="
                    flex

                    min-h-[86px]

                    items-center
                    gap-3

                    px-4
                    py-4

                    sm:min-h-[108px]
                    sm:gap-4
                    sm:px-5
                    sm:py-5
                  "
                >
                  <span
                    className="
                      grid

                      h-10
                      w-10

                      shrink-0
                      place-items-center
                      rounded-[12px]
                      bg-[#191919]
                      text-white/40

                      sm:h-11
                      sm:w-11
                      sm:rounded-[13px]
                    "
                  >
                    <CalendarDays
                      size={
                        18
                      }
                    />
                  </span>

                  <div className="min-w-0">
                    <span
                      className="
                        block
                        font-subtitle
                        text-[8px]
                        uppercase
                        tracking-[0.16em]
                        text-white/25

                        sm:text-[9px]
                      "
                    >
                      Date
                    </span>

                    <strong
                      className="
                        mt-1
                        block
                        font-subtitle

                        text-[13px]

                        leading-5
                        text-white/85

                        sm:text-[15px]
                      "
                    >
                      {formatEventDate(
                        event.eventDate,
                        null,
                        {
                          locale,

                          includeYear:
                            false,

                          includeTime:
                            false,
                        },
                      )}
                    </strong>
                  </div>
                </div>

                {/* HOURS */}

                <div
                  className="
                    flex

                    min-h-[86px]

                    items-center
                    gap-3

                    px-4
                    py-4

                    sm:min-h-[108px]
                    sm:gap-4
                    sm:px-5
                    sm:py-5
                  "
                >
                  <span
                    className="
                      grid
                      h-10
                      w-10
                      shrink-0
                      place-items-center
                      rounded-[12px]
                      bg-[#191919]
                      text-white/40

                      sm:h-11
                      sm:w-11
                      sm:rounded-[13px]
                    "
                  >
                    <Clock3
                      size={
                        18
                      }
                    />
                  </span>

                  <div className="min-w-0">
                    <span
                      className="
                        block
                        font-subtitle
                        text-[8px]
                        uppercase
                        tracking-[0.16em]
                        text-white/25

                        sm:text-[9px]
                      "
                    >
                      Horaires
                    </span>

                    <div
                      className="
                        mt-1
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <strong
                        className="
                          font-subtitle
                          text-[13px]
                          text-white/85

                          sm:text-[15px]
                        "
                      >
                        {formatClock(
                          event.startTime,
                        )}
                      </strong>

                      <span
                        className="
                          text-[13px]
                          text-white/20
                        "
                      >
                        →
                      </span>

                      <strong
                        className="
                          font-subtitle
                          text-[13px]
                          text-white/85

                          sm:text-[15px]
                        "
                      >
                        {formatClock(
                          event.endTime,
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* LOCATION */}

                <div
                  className="
                    flex

                    min-h-[86px]

                    items-center
                    gap-3

                    px-4
                    py-4

                    sm:min-h-[108px]
                    sm:gap-4
                    sm:px-5
                    sm:py-5
                  "
                >
                  <span
                    className="
                      grid
                      h-10
                      w-10
                      shrink-0
                      place-items-center
                      rounded-[12px]
                      bg-[#191919]
                      text-white/40

                      sm:h-11
                      sm:w-11
                      sm:rounded-[13px]
                    "
                  >
                    <MapPin
                      size={
                        18
                      }
                    />
                  </span>

                  <div className="min-w-0">
                    <span
                      className="
                        block
                        font-subtitle
                        text-[8px]
                        uppercase
                        tracking-[0.16em]
                        text-white/25

                        sm:text-[9px]
                      "
                    >
                      Lieu
                    </span>

                    <strong
                      className="
                        mt-1
                        block
                        truncate
                        font-subtitle
                        text-[13px]
                        leading-5
                        text-white/85

                        sm:text-[15px]
                      "
                    >
                      {event.location ||
                        event.address ||
                        t(
                          "common.placeTbd",
                        )}
                    </strong>

                    {event.location &&
                      event.address &&
                      event.address !==
                        event.location && (
                        <p
                          className="
                            mt-1
                            line-clamp-2
                            max-w-[290px]
                            font-body
                            text-[9px]
                            leading-4
                            text-white/30

                            sm:text-[10px]
                          "
                        >
                          {
                            event.address
                          }
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* ===============================================
                DESCRIPTION
            =============================================== */}

            {event.description && (
              <div
                className="
                  mt-5
                  rounded-[22px]
                  border
                  border-white/[0.07]
                  bg-[#111]

                  p-4

                  sm:mt-7
                  sm:rounded-[26px]
                  sm:p-7
                "
              >
                <p
                  className="
                    whitespace-pre-wrap
                    break-words
                    font-body

                    text-[13px]
                    leading-6

                    text-white/55

                    sm:text-[15px]
                    sm:leading-8
                  "
                >
                  {
                    event.description
                  }
                </p>
              </div>
            )}

            {/* ===============================================
                SOLD OUT
            =============================================== */}

            {event.soldout && (
              <div
                className="
                  mt-5
                  flex
                  gap-4
                  rounded-[20px]
                  border
                  border-red-500/[0.18]
                  bg-red-500/[0.055]
                  p-4

                  sm:mt-7
                  sm:rounded-[24px]
                  sm:p-5
                "
              >
                <CircleAlert
                  className="
                    shrink-0
                    text-red-300
                  "
                  size={
                    22
                  }
                />

                <p
                  className="
                    font-body
                    text-sm
                    leading-6
                    text-red-100/75
                  "
                >
                  {t(
                    "event.fullNotice",
                  )}
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              RESERVATION
          ================================================= */}

          <aside
            className="
              h-fit
              rounded-[22px]
              border
              border-white/[0.08]
              bg-[#111]

              p-4

              sm:rounded-[26px]
              sm:p-6

              lg:sticky
              lg:top-28
              lg:rounded-[28px]
            "
          >
            <span className="eyebrow">
              {t(
                "event.reservation",
              )}
            </span>

            <div
              className="
                mt-2
                flex
                items-end
                justify-between
                gap-4
              "
            >
              <h2
                className="
                  font-title
                  text-xl
                  uppercase

                  sm:text-2xl
                "
              >
                {t(
                  "event.yourTickets",
                )}
              </h2>

              {totalTicketQuantity >
                0 && (
                <span
                  className="
                    shrink-0
                    rounded-full
                    border
                    border-white/[0.07]
                    bg-[#161616]

                    px-2.5
                    py-1.5

                    font-subtitle
                    text-[8px]
                    uppercase
                    tracking-[0.08em]
                    text-white/35

                    sm:px-3
                    sm:text-[9px]
                  "
                >
                  {
                    totalTicketQuantity
                  }{" "}
                  billet
                  {totalTicketQuantity >
                  1
                    ? "s"
                    : ""}
                </span>
              )}
            </div>

            {/* =================================================
                WOMEN + MEN
            ================================================= */}

            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-2

                sm:mt-6
                sm:gap-3
              "
            >
              {/* WOMEN */}

              <div
                className={`
                  relative
                  rounded-[18px]
                  border

                  p-3

                  transition

                  sm:rounded-[22px]
                  sm:p-4

                  ${
                    womenQuantity >
                    0
                      ? "border-[#ff4f9a]/40 bg-[#ff4f9a]/[0.07]"
                      : "border-white/[0.08] bg-[#151515]"
                  }
                `}
              >
                {womenQuantity >
                  0 && (
                  <span
                    className="
                      absolute
                      right-2.5
                      top-2.5
                      grid
                      h-5
                      w-5
                      place-items-center
                      rounded-full
                      bg-[#ff4f9a]/15
                      text-[#ff6aa8]

                      sm:right-3
                      sm:top-3
                      sm:h-6
                      sm:w-6
                    "
                  >
                    <Check
                      size={
                        12
                      }
                    />
                  </span>
                )}

                <span
                  className="
                    font-subtitle
                    text-[9px]
                    uppercase
                    tracking-[0.1em]
                    text-white/40

                    sm:text-[10px]
                  "
                >
                  Femme
                </span>

                <strong
                  className="
                    mt-1
                    block
                    font-title
                    text-xl
                    text-[#ff6aa8]

                    sm:text-2xl
                  "
                >
                  {formatMoney(
                    event.womenPrice,
                    locale,
                  )}
                </strong>

                {miniDescription && (
                  <p
                    className="
                      mt-1.5
                      whitespace-pre-wrap
                      break-words
                      font-body
                      text-[9px]
                      leading-[14px]
                      text-white/50

                      sm:mt-2
                      sm:text-[10px]
                      sm:leading-[16px]
                    "
                  >
                    {
                      miniDescription
                    }
                  </p>
                )}

                <p
                  className="
                    mt-2
                    font-body
                    text-[9px]
                    text-white/25

                    sm:text-[10px]
                  "
                >
                  {womenRemaining ===
                  null
                    ? t(
                        "event.unknownStock",
                      )
                    : t(
                        "event.remaining",
                        {
                          count:
                            womenRemaining,
                        },
                      )}
                </p>

                <div
                  className="
                    mt-3
                    flex
                    justify-start

                    sm:mt-4
                  "
                >
                  {womenRemaining ===
                  0 ? (
                    <span
                      className="
                        font-subtitle
                        text-[8px]
                        uppercase
                        tracking-[0.1em]
                        text-red-300/70

                        sm:text-[9px]
                      "
                    >
                      Sold out
                    </span>
                  ) : (
                    <QuantityInput
                      compact
                      value={
                        womenQuantity
                      }
                      minimum={
                        0
                      }
                      maximum={
                        womenRemaining
                      }
                      onChange={(
                        value,
                      ) => {
                        setWomenQuantity(
                          value,
                        );

                        setCartError(
                          "",
                        );
                      }}
                    />
                  )}
                </div>
              </div>

              {/* MEN */}

              <div
                className={`
                  relative
                  rounded-[18px]
                  border

                  p-3

                  transition

                  sm:rounded-[22px]
                  sm:p-4

                  ${
                    menQuantity >
                    0
                      ? "border-secondary/40 bg-secondary/[0.07]"
                      : "border-white/[0.08] bg-[#151515]"
                  }
                `}
              >
                {menQuantity >
                  0 && (
                  <span
                    className="
                      absolute
                      right-2.5
                      top-2.5
                      grid
                      h-5
                      w-5
                      place-items-center
                      rounded-full
                      bg-secondary/15
                      text-secondary

                      sm:right-3
                      sm:top-3
                      sm:h-6
                      sm:w-6
                    "
                  >
                    <Check
                      size={
                        12
                      }
                    />
                  </span>
                )}

                <span
                  className="
                    font-subtitle
                    text-[9px]
                    uppercase
                    tracking-[0.1em]
                    text-white/40

                    sm:text-[10px]
                  "
                >
                  Homme
                </span>

                <strong
                  className="
                    mt-1
                    block
                    font-title
                    text-xl
                    text-secondary

                    sm:text-2xl
                  "
                >
                  {formatMoney(
                    event.menPrice,
                    locale,
                  )}
                </strong>

                {miniDescription && (
                  <p
                    className="
                      mt-1.5
                      whitespace-pre-wrap
                      break-words
                      font-body
                      text-[9px]
                      leading-[14px]
                      text-white/50

                      sm:mt-2
                      sm:text-[10px]
                      sm:leading-[16px]
                    "
                  >
                    {
                      miniDescription
                    }
                  </p>
                )}

                <p
                  className="
                    mt-2
                    font-body
                    text-[9px]
                    text-white/25

                    sm:text-[10px]
                  "
                >
                  {menRemaining ===
                  null
                    ? t(
                        "event.unknownStock",
                      )
                    : t(
                        "event.remaining",
                        {
                          count:
                            menRemaining,
                        },
                      )}
                </p>

                <div
                  className="
                    mt-3
                    flex
                    justify-start

                    sm:mt-4
                  "
                >
                  {menRemaining ===
                  0 ? (
                    <span
                      className="
                        font-subtitle
                        text-[8px]
                        uppercase
                        tracking-[0.1em]
                        text-red-300/70

                        sm:text-[9px]
                      "
                    >
                      Sold out
                    </span>
                  ) : (
                    <QuantityInput
                      compact
                      value={
                        menQuantity
                      }
                      minimum={
                        0
                      }
                      maximum={
                        menRemaining
                      }
                      onChange={(
                        value,
                      ) => {
                        setMenQuantity(
                          value,
                        );

                        setCartError(
                          "",
                        );
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                OPTIONS
            ================================================= */}

            {event.options.length >
              0 && (
              <div
                className="
                  mt-5

                  sm:mt-7
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      grid
                      h-9
                      w-9
                      shrink-0
                      place-items-center
                      rounded-[11px]
                      border
                      border-secondary/15
                      bg-secondary/[0.08]
                      text-secondary

                      sm:h-10
                      sm:w-10
                      sm:rounded-[12px]
                    "
                  >
                    <BadgePlus
                      size={
                        17
                      }
                    />
                  </span>

                  <div className="min-w-0">
                    <strong
                      className="
                        font-subtitle
                        text-[13px]
                        text-white/90

                        sm:text-sm
                      "
                    >
                      Options
                    </strong>

                    <p
                      className="
                        mt-0.5
                        font-body
                        text-[9px]
                        leading-4
                        text-white/30

                        sm:text-[10px]
                      "
                    >
                      Les options s’ajoutent au prix de tes billets.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-3
                    space-y-2
                  "
                >
                  {event.options.map(
                    (
                      option,
                    ) => {
                      const optionQuantity =
                        optionQuantities[
                          option.id
                        ] ??
                        0;

                      const selected =
                        optionQuantity >
                        0;

                      const disabled =
                        totalTicketQuantity ===
                        0;

                      return (
                        <div
                          key={
                            option.id
                          }
                          className={`
                            rounded-[16px]
                            border

                            p-3

                            transition

                            sm:rounded-[18px]
                            sm:p-4

                            ${
                              selected
                                ? "border-secondary/25 bg-secondary/[0.055]"
                                : "border-white/[0.07] bg-[#151515]"
                            }
                          `}
                        >
                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-3

                              sm:gap-4
                            "
                          >
                            <div
                              className="
                                min-w-0
                                flex-1
                              "
                            >
                              <strong
                                className="
                                  block
                                  font-subtitle
                                  text-[13px]
                                  leading-5
                                  text-white/85

                                  sm:text-sm
                                "
                              >
                                {
                                  option.name
                                }
                              </strong>

                              {option.description && (
                                <p
                                  className="
                                    mt-1
                                    whitespace-pre-wrap
                                    break-words
                                    font-body
                                    text-[9px]
                                    leading-[15px]
                                    text-white/35

                                    sm:mt-1.5
                                    sm:text-[10px]
                                    sm:leading-[17px]
                                  "
                                >
                                  {
                                    option.description
                                  }
                                </p>
                              )}

                              <div
                                className="
                                  mt-2
                                  flex
                                  flex-wrap
                                  items-end
                                  gap-x-2
                                  gap-y-1
                                "
                              >
                                <strong
                                  className="
                                    font-title
                                    text-[19px]
                                    leading-none
                                    text-secondary

                                    sm:text-[21px]
                                  "
                                >
                                  +
                                  {formatExtraMoney(
                                    option.price,
                                    locale,
                                  )}
                                </strong>

                                <span
                                  className="
                                    pb-[1px]
                                    font-body
                                    text-[7px]
                                    uppercase
                                    tracking-[0.08em]
                                    text-white/25

                                    sm:text-[8px]
                                  "
                                >
                                  par option
                                </span>
                              </div>
                            </div>

                            <div
                              className={`
                                shrink-0

                                ${
                                  disabled
                                    ? "pointer-events-none opacity-30"
                                    : ""
                                }
                              `}
                            >
                              <QuantityInput
                                compact
                                value={
                                  optionQuantity
                                }
                                minimum={
                                  0
                                }
                                maximum={
                                  totalTicketQuantity
                                }
                                onChange={(
                                  value,
                                ) =>
                                  setOptionQuantities(
                                    (
                                      current,
                                    ) => ({
                                      ...current,

                                      [option.id]:
                                        value,
                                    }),
                                  )
                                }
                              />
                            </div>
                          </div>

                          {selected && (
                            <div
                              className="
                                mt-3
                                flex
                                items-center
                                justify-between
                                gap-3
                                border-t
                                border-white/[0.06]
                                pt-3
                              "
                            >
                              <span
                                className="
                                  font-body
                                  text-[9px]
                                  text-white/30

                                  sm:text-[10px]
                                "
                              >
                                {
                                  optionQuantity
                                }{" "}
                                ×{" "}
                                {formatExtraMoney(
                                  option.price,
                                  locale,
                                )}
                              </span>

                              <strong
                                className="
                                  font-subtitle
                                  text-[11px]
                                  text-secondary

                                  sm:text-xs
                                "
                              >
                                +
                                {formatExtraMoney(
                                  option.price *
                                    optionQuantity,
                                  locale,
                                )}
                              </strong>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                TABLES
            ================================================= */}

            {event.tables.length >
              0 && (
              <div
                className="
                  mt-5

                  sm:mt-7
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      grid
                      h-9
                      w-9
                      shrink-0
                      place-items-center
                      rounded-[11px]
                      border
                      border-[#ff4f9a]/15
                      bg-[#ff4f9a]/[0.07]
                      text-[#ff6aa8]

                      sm:h-10
                      sm:w-10
                      sm:rounded-[12px]
                    "
                  >
                    <Armchair
                      size={
                        18
                      }
                    />
                  </span>

                  <div>
                    <strong
                      className="
                        font-subtitle
                        text-[13px]
                        text-white/90

                        sm:text-sm
                      "
                    >
                      Tables
                    </strong>

                    <p
                      className="
                        mt-0.5
                        font-body
                        text-[9px]
                        leading-4
                        text-white/30

                        sm:text-[10px]
                      "
                    >
                      Réserve ta table en payant uniquement l’acompte maintenant.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-3
                    space-y-2.5

                    sm:space-y-3
                  "
                >
                  {event.tables.map(
                    (
                      table,
                    ) => {
                      const selected =
                        selectedTableId ===
                        table.id;

                      const remainingPrice =
                        Math.max(
                          0,

                          table.fullPrice -
                            table.depositPrice,
                        );

                      return (
                        <button
                          key={
                            table.id
                          }
                          type="button"
                          onClick={() => {
                            setSelectedTableId(
                              selected
                                ? null
                                : table.id,
                            );

                            setCartError(
                              "",
                            );
                          }}
                          className={`
                            group
                            w-full
                            overflow-hidden
                            rounded-[18px]
                            border
                            text-left
                            transition-all
                            duration-200

                            sm:rounded-[20px]

                            ${
                              selected
                                ? "border-[#ff4f9a]/35 bg-[#ff4f9a]/[0.055]"
                                : "border-white/[0.07] bg-[#151515] hover:border-white/[0.13]"
                            }
                          `}
                        >
                          {/* HEADER */}

                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-3

                              p-3

                              sm:gap-4
                              sm:p-4
                            "
                          >
                            <div
                              className="
                                min-w-0
                                flex-1
                              "
                            >
                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-2
                                "
                              >
                                <strong
                                  className="
                                    font-subtitle
                                    text-[14px]
                                    leading-5
                                    text-white/90

                                    sm:text-[15px]
                                  "
                                >
                                  {
                                    table.name
                                  }
                                </strong>

                                {selected && (
                                  <span
                                    className="
                                      inline-flex
                                      items-center
                                      gap-1
                                      rounded-full
                                      bg-[#ff4f9a]/15
                                      px-2
                                      py-1
                                      font-subtitle
                                      text-[7px]
                                      uppercase
                                      tracking-[0.08em]
                                      text-[#ff7eaf]

                                      sm:text-[8px]
                                    "
                                  >
                                    <Check
                                      size={
                                        10
                                      }
                                    />

                                    Sélectionnée
                                  </span>
                                )}
                              </div>

                              {table.description && (
                                <p
                                  className="
                                    mt-1.5
                                    whitespace-pre-wrap
                                    break-words
                                    font-body
                                    text-[10px]
                                    leading-[18px]
                                    text-white/35

                                    sm:mt-2
                                    sm:text-[11px]
                                    sm:leading-5
                                  "
                                >
                                  {
                                    table.description
                                  }
                                </p>
                              )}
                            </div>

                            <span
                              className={`
                                grid
                                h-7
                                w-7
                                shrink-0
                                place-items-center
                                rounded-full
                                border
                                transition

                                ${
                                  selected
                                    ? "border-[#ff4f9a] bg-[#ff4f9a] text-black"
                                    : "border-white/15 text-transparent group-hover:border-white/25"
                                }
                              `}
                            >
                              <Check
                                size={
                                  14
                                }
                              />
                            </span>
                          </div>

                          {/* PRICES */}

                          <div
                            className="
                              grid
                              border-t
                              border-white/[0.06]

                              sm:grid-cols-3
                              sm:divide-x
                              sm:divide-white/[0.06]
                            "
                          >
                            <div
                              className="
                                border-b
                                border-white/[0.06]
                                bg-[#ff4f9a]/[0.025]

                                px-3
                                py-3

                                sm:border-b-0
                                sm:px-4
                                sm:py-4
                              "
                            >
                              <span
                                className="
                                  block
                                  font-subtitle
                                  text-[7px]
                                  uppercase
                                  tracking-[0.1em]
                                  text-[#ff7eaf]/75

                                  sm:text-[8px]
                                "
                              >
                                À payer maintenant
                              </span>

                              <strong
                                className="
                                  mt-1
                                  block
                                  font-title
                                  text-[21px]
                                  leading-none
                                  text-[#ff6aa8]

                                  sm:text-[23px]
                                "
                              >
                                {formatExtraMoney(
                                  table.depositPrice,
                                  locale,
                                )}
                              </strong>

                              <span
                                className="
                                  mt-1.5
                                  block
                                  font-body
                                  text-[8px]
                                  text-white/25

                                  sm:mt-2
                                  sm:text-[9px]
                                "
                              >
                                Acompte de{" "}
                                {
                                  table.depositPercentage
                                }
                                %
                              </span>
                            </div>

                            <div
                              className="
                                border-b
                                border-white/[0.06]

                                px-3
                                py-3

                                sm:border-b-0
                                sm:px-4
                                sm:py-4
                              "
                            >
                              <span
                                className="
                                  block
                                  font-subtitle
                                  text-[7px]
                                  uppercase
                                  tracking-[0.1em]
                                  text-white/25

                                  sm:text-[8px]
                                "
                              >
                                Prix total
                              </span>

                              <strong
                                className="
                                  mt-1
                                  block
                                  font-title
                                  text-[21px]
                                  leading-none
                                  text-white/85

                                  sm:text-[23px]
                                "
                              >
                                {formatExtraMoney(
                                  table.fullPrice,
                                  locale,
                                )}
                              </strong>

                              <span
                                className="
                                  mt-1.5
                                  block
                                  font-body
                                  text-[8px]
                                  text-white/20

                                  sm:mt-2
                                  sm:text-[9px]
                                "
                              >
                                Valeur totale de la table
                              </span>
                            </div>

                            <div
                              className="
                                px-3
                                py-3

                                sm:px-4
                                sm:py-4
                              "
                            >
                              <span
                                className="
                                  block
                                  font-subtitle
                                  text-[7px]
                                  uppercase
                                  tracking-[0.1em]
                                  text-white/25

                                  sm:text-[8px]
                                "
                              >
                                À payer sur place
                              </span>

                              <strong
                                className="
                                  mt-1
                                  block
                                  font-title
                                  text-[21px]
                                  leading-none
                                  text-white/65

                                  sm:text-[23px]
                                "
                              >
                                {formatExtraMoney(
                                  remainingPrice,
                                  locale,
                                )}
                              </strong>

                              <span
                                className="
                                  mt-1.5
                                  block
                                  font-body
                                  text-[8px]
                                  text-white/20

                                  sm:mt-2
                                  sm:text-[9px]
                                "
                              >
                                Après déduction de l’acompte
                              </span>
                            </div>
                          </div>

                          {selected && (
                            <div
                              className="
                                flex
                                items-center
                                justify-between
                                gap-3
                                border-t
                                border-[#ff4f9a]/10
                                bg-[#ff4f9a]/[0.035]

                                px-3
                                py-2.5

                                sm:px-4
                                sm:py-3
                              "
                            >
                              <span
                                className="
                                  font-body
                                  text-[9px]
                                  text-white/35

                                  sm:text-[10px]
                                "
                              >
                                Seul l’acompte est ajouté à ta commande
                              </span>

                              <strong
                                className="
                                  shrink-0
                                  font-subtitle
                                  text-[11px]
                                  text-[#ff7eaf]

                                  sm:text-xs
                                "
                              >
                                +
                                {formatExtraMoney(
                                  table.depositPrice,
                                  locale,
                                )}
                              </strong>
                            </div>
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                TOTAL
            ================================================= */}

            <div
              className="
                mt-5
                flex
                items-end
                justify-between
                border-t
                border-white/[0.08]

                pt-4

                sm:mt-7
                sm:pt-5
              "
            >
              <div>
                <span
                  className="
                    font-body
                    text-[11px]
                    text-white/30

                    sm:text-xs
                  "
                >
                  {t(
                    "event.selectedTotal",
                  )}
                </span>

                {totalTicketQuantity >
                  0 && (
                  <p
                    className="
                      mt-1
                      font-body
                      text-[9px]
                      text-white/20

                      sm:text-[10px]
                    "
                  >
                    {womenQuantity >
                      0 &&
                      `${womenQuantity} femme${
                        womenQuantity >
                        1
                          ? "s"
                          : ""
                      }`}

                    {womenQuantity >
                      0 &&
                    menQuantity >
                      0
                      ? " · "
                      : ""}

                    {menQuantity >
                      0 &&
                      `${menQuantity} homme${
                        menQuantity >
                        1
                          ? "s"
                          : ""
                      }`}
                  </p>
                )}
              </div>

              <strong
                className="
                  font-title
                  text-2xl

                  sm:text-3xl
                "
              >
                {formatMoney(
                  total,
                  locale,
                )}
              </strong>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {cartError && (
              <div
                className="
                  mt-3
                  rounded-[14px]
                  border
                  border-red-500/20
                  bg-red-500/[0.08]

                  p-3

                  font-body
                  text-[11px]
                  leading-5
                  text-red-200

                  sm:mt-4
                  sm:rounded-[16px]
                  sm:p-4
                  sm:text-xs
                "
              >
                {
                  cartError
                }
              </div>
            )}

            {/* =================================================
                ADD TO CART
            ================================================= */}

            <button
              type="button"
              disabled={
                cannotBuy
              }
              onClick={
                addToCart
              }
              className="
                group

                mt-4

                flex

                min-h-[52px]

                w-full
                items-center
                justify-center
                gap-2.5
                rounded-[15px]
                bg-secondary
                px-5
                font-subtitle

                text-[13px]

                text-black
                transition

                sm:mt-5
                sm:min-h-[56px]
                sm:rounded-[16px]
                sm:text-sm

                hover:brightness-105

                disabled:cursor-not-allowed
                disabled:bg-[#242424]
                disabled:text-[#777]
              "
            >
              {event.soldout
                ? t(
                    "common.soldOut",
                  )
                : totalTicketQuantity ===
                    0
                  ? "Sélectionne tes billets"
                  : t(
                      "common.addToCart",
                    )}

              {!cannotBuy && (
                <ShoppingBag
                  size={
                    18
                  }
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-0.5
                  "
                />
              )}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}