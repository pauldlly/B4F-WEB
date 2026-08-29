import {
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import { CatalogFiltersBar } from "../components/CatalogFilters";
import { EventCard } from "../components/EventCard";
import { LoadMoreTrigger } from "../components/LoadMoreTrigger";
import { Reveal } from "../components/Reveal";
import { Seo } from "../components/Seo";
import { CatalogCardSkeleton } from "../components/Skeletons";

import { media } from "../data/media";

import { useEventsInfinite } from "../hooks/useCatalogQueries";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

import { useI18n } from "../i18n/LanguageProvider";

import {
  eventTimestamp,
} from "../lib/format";

import type {
  CatalogFilters,
  PublicEvent,
} from "../types";

/* =========================================================
   UNIQUE EVENTS
========================================================= */

function uniqueEvents(
  items: PublicEvent[],
) {
  return Array.from(
    new Map(
      items.map(
        (item) => [
          item.id,
          item,
        ],
      ),
    ).values(),
  );
}

/* =========================================================
   CAPITALIZE
========================================================= */

function capitalize(
  value: string,
) {
  if (!value) {
    return value;
  }

  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(1)
  );
}

/* =========================================================
   DATE PARTS
========================================================= */

function getDateParts(
  value: string,
  locale: string,
) {
  if (
    !value ||
    value ===
      "unknown"
  ) {
    return {
      weekday:
        "À venir",

      day:
        "—",

      month:
        "",
    };
  }

  const date =
    new Date(
      `${value}T12:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return {
      weekday:
        "À venir",

      day:
        "—",

      month:
        "",
    };
  }

  return {
    weekday:
      capitalize(
        new Intl.DateTimeFormat(
          locale,
          {
            weekday:
              "long",
          },
        ).format(
          date,
        ),
      ),

    day:
      new Intl.DateTimeFormat(
        locale,
        {
          day:
            "2-digit",
        },
      ).format(
        date,
      ),

    month:
      capitalize(
        new Intl.DateTimeFormat(
          locale,
          {
            month:
              "long",
          },
        ).format(
          date,
        ),
      ),
  };
}

/* =========================================================
   EVENTS PAGE
========================================================= */

export function EventsPage() {
  const {
    t,
    locale,
  } =
    useI18n();

  const [
    searchParams,
  ] =
    useSearchParams();

  /* =====================================================
     INITIAL FILTERS
  ===================================================== */

  const initialTypes =
    searchParams
      .get(
        "types",
      )
      ?.split(
        ",",
      )
      .filter(
        Boolean,
      ) ??
    [];

  const [
    filters,
    setFilters,
  ] =
    useState<CatalogFilters>({
      search:
        searchParams.get(
          "search",
        ) ??
        "",

      eventTypes:
        initialTypes,

      datePreset:
        "all",

      startDate:
        "",

      endDate:
        "",
    });

  /* =====================================================
     SEARCH
  ===================================================== */

  const debouncedSearch =
    useDebouncedValue(
      filters.search,
      300,
    );

  const queryFilters =
    useMemo(
      () => ({
        ...filters,

        search:
          debouncedSearch,
      }),
      [
        debouncedSearch,
        filters,
      ],
    );

  /* =====================================================
     QUERY
  ===================================================== */

  const query =
    useEventsInfinite(
      queryFilters,
    );

  /* =====================================================
     EVENTS
  ===================================================== */

  const events =
    useMemo(
      () =>
        uniqueEvents(
          query.data
            ?.pages
            .flatMap(
              (
                page,
              ) =>
                page.items,
            ) ??
            [],
        ).sort(
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
        ),
      [
        query.data,
      ],
    );

  const nextEvent =
    events[0] ??
    null;

  /* =====================================================
     GROUP BY DATE
  ===================================================== */

  const grouped =
    useMemo(
      () => {
        const groups =
          new Map<
            string,
            PublicEvent[]
          >();

        events.forEach(
          (
            event,
          ) => {
            const key =
              event.eventDate ||
              "unknown";

            groups.set(
              key,
              [
                ...(
                  groups.get(
                    key,
                  ) ??
                  []
                ),

                event,
              ],
            );
          },
        );

        return Array.from(
          groups.entries(),
        );
      },
      [
        events,
      ],
    );

  /* =====================================================
     RESET
  ===================================================== */

  const reset =
    () => {
      setFilters({
        search:
          "",

        eventTypes:
          [],

        datePreset:
          "all",

        startDate:
          "",

        endDate:
          "",
      });
    };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <>
      {/* =================================================
          INPUT FOCUS
      ================================================= */}

      <style>{`
        #events-filters input,
        #events-filters input:focus,
        #events-filters input:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
        }

        #events-filters input:focus-visible {
          outline-offset: 0 !important;
        }
      `}</style>

      {/* =================================================
          SEO
      ================================================= */}

      <Seo
        title="Choisis ta nuit"
        description="Découvrez les prochaines soirées B4F à Barcelone."
        path="/events"
        image={
          nextEvent
            ?.imageUrl ||
          media.club
        }
      />

      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="
          relative
          min-h-[52svh]
          bg-black

          sm:min-h-[60svh]

          lg:min-h-[68svh]
        "
      >
        {/* =================================================
            BACKGROUND
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            overflow-hidden
          "
        >
          <img
            src={
              nextEvent
                ?.imageUrl ||
              media.club
            }
            alt="B4F events"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
            "
            fetchPriority="high"
          />

          {/* DARK LEFT */}

          <div
            className="
              absolute
              inset-0
              bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.72)_43%,rgba(0,0,0,.18)_100%)]
            "
          />

          {/* DARK BOTTOM */}

          <div
            className="
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(0,0,0,.12)_0%,transparent_40%,#0b0b0b_100%)]
            "
          />

          {/* ORANGE */}

          <div
            className="
              party-orb
              party-orb-orange
              absolute
              -left-28
              top-20
              h-60
              w-60
              opacity-35

              sm:top-24
              sm:h-72
              sm:w-72
            "
          />

          {/* PINK */}

          <div
            className="
              party-orb
              party-orb-pink
              absolute
              -right-24
              bottom-10
              h-60
              w-60
              opacity-35

              sm:h-72
              sm:w-72
            "
          />
        </div>

        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div
          className="
            page-shell
            relative
            z-20
            flex

            min-h-[52svh]

            items-end

            pb-5
            pt-16

            sm:min-h-[60svh]
            sm:pb-8
            sm:pt-20

            lg:min-h-[68svh]
            lg:pb-10
            lg:pt-28
          "
        >
          <Reveal
            className="
              w-full
            "
          >
            {/* =============================================
                TITLE
            ============================================== */}

            <h1
              className="
                max-w-5xl
                font-title

                text-[clamp(3.25rem,15vw,5rem)]

                uppercase
                leading-[0.8]

                sm:text-[clamp(4rem,11vw,6rem)]

                lg:text-[clamp(3.5rem,10vw,7.6rem)]
              "
            >
              Choisis

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-[#ff963f]
                  via-[#ff724d]
                  to-[#ff4f9a]
                  bg-clip-text
                  text-transparent
                "
              >
                ta nuit.
              </span>
            </h1>

            {/* =============================================
                FILTERS
            ============================================== */}

            <div
              id="events-filters"
              className="
                relative
                z-[100]
                mt-5
                w-full

                sm:mt-6

                lg:mt-8
              "
            >
              <CatalogFiltersBar
                filters={
                  filters
                }
                onChange={
                  setFilters
                }
                onReset={
                  reset
                }
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* =================================================
          EVENTS
      ================================================= */}

      <section
        className="
          relative
          z-0
          bg-[#0b0b0b]

          pb-16
          sm:pb-20

          lg:pb-24
        "
      >
        {/* =================================================
            BACKGROUND
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -left-48
            top-0
            h-[380px]
            w-[380px]
            rounded-full
            bg-orange-500/[0.03]
            blur-[110px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-48
            top-0
            h-[380px]
            w-[380px]
            rounded-full
            bg-pink-500/[0.03]
            blur-[110px]
          "
        />

        <div
          className="
            page-shell
            relative
          "
        >
          {/* =================================================
              LOADING
          ================================================= */}

          {query.isPending && (
            <div
              className="
                mt-6
                grid
                gap-4

                sm:mt-8
                sm:gap-5

                md:grid-cols-3

                lg:mt-10
              "
            >
              {Array.from({
                length:
                  6,
              }).map(
                (
                  _,
                  index,
                ) => (
                  <CatalogCardSkeleton
                    key={
                      index
                    }
                  />
                ),
              )}
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {query.error && (
            <div
              className="
                mt-6
                rounded-[22px]
                border
                border-white/[0.07]
                bg-[#111]
                p-7
                text-center

                sm:mt-8
                sm:rounded-[26px]
                sm:p-9

                lg:mt-10
                lg:p-10
              "
            >
              <h3
                className="
                  font-title
                  text-2xl
                  uppercase
                "
              >
                Chargement impossible
              </h3>

              <p
                className="
                  mt-3
                  font-body
                  text-sm
                  text-white/40
                "
              >
                {query.error instanceof
                Error
                  ? query.error.message
                  : "Une erreur est survenue."}
              </p>

              <button
                type="button"
                onClick={() =>
                  void query.refetch()
                }
                className="
                  secondary-button
                  mt-6
                "
              >
                {t(
                  "common.retry",
                )}
              </button>
            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!query.isPending &&
            !query.error &&
            events.length ===
              0 && (
              <div
                className="
                  mt-6
                  flex
                  justify-center

                  sm:mt-8
                "
              >
                <button
                  type="button"
                  onClick={
                    reset
                  }
                  className="secondary-button"
                >
                  {t(
                    "common.reset",
                  )}
                </button>
              </div>
            )}

          {/* =================================================
              EVENTS GROUPS
          ================================================= */}

          {!query.isPending &&
            !query.error &&
            grouped.map(
              (
                [
                  date,
                  items,
                ],
                groupIndex,
              ) => {
                const dateParts =
                  getDateParts(
                    date,
                    locale,
                  );

                return (
                  <section
                    key={
                      date
                    }
                    className="
                      relative
                      z-0

                      mt-7

                      sm:mt-10

                      lg:mt-14
                    "
                  >
                    {/* =====================================
                        DAY
                    ====================================== */}

                    <Reveal
                      delay={Math.min(
                        groupIndex *
                          40,
                        160,
                      )}
                    >
                      <div
                        className="
                          mb-5
                          flex
                          items-center
                          gap-3

                          sm:mb-7
                          sm:gap-4

                          lg:mb-8
                        "
                      >
                        <div
                          className="
                            flex
                            shrink-0
                            items-center
                            gap-2.5

                            sm:gap-3
                          "
                        >
                          {/* NUMBER */}

                          <span
                            className="
                              bg-gradient-to-br
                              from-[#ff963f]
                              via-[#ff724d]
                              to-[#ff4f9a]
                              bg-clip-text
                              font-title

                              text-[42px]

                              leading-[0.8]
                              text-transparent

                              sm:text-[48px]

                              lg:text-[58px]
                            "
                          >
                            {
                              dateParts.day
                            }
                          </span>

                          {/* DAY + MONTH */}

                          <div>
                            <strong
                              className="
                                block
                                font-subtitle

                                text-[10px]

                                uppercase
                                tracking-[0.1em]
                                text-white/80

                                sm:text-[11px]

                                lg:text-[13px]
                              "
                            >
                              {
                                dateParts.weekday
                              }
                            </strong>

                            <span
                              className="
                                mt-1
                                block
                                font-body

                                text-[8px]

                                uppercase
                                tracking-[0.13em]
                                text-white/28

                                sm:text-[9px]
                              "
                            >
                              {
                                dateParts.month
                              }
                            </span>
                          </div>
                        </div>

                        {/* LINE */}

                        <span
                          className="
                            h-px
                            min-w-4
                            flex-1
                            bg-gradient-to-r
                            from-white/[0.13]
                            to-transparent

                            sm:min-w-6
                          "
                        />

                        {/* COUNT */}

                        <span
                          className="
                            shrink-0
                            rounded-full
                            border
                            border-white/[0.07]
                            bg-[#121212]

                            px-2.5
                            py-1.5

                            font-subtitle

                            text-[7px]

                            uppercase
                            tracking-[0.1em]
                            text-white/30

                            sm:px-3
                            sm:py-2
                            sm:text-[8px]
                          "
                        >
                          {
                            items.length
                          }{" "}
                          soirée
                          {items.length >
                          1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    </Reveal>

                    {/* =====================================
                        CARDS
                    ====================================== */}

                    <div
                      className="
                        grid
                        gap-4

                        sm:gap-5

                        md:grid-cols-3
                      "
                    >
                      {items.map(
                        (
                          event,
                          index,
                        ) => (
                          <EventCard
                            key={
                              event.id
                            }
                            event={
                              event
                            }
                            revealDelay={Math.min(
                              index *
                                60,
                              240,
                            )}
                          />
                        ),
                      )}
                    </div>
                  </section>
                );
              },
            )}

          {/* =================================================
              LOAD MORE
          ================================================= */}

          {!query.isPending &&
            !query.error && (
              <LoadMoreTrigger
                hasMore={Boolean(
                  query.hasNextPage,
                )}
                loading={
                  query.isFetchingNextPage
                }
                onLoadMore={() =>
                  void query.fetchNextPage()
                }
              />
            )}
        </div>
      </section>
    </>
  );
}