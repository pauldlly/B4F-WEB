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

function uniquePacks(
  items: PublicPack[],
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

export function PacksPage() {
  const {
    t,
  } = useI18n();

  const [
    filters,
    setFilters,
  ] =
    useState<CatalogFilters>({
      search: "",
      eventTypes: [],
      datePreset: "all",
      startDate: "",
      endDate: "",
    });

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

  const query =
    usePacksInfinite(
      queryFilters,
    );

  /*
   * PACKS
   * TRIÉS DU MOINS CHER
   * AU PLUS CHER
   */
  const packs =
    useMemo(
      () =>
        uniquePacks(
          query.data?.pages.flatMap(
            (page) =>
              page.items,
          ) ?? [],
        ).sort(
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

  const reset = () => {
    setFilters({
      search: "",
      eventTypes: [],
      datePreset: "all",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <>
      {/* REMOVE INNER INPUT FOCUS */}
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

      <Seo
        title="Choisis ton pack"
        description={t(
          "packsPage.description",
        )}
        path="/packs"
        image={
          firstPack?.imageUrl ||
          media.crowd
        }
      />

      {/* HERO */}
      <section
        className="
          relative
          min-h-[68svh]
          bg-black
          pt-20
        "
      >
        {/* BACKGROUND */}
        <div
          className="
            absolute
            inset-0
            overflow-hidden
          "
        >
          <img
            src={
              firstPack?.imageUrl ||
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

          {/* LEFT DARK GRADIENT */}
          <div
            className="
              absolute
              inset-0
              bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.72)_43%,rgba(0,0,0,.18)_100%)]
            "
          />

          {/* BOTTOM DARK GRADIENT */}
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
              -left-28
              top-24
              h-72
              w-72
              opacity-35
            "
          />

          {/* PINK ORB */}
          <div
            className="
              party-orb
              party-orb-pink
              absolute
              -right-24
              bottom-10
              h-72
              w-72
              opacity-35
            "
          />
        </div>

        {/* CONTENT */}
        <div
          className="
            page-shell
            relative
            z-20
            flex
            min-h-[68svh]
            items-end
            pb-10
            pt-28
            sm:pb-12
          "
        >
          <Reveal
            className="
              w-full
            "
          >
            {/* TITLE */}
            <h1
              className="
                max-w-5xl
                font-title
                text-[clamp(3.5rem,10vw,7.6rem)]
                uppercase
                leading-[0.8]
                tracking-[-0.06em]
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

            {/* FILTERS */}
            <div
              id="packs-filters"
              className="
                relative
                z-[100]
                mt-8
                w-full
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

      {/* PACKS */}
      <section
        className="
          relative
          z-0
          bg-[#0b0b0b]
          pb-20
          pt-10
          sm:pb-24
          sm:pt-14
        "
      >
        {/* BACKGROUND ORANGE */}
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

        {/* BACKGROUND PINK */}
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
          {/* LOADING */}
          {query.isPending && (
            <div
              className="
                grid
                gap-5
                md:grid-cols-3
              "
            >
              {Array.from({
                length: 6,
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

          {/* ERROR */}
          {query.error && (
            <div
              className="
                rounded-[26px]
                border
                border-white/[0.07]
                bg-[#111]
                p-10
                text-center
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

          {/* EMPTY */}
          {!query.isPending &&
            !query.error &&
            packs.length ===
              0 && (
              <div
                className="
                  grid
                  min-h-[380px]
                  place-items-center
                  rounded-[28px]
                  border
                  border-dashed
                  border-white/[0.12]
                  bg-[#101010]
                  p-10
                  text-center
                "
              >
                <div>
                  <span
                    className="
                      mx-auto
                      grid
                      h-16
                      w-16
                      place-items-center
                      rounded-[20px]
                      border
                      border-white/[0.08]
                      bg-white/[0.035]
                    "
                  >
                    <Package
                      size={30}
                      className="text-white/20"
                    />
                  </span>

                  <h3
                    className="
                      mt-5
                      font-title
                      text-2xl
                      uppercase
                    "
                  >
                    {t(
                      "home.emptyTitle",
                    )}
                  </h3>

                  <p
                    className="
                      mt-3
                      font-body
                      text-sm
                      text-white/40
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
                      mt-6
                    "
                  >
                    {t(
                      "common.reset",
                    )}
                  </button>
                </div>
              </div>
            )}

          {/* PACKS */}
          {!query.isPending &&
            !query.error &&
            packs.length >
              0 && (
              <div
                className="
                  grid
                  gap-5
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

          {/* LOAD MORE UNIQUEMENT S'IL RESTE DES PACKS */}
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