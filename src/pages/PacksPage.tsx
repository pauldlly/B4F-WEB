import {
  Package,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import { CatalogFiltersBar } from "../components/CatalogFilters";
import { LoadMoreTrigger } from "../components/LoadMoreTrigger";
import { PackCard } from "../components/PackCard";
import { Reveal } from "../components/Reveal";
import { Seo } from "../components/Seo";
import { CatalogCardSkeleton } from "../components/Skeletons";

import { media } from "../data/media";

import { usePacksInfinite } from "../hooks/useCatalogQueries";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

import { useI18n } from "../i18n/LanguageProvider";

import type {
  CatalogFilters,
  PublicPack,
} from "../types";

/* =========================================================
   UNIQUE PACKS
========================================================= */

function uniquePacks(
  items: PublicPack[],
) {
  return Array.from(
    new Map(
      items.map(
        (
          item,
        ) => [
          item.id,
          item,
        ],
      ),
    ).values(),
  );
}

/* =========================================================
   PAGE
========================================================= */

export function PacksPage() {
  const {
    t,
  } =
    useI18n();

  const [
    filters,
    setFilters,
  ] =
    useState<CatalogFilters>({
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
    usePacksInfinite(
      queryFilters,
    );

  /* =====================================================
     PACKS
  ===================================================== */

  const packs =
    useMemo(
      () =>
        uniquePacks(
          query.data
            ?.pages
            .flatMap(
              (
                page,
              ) =>
                page.items,
            ) ??
            [],
        )
          .filter(
            (
              pack,
            ) =>
              !(
                pack as PublicPack & {
                  isVisibleOnlyInApp?:
                    boolean;
                }
              ).isVisibleOnlyInApp,
          )
          .sort(
            (
              a,
              b,
            ) => {
              const priceA =
                Math.min(
                  a.womenPrice,
                  a.menPrice,
                );

              const priceB =
                Math.min(
                  b.womenPrice,
                  b.menPrice,
                );

              return (
                priceA -
                priceB
              );
            },
          ),
      [
        query.data,
      ],
    );

  const firstPack =
    packs[0] ??
    null;

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
     RENDER
  ===================================================== */

  return (
    <>
      {/* =================================================
          INPUT FOCUS
      ================================================= */}

      <style>{`
        #packs-filters input,
        #packs-filters input:focus,
        #packs-filters input:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
        }

        #packs-filters input:focus-visible {
          outline-offset: 0 !important;
        }
      `}</style>

      {/* =================================================
          SEO
      ================================================= */}

      <Seo
        title="Choisis ton pack"
        description={t(
          "packsPage.description",
        )}
        path="/packs"
        image={
          firstPack
            ?.imageUrl ||
          media.crowd
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
              firstPack
                ?.imageUrl ||
              media.crowd
            }
            alt="B4F packs"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
            "
            fetchPriority="high"
          />

          {/* LEFT DARK */}

          <div
            className="
              absolute
              inset-0
              bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.72)_43%,rgba(0,0,0,.18)_100%)]
            "
          />

          {/* BOTTOM DARK */}

          <div
            className="
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(0,0,0,.12)_0%,transparent_40%,#0b0b0b_100%)]
            "
          />

          {/* ORANGE ORB */}

          <div
            className="
              party-orb
              party-orb-orange
              absolute

              -left-24
              top-16

              h-56
              w-56

              opacity-35

              sm:-left-28
              sm:top-20
              sm:h-64
              sm:w-64

              lg:top-24
              lg:h-72
              lg:w-72
            "
          />

          {/* PINK ORB */}

          <div
            className="
              party-orb
              party-orb-pink
              absolute

              -right-20
              bottom-8

              h-56
              w-56

              opacity-35

              sm:-right-24
              sm:bottom-10
              sm:h-64
              sm:w-64

              lg:h-72
              lg:w-72
            "
          />
        </div>

        {/* =================================================
            CONTENT
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
                ton pack.
              </span>
            </h1>

            {/* =============================================
                FILTERS
            ============================================== */}

            <div
              id="packs-filters"
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
          PACKS
      ================================================= */}

      <section
        className="
          relative
          z-0
          bg-[#0b0b0b]

          pb-16
          pt-4

          sm:pb-20
          sm:pt-8

          lg:pb-24
          lg:pt-14
        "
      >
        {/* =================================================
            BACKGROUND ORANGE
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

        {/* =================================================
            BACKGROUND PINK
        ================================================= */}

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
                grid

                gap-4

                sm:gap-5

                md:grid-cols-3
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
                rounded-[22px]
                border
                border-white/[0.07]
                bg-[#111]

                p-7

                text-center

                sm:rounded-[26px]
                sm:p-9

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
                  mt-2
                  font-body
                  text-[13px]
                  text-white/40

                  sm:mt-3
                  sm:text-sm
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
                  mt-5

                  sm:mt-6
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
            packs.length ===
              0 && (
              <div
                className="
                  grid

                  min-h-[300px]

                  place-items-center
                  rounded-[22px]
                  border
                  border-dashed
                  border-white/[0.12]
                  bg-[#101010]

                  p-6

                  text-center

                  sm:min-h-[340px]
                  sm:rounded-[26px]
                  sm:p-8

                  lg:min-h-[380px]
                  lg:rounded-[28px]
                  lg:p-10
                "
              >
                <div>
                  <span
                    className="
                      mx-auto
                      grid

                      h-14
                      w-14

                      place-items-center

                      rounded-[17px]

                      border
                      border-white/[0.08]
                      bg-white/[0.035]

                      sm:h-16
                      sm:w-16
                      sm:rounded-[20px]
                    "
                  >
                    <Package
                      size={27}
                      className="
                        text-white/20

                        sm:h-[30px]
                        sm:w-[30px]
                      "
                    />
                  </span>

                  <h3
                    className="
                      mt-4
                      font-title

                      text-xl

                      uppercase

                      sm:mt-5
                      sm:text-2xl
                    "
                  >
                    {t(
                      "home.emptyTitle",
                    )}
                  </h3>

                  <p
                    className="
                      mt-2
                      font-body

                      text-[13px]

                      text-white/40

                      sm:mt-3
                      sm:text-sm
                    "
                  >
                    {t(
                      "home.emptyDescription",
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={
                      reset
                    }
                    className="
                      secondary-button

                      mt-5

                      sm:mt-6
                    "
                  >
                    {t(
                      "common.reset",
                    )}
                  </button>
                </div>
              </div>
            )}

          {/* =================================================
              PACKS GRID
          ================================================= */}

          {!query.isPending &&
            !query.error &&
            packs.length >
              0 && (
              <div
                className="
                  grid

                  gap-4

                  sm:gap-5

                  md:grid-cols-3
                "
              >
                {packs.map(
                  (
                    pack,
                    index,
                  ) => (
                    <PackCard
                      key={
                        pack.id
                      }
                      pack={
                        pack
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
            )}

          {/* =================================================
              LOAD MORE
          ================================================= */}

          {!query.isPending &&
            !query.error &&
            Boolean(
              query.hasNextPage,
            ) && (
              <LoadMoreTrigger
                hasMore
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