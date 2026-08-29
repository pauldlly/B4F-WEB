import {
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useI18n } from "../i18n/LanguageProvider";

import type {
  CatalogFilters,
  DatePreset,
} from "../types";

/* =========================================================
   DATA
========================================================= */

const EVENT_TYPES = [
  {
    key: "pool_party",
    emoji: "🏖️",
  },
  {
    key: "boat_party",
    emoji: "🛥️",
  },
  {
    key: "nightclubs",
    emoji: "🌙",
  },
  {
    key: "open_bar",
    emoji: "🍹",
  },
] as const;

type OpenPanel =
  | "date"
  | "type"
  | "mobile"
  | null;

type FilterLayerMode =
  | "popover"
  | "sheet";

/* =========================================================
   FILTER LAYER
========================================================= */

function FilterLayer({
  open,
  title,
  mode,
  onClose,
  anchorRef,
  children,
}: {
  open: boolean;
  title: string;
  mode: FilterLayerMode;
  onClose: () => void;

  anchorRef?: {
    current:
      | HTMLElement
      | null;
  };

  children: ReactNode;
}) {
  const [
    position,
    setPosition,
  ] =
    useState<CSSProperties>(
      {},
    );

  /*
   * Sur mobile uniquement :
   * on bloque le scroll derrière le sheet.
   */
  useBodyScrollLock(
    open &&
      mode ===
        "sheet",
  );

  /* =====================================================
     ESCAPE
  ===================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    onClose,
  ]);

  /* =====================================================
     POSITION DESKTOP
     Toujours juste sous la barre complète.
  ===================================================== */

  useLayoutEffect(() => {
    if (
      !open ||
      mode !==
        "popover"
    ) {
      return;
    }

    const updatePosition =
      () => {
        const anchor =
          anchorRef?.current;

        if (!anchor) {
          return;
        }

        const rect =
          anchor.getBoundingClientRect();

        const margin =
          12;

        const gap =
          8;

        /*
         * Taille du menu.
         * Maximum 460px mais jamais
         * plus large que la barre.
         */
        const width =
          Math.min(
            460,
            rect.width,
            window.innerWidth -
              margin * 2,
          );

        /*
         * Aligné sur le bord droit
         * de la barre.
         */
        let left =
          rect.right -
          width;

        left =
          Math.max(
            margin,
            Math.min(
              left,
              window.innerWidth -
                width -
                margin,
            ),
          );

        /*
         * Toujours juste sous la barre.
         */
        const top =
          rect.bottom +
          gap;

        /*
         * Si écran bas :
         * le contenu scroll dans le menu.
         */
        const maxHeight =
          Math.max(
            220,
            window.innerHeight -
              top -
              margin,
          );

        setPosition({
          top,
          left,
          width,
          maxHeight,
        });
      };

    updatePosition();

    window.addEventListener(
      "resize",
      updatePosition,
    );

    window.addEventListener(
      "scroll",
      updatePosition,
      true,
    );

    window.visualViewport?.addEventListener(
      "resize",
      updatePosition,
    );

    window.visualViewport?.addEventListener(
      "scroll",
      updatePosition,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePosition,
      );

      window.removeEventListener(
        "scroll",
        updatePosition,
        true,
      );

      window.visualViewport?.removeEventListener(
        "resize",
        updatePosition,
      );

      window.visualViewport?.removeEventListener(
        "scroll",
        updatePosition,
      );
    };
  }, [
    anchorRef,
    mode,
    open,
  ]);

  if (
    !open ||
    typeof document ===
      "undefined"
  ) {
    return null;
  }

  /* =====================================================
     PORTAL
  ===================================================== */

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[10000]
      "
      onPointerDown={
        onClose
      }
    >
      {/* =================================================
          BACKDROP
      ================================================= */}

      <div
        className={`
          pointer-events-none
          absolute
          inset-0

          ${
            mode ===
            "sheet"
              ? "bg-black/70 backdrop-blur-sm"
              : "bg-black/[0.10]"
          }
        `}
      />

      {/* =================================================
          PANEL
      ================================================= */}

      <section
        role="dialog"
        aria-modal="true"
        aria-label={
          title
        }
        onPointerDown={(
          event,
        ) => {
          event.stopPropagation();
        }}
        style={
          mode ===
          "popover"
            ? position
            : undefined
        }
        className={
          mode ===
          "sheet"
            ? `
              custom-scrollbar
              absolute
              inset-x-2
              bottom-2
              max-h-[calc(100dvh-16px)]
              overflow-y-auto
              overscroll-contain
              rounded-[26px]
              border
              border-white/[0.10]
              bg-[#151515]
              shadow-[0_-25px_90px_rgba(0,0,0,.65)]

              sm:inset-x-3
              sm:bottom-3
              sm:rounded-[30px]
            `
            : `
              custom-scrollbar
              fixed
              overflow-y-auto
              overscroll-contain
              rounded-[22px]
              border
              border-white/[0.10]
              bg-[#171717]
              shadow-[0_28px_90px_rgba(0,0,0,.70)]
              backdrop-blur-2xl
            `
        }
      >
        {/* =================================================
            HEADER PANEL
        ================================================= */}

        <div
          className={`
            sticky
            top-0
            z-20
            flex
            items-center
            justify-between
            gap-4
            border-b
            border-white/[0.08]
            bg-[#171717]/95
            backdrop-blur-xl

            ${
              mode ===
              "sheet"
                ? "px-5 pb-4 pt-5"
                : "px-5 py-4"
            }
          `}
        >
          <div>
            <span
              className="
                block
                font-subtitle
                text-[9px]
                uppercase
                tracking-[0.17em]
                text-secondary
              "
            >
              B4F
            </span>

            <h3
              className="
                mt-1
                font-title
                text-xl
                uppercase
                leading-none
                text-white
              "
            >
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-full
              border
              border-white/[0.09]
              bg-white/[0.045]
              text-white/50
              transition

              hover:border-white/20
              hover:bg-white/[0.08]
              hover:text-white

              focus:outline-none
              focus:ring-0
            "
            aria-label="Fermer"
          >
            <X
              size={
                18
              }
            />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className={
            mode ===
            "sheet"
              ? `
                px-4
                pb-[max(16px,env(safe-area-inset-bottom))]
                pt-4
                sm:px-5
              `
              : `
                p-5
              `
          }
        >
          {
            children
          }
        </div>
      </section>
    </div>,
    document.body,
  );
}

/* =========================================================
   CATALOG FILTERS BAR
========================================================= */

export function CatalogFiltersBar({
  filters,
  onChange,
  onReset,
}: {
  filters: CatalogFilters;

  onChange: (
    next: CatalogFilters,
  ) => void;

  onReset:
    () => void;
}) {
  const {
    t,
    locale,
  } =
    useI18n();

  const [
    openPanel,
    setOpenPanel,
  ] =
    useState<OpenPanel>(
      null,
    );

  /*
   * IMPORTANT :
   * le popover desktop est positionné
   * par rapport à toute la barre.
   */
  const filtersBarRef =
    useRef<HTMLElement | null>(
      null,
    );

  /* =====================================================
     ACTIVE FILTERS
  ===================================================== */

  const activeCount =
    useMemo(() => {
      let count =
        0;

      if (
        filters.search.trim()
      ) {
        count += 1;
      }

      if (
        filters.eventTypes
          .length > 0
      ) {
        count += 1;
      }

      if (
        filters.datePreset !==
        "all"
      ) {
        count += 1;
      }

      return count;
    }, [
      filters,
    ]);

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (
    value:
      string,
  ) => {
    if (!value) {
      return "";
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
      return value;
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        day:
          "2-digit",

        month:
          "short",
      },
    ).format(
      date,
    );
  };

  /* =====================================================
     DATE LABEL
  ===================================================== */

  const dateLabel =
    useMemo(() => {
      if (
        filters.datePreset ===
        "today"
      ) {
        return t(
          "filters.today",
        );
      }

      if (
        filters.datePreset ===
        "tomorrow"
      ) {
        return t(
          "filters.tomorrow",
        );
      }

      if (
        filters.datePreset ===
        "weekend"
      ) {
        return t(
          "filters.weekend",
        );
      }

      if (
        filters.datePreset ===
        "range"
      ) {
        if (
          filters.startDate &&
          filters.endDate
        ) {
          return `${formatDate(
            filters.startDate,
          )} → ${formatDate(
            filters.endDate,
          )}`;
        }

        return t(
          "filters.range",
        );
      }

      return t(
        "filters.allDates",
      );
    }, [
      filters.datePreset,
      filters.endDate,
      filters.startDate,
      locale,
      t,
    ]);

  /* =====================================================
     TYPE LABEL
  ===================================================== */

  const typeLabel =
    filters.eventTypes
      .length === 0
      ? t(
          "filters.allTypes",
        )
      : t(
          "filters.selected",
          {
            count:
              filters
                .eventTypes
                .length,
          },
        );

  /* =====================================================
     VALID RANGE
  ===================================================== */

  const rangeValid =
    filters.datePreset !==
      "range" ||
    (
      Boolean(
        filters.startDate,
      ) &&
      Boolean(
        filters.endDate,
      ) &&
      filters.endDate >=
        filters.startDate
    );

  /* =====================================================
     DATE PRESET
  ===================================================== */

  const chooseDatePreset = (
    preset:
      DatePreset,

    closeAfterSelection =
      true,
  ) => {
    onChange({
      ...filters,

      datePreset:
        preset,

      startDate:
        preset ===
        "range"
          ? filters.startDate
          : "",

      endDate:
        preset ===
        "range"
          ? filters.endDate
          : "",
    });

    if (
      closeAfterSelection &&
      preset !==
        "range"
    ) {
      setOpenPanel(
        null,
      );
    }
  };

  /* =====================================================
     TYPE
  ===================================================== */

  const toggleType = (
    type:
      string,
  ) => {
    const exists =
      filters.eventTypes.includes(
        type,
      );

    onChange({
      ...filters,

      eventTypes:
        exists
          ? filters.eventTypes.filter(
              (
                item,
              ) =>
                item !==
                type,
            )
          : [
              ...filters.eventTypes,
              type,
            ],
    });
  };

  /* =====================================================
     RESET ALL
  ===================================================== */

  const resetAll =
    () => {
      onReset();

      setOpenPanel(
        null,
      );
    };

  /* =====================================================
     DATE OPTIONS
  ===================================================== */

  const renderDateOptions = (
    mobile:
      boolean,
  ) => (
    <>
      <div
        className={
          mobile
            ? "grid grid-cols-2 gap-2"
            : "grid gap-2"
        }
      >
        {(
          [
            [
              "all",
              t(
                "filters.allDates",
              ),
            ],

            [
              "today",
              t(
                "filters.today",
              ),
            ],

            [
              "tomorrow",
              t(
                "filters.tomorrow",
              ),
            ],

            [
              "weekend",
              t(
                "filters.weekend",
              ),
            ],

            [
              "range",
              t(
                "filters.range",
              ),
            ],
          ] as Array<
            [
              DatePreset,
              string,
            ]
          >
        ).map(
          ([
            value,
            label,
          ]) => {
            const active =
              filters.datePreset ===
              value;

            return (
              <button
                key={
                  value
                }
                type="button"
                onClick={() =>
                  chooseDatePreset(
                    value,
                    !mobile,
                  )
                }
                className={`
                  flex
                  min-h-[52px]
                  min-w-0
                  items-center
                  gap-3
                  rounded-[16px]
                  border
                  px-3
                  text-left
                  transition

                  ${
                    mobile &&
                    value ===
                      "range"
                      ? "col-span-2"
                      : ""
                  }

                  ${
                    active
                      ? "border-secondary/40 bg-secondary/[0.11] text-white"
                      : "border-white/[0.07] bg-black/20 text-white/50 hover:border-white/[0.15] hover:bg-white/[0.035] hover:text-white"
                  }
                `}
              >
                <span
                  className={`
                    grid
                    h-8
                    w-8
                    shrink-0
                    place-items-center
                    rounded-full

                    ${
                      active
                        ? "bg-secondary text-black"
                        : "bg-white/[0.055] text-white/30"
                    }
                  `}
                >
                  {active ? (
                    <Check
                      size={
                        15
                      }
                    />
                  ) : (
                    <CalendarDays
                      size={
                        15
                      }
                    />
                  )}
                </span>

                <span
                  className="
                    min-w-0
                    truncate
                    font-subtitle
                    text-[12px]
                  "
                >
                  {
                    label
                  }
                </span>
              </button>
            );
          },
        )}
      </div>

      {/* =================================================
          CUSTOM RANGE
      ================================================= */}

      {filters.datePreset ===
        "range" && (
        <div
          className="
            mt-4
            rounded-[18px]
            border
            border-white/[0.08]
            bg-black/25
            p-3.5
          "
        >
          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
            "
          >
            {/* START */}

            <label className="min-w-0">
              <span
                className="
                  mb-2
                  block
                  font-subtitle
                  text-[10px]
                  text-white/45
                "
              >
                {t(
                  "filters.startDate",
                )}
              </span>

              <input
                type="date"
                value={
                  filters.startDate
                }
                onChange={(
                  event,
                ) =>
                  onChange({
                    ...filters,

                    startDate:
                      event
                        .target
                        .value,
                  })
                }
                className="
                  form-input
                  !min-h-[50px]
                  !w-full
                  !rounded-[14px]
                  !bg-white/[0.04]
                  !px-3
                  !text-[12px]

                  focus:!outline-none
                  focus-visible:!outline-none
                  focus:!ring-0
                "
              />
            </label>

            {/* END */}

            <label className="min-w-0">
              <span
                className="
                  mb-2
                  block
                  font-subtitle
                  text-[10px]
                  text-white/45
                "
              >
                {t(
                  "filters.endDate",
                )}
              </span>

              <input
                type="date"
                min={
                  filters.startDate ||
                  undefined
                }
                value={
                  filters.endDate
                }
                onChange={(
                  event,
                ) =>
                  onChange({
                    ...filters,

                    endDate:
                      event
                        .target
                        .value,
                  })
                }
                className="
                  form-input
                  !min-h-[50px]
                  !w-full
                  !rounded-[14px]
                  !bg-white/[0.04]
                  !px-3
                  !text-[12px]

                  focus:!outline-none
                  focus-visible:!outline-none
                  focus:!ring-0
                "
              />
            </label>
          </div>

          {/* DESKTOP APPLY */}

          {!mobile && (
            <button
              type="button"
              disabled={
                !rangeValid
              }
              onClick={() =>
                setOpenPanel(
                  null,
                )
              }
              className="
                primary-button
                mt-4
                min-h-[48px]
                w-full

                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              {t(
                "common.apply",
              )}
            </button>
          )}
        </div>
      )}
    </>
  );

  /* =====================================================
     TYPE OPTIONS
  ===================================================== */

  const renderTypeOptions = (
    mobile:
      boolean,
  ) => (
    <div
      className={
        mobile
          ? "grid grid-cols-2 gap-2"
          : "grid gap-2 sm:grid-cols-2"
      }
    >
      {EVENT_TYPES.map(
        (
          item,
        ) => {
          const active =
            filters.eventTypes.includes(
              item.key,
            );

          return (
            <button
              key={
                item.key
              }
              type="button"
              onClick={() =>
                toggleType(
                  item.key,
                )
              }
              className={`
                flex
                min-h-[58px]
                min-w-0
                items-center
                gap-2.5
                rounded-[16px]
                border
                px-3
                text-left
                transition

                ${
                  active
                    ? "border-primary/40 bg-primary/[0.11] text-white"
                    : "border-white/[0.07] bg-black/20 text-white/50 hover:border-white/[0.15] hover:bg-white/[0.035] hover:text-white"
                }
              `}
            >
              <span
                className="
                  shrink-0
                  text-lg
                "
              >
                {
                  item.emoji
                }
              </span>

              <span
                className="
                  min-w-0
                  flex-1
                  truncate
                  font-subtitle
                  text-[11px]
                "
              >
                {t(
                  `eventTypes.${item.key}`,
                )}
              </span>

              <span
                className={`
                  grid
                  h-6
                  w-6
                  shrink-0
                  place-items-center
                  rounded-full
                  border

                  ${
                    active
                      ? "border-primary bg-primary text-black"
                      : "border-white/[0.11] bg-white/[0.03] text-transparent"
                  }
                `}
              >
                <Check
                  size={
                    12
                  }
                />
              </span>
            </button>
          );
        },
      )}
    </div>
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* ===================================================
          FILTER BAR
      ==================================================== */}

      <section
        ref={
          filtersBarRef
        }
        className="
          relative
          w-full
          rounded-[22px]
          border
          border-white/[0.09]
          bg-[#151515]/95
          p-2.5
          shadow-[0_20px_70px_rgba(0,0,0,.25)]
          backdrop-blur-xl

          sm:rounded-[26px]
          sm:p-3

          lg:rounded-[28px]
        "
      >
        <div
          className="
            grid
            gap-2.5

            lg:grid-cols-[minmax(260px,1fr)_230px_220px_56px]
          "
        >
          {/* =================================================
              SEARCH
          ================================================= */}

          <label
            className="
              flex
              min-h-[54px]
              min-w-0
              items-center
              gap-3
              rounded-[16px]
              border
              border-white/[0.08]
              bg-black/20
              px-3.5
              transition

              hover:border-white/[0.14]
              focus-within:border-white/20

              lg:rounded-[18px]
            "
          >
            <Search
              size={
                18
              }
              className="
                shrink-0
                text-white/25
              "
            />

            <input
              type="search"
              value={
                filters.search
              }
              onChange={(
                event,
              ) =>
                onChange({
                  ...filters,

                  search:
                    event
                      .target
                      .value,
                })
              }
              placeholder={t(
                "filters.searchPlaceholder",
              )}
              className="
                min-w-0
                flex-1
                bg-transparent
                font-body
                text-[13px]
                text-white
                outline-none
                placeholder:text-white/25

                focus:outline-none
                focus-visible:outline-none
              "
            />

            {filters.search && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,

                    search:
                      "",
                  })
                }
                className="
                  grid
                  h-8
                  w-8
                  shrink-0
                  place-items-center
                  rounded-full
                  text-white/30
                  transition

                  hover:bg-white/[0.07]
                  hover:text-white
                "
                aria-label={t(
                  "common.reset",
                )}
              >
                <X
                  size={
                    15
                  }
                />
              </button>
            )}
          </label>

          {/* =================================================
              MOBILE FILTER BUTTON
          ================================================= */}

          <div
            className="
              grid
              grid-cols-[minmax(0,1fr)_54px]
              gap-2.5

              lg:hidden
            "
          >
            <button
              type="button"
              onClick={() =>
                setOpenPanel(
                  "mobile",
                )
              }
              className={`
                flex
                min-h-[54px]
                min-w-0
                items-center
                gap-3
                rounded-[16px]
                border
                px-3.5
                text-left
                transition

                ${
                  activeCount >
                  0
                    ? "border-secondary/30 bg-secondary/[0.08]"
                    : "border-white/[0.08] bg-black/20"
                }
              `}
            >
              <span
                className="
                  grid
                  h-8
                  w-8
                  shrink-0
                  place-items-center
                  rounded-full
                  bg-white/[0.055]
                  text-secondary
                "
              >
                <SlidersHorizontal
                  size={
                    16
                  }
                />
              </span>

              <span
                className="
                  min-w-0
                  flex-1
                "
              >
                <strong
                  className="
                    block
                    font-subtitle
                    text-[12px]
                    text-white/80
                  "
                >
                  Filtres
                </strong>

                <span
                  className="
                    mt-0.5
                    block
                    truncate
                    font-body
                    text-[9px]
                    text-white/30
                  "
                >
                  Date · Type de soirée
                </span>
              </span>

              {activeCount >
                0 && (
                <span
                  className="
                    grid
                    h-6
                    min-w-6
                    shrink-0
                    place-items-center
                    rounded-full
                    bg-secondary
                    px-1
                    font-subtitle
                    text-[9px]
                    text-black
                  "
                >
                  {
                    activeCount
                  }
                </span>
              )}

              <ChevronDown
                size={
                  16
                }
                className="
                  shrink-0
                  text-white/25
                "
              />
            </button>

            {/* RESET MOBILE */}

            <button
              type="button"
              onClick={
                resetAll
              }
              disabled={
                activeCount ===
                0
              }
              className="
                grid
                min-h-[54px]
                place-items-center
                rounded-[16px]
                border
                border-white/[0.08]
                bg-black/20
                text-white/35
                transition

                hover:border-white/15
                hover:text-white

                disabled:cursor-default
                disabled:opacity-20
              "
              aria-label={t(
                "common.reset",
              )}
            >
              <RotateCcw
                size={
                  17
                }
              />
            </button>
          </div>

          {/* =================================================
              DATE DESKTOP
          ================================================= */}

          <div
            className="
              relative
              hidden
              lg:block
            "
          >
            <button
              type="button"
              onClick={() =>
                setOpenPanel(
                  (
                    current,
                  ) =>
                    current ===
                    "date"
                      ? null
                      : "date",
                )
              }
              className={`
                flex
                min-h-[54px]
                w-full
                min-w-0
                items-center
                gap-3
                rounded-[18px]
                border
                px-3.5
                text-left
                transition

                ${
                  filters.datePreset !==
                  "all"
                    ? "border-secondary/35 bg-secondary/[0.08]"
                    : "border-white/[0.08] bg-black/20 hover:border-white/[0.15]"
                }
              `}
            >
              <span
                className="
                  grid
                  h-8
                  w-8
                  shrink-0
                  place-items-center
                  rounded-full
                  bg-white/[0.055]
                  text-secondary
                "
              >
                <CalendarDays
                  size={
                    16
                  }
                />
              </span>

              <span
                className="
                  min-w-0
                  flex-1
                "
              >
                <span
                  className="
                    block
                    font-subtitle
                    text-[8px]
                    uppercase
                    tracking-[0.13em]
                    text-white/28
                  "
                >
                  {t(
                    "filters.date",
                  )}
                </span>

                <strong
                  className="
                    mt-0.5
                    block
                    truncate
                    font-subtitle
                    text-[12px]
                    text-white/75
                  "
                >
                  {
                    dateLabel
                  }
                </strong>
              </span>

              <ChevronDown
                size={
                  16
                }
                className={`
                  shrink-0
                  text-white/25
                  transition-transform

                  ${
                    openPanel ===
                    "date"
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>
          </div>

          {/* =================================================
              TYPE DESKTOP
          ================================================= */}

          <div
            className="
              relative
              hidden
              lg:block
            "
          >
            <button
              type="button"
              onClick={() =>
                setOpenPanel(
                  (
                    current,
                  ) =>
                    current ===
                    "type"
                      ? null
                      : "type",
                )
              }
              className={`
                flex
                min-h-[54px]
                w-full
                min-w-0
                items-center
                gap-3
                rounded-[18px]
                border
                px-3.5
                text-left
                transition

                ${
                  filters.eventTypes
                    .length > 0
                    ? "border-primary/35 bg-primary/[0.08]"
                    : "border-white/[0.08] bg-black/20 hover:border-white/[0.15]"
                }
              `}
            >
              <span
                className="
                  grid
                  h-8
                  w-8
                  shrink-0
                  place-items-center
                  rounded-full
                  bg-white/[0.055]
                  text-primary
                "
              >
                <SlidersHorizontal
                  size={
                    16
                  }
                />
              </span>

              <span
                className="
                  min-w-0
                  flex-1
                "
              >
                <span
                  className="
                    block
                    font-subtitle
                    text-[8px]
                    uppercase
                    tracking-[0.13em]
                    text-white/28
                  "
                >
                  {t(
                    "filters.type",
                  )}
                </span>

                <strong
                  className="
                    mt-0.5
                    block
                    truncate
                    font-subtitle
                    text-[12px]
                    text-white/75
                  "
                >
                  {
                    typeLabel
                  }
                </strong>
              </span>

              <ChevronDown
                size={
                  16
                }
                className={`
                  shrink-0
                  text-white/25
                  transition-transform

                  ${
                    openPanel ===
                    "type"
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>
          </div>

          {/* =================================================
              RESET DESKTOP
          ================================================= */}

          <button
            type="button"
            onClick={
              resetAll
            }
            disabled={
              activeCount ===
              0
            }
            className="
              hidden
              min-h-[54px]
              place-items-center
              rounded-[18px]
              border
              border-white/[0.08]
              bg-black/20
              text-white/35
              transition

              hover:border-white/[0.16]
              hover:bg-white/[0.04]
              hover:text-white

              disabled:cursor-default
              disabled:opacity-20

              lg:grid
            "
            aria-label={t(
              "common.reset",
            )}
          >
            {activeCount >
            0 ? (
              <Filter
                size={
                  17
                }
              />
            ) : (
              <RotateCcw
                size={
                  17
                }
              />
            )}
          </button>
        </div>
      </section>

      {/* ===================================================
          DESKTOP DATE PANEL
      ==================================================== */}

      <FilterLayer
        open={
          openPanel ===
          "date"
        }
        mode="popover"
        title={t(
          "filters.date",
        )}
        anchorRef={
          filtersBarRef
        }
        onClose={() =>
          setOpenPanel(
            null,
          )
        }
      >
        {renderDateOptions(
          false,
        )}
      </FilterLayer>

      {/* ===================================================
          DESKTOP TYPE PANEL
      ==================================================== */}

      <FilterLayer
        open={
          openPanel ===
          "type"
        }
        mode="popover"
        title={t(
          "filters.type",
        )}
        anchorRef={
          filtersBarRef
        }
        onClose={() =>
          setOpenPanel(
            null,
          )
        }
      >
        {renderTypeOptions(
          false,
        )}

        <div
          className="
            mt-5
            flex
            gap-2.5
          "
        >
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,

                eventTypes:
                  [],
              })
            }
            className="
              secondary-button
              min-h-[48px]
              flex-1
            "
          >
            {t(
              "common.reset",
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setOpenPanel(
                null,
              )
            }
            className="
              primary-button
              min-h-[48px]
              flex-1
            "
          >
            {t(
              "common.apply",
            )}
          </button>
        </div>
      </FilterLayer>

      {/* ===================================================
          MOBILE FILTER SHEET
      ==================================================== */}

      <FilterLayer
        open={
          openPanel ===
          "mobile"
        }
        mode="sheet"
        title="Filtres"
        onClose={() =>
          setOpenPanel(
            null,
          )
        }
      >
        {/* =================================================
            DATE MOBILE
        ================================================= */}

        <div>
          <div
            className="
              mb-3
              flex
              items-center
              gap-2.5
            "
          >
            <span
              className="
                grid
                h-8
                w-8
                place-items-center
                rounded-full
                bg-secondary/[0.10]
                text-secondary
              "
            >
              <CalendarDays
                size={
                  16
                }
              />
            </span>

            <div>
              <span
                className="
                  block
                  font-subtitle
                  text-[9px]
                  uppercase
                  tracking-[0.14em]
                  text-white/30
                "
              >
                Quand ?
              </span>

              <strong
                className="
                  block
                  font-subtitle
                  text-[13px]
                  text-white/80
                "
              >
                {t(
                  "filters.date",
                )}
              </strong>
            </div>
          </div>

          {renderDateOptions(
            true,
          )}
        </div>

        {/* DIVIDER */}

        <div
          className="
            my-5
            h-px
            bg-white/[0.07]
          "
        />

        {/* =================================================
            TYPE MOBILE
        ================================================= */}

        <div>
          <div
            className="
              mb-3
              flex
              items-center
              gap-2.5
            "
          >
            <span
              className="
                grid
                h-8
                w-8
                place-items-center
                rounded-full
                bg-primary/[0.10]
                text-primary
              "
            >
              <SlidersHorizontal
                size={
                  16
                }
              />
            </span>

            <div>
              <span
                className="
                  block
                  font-subtitle
                  text-[9px]
                  uppercase
                  tracking-[0.14em]
                  text-white/30
                "
              >
                Ambiance
              </span>

              <strong
                className="
                  block
                  font-subtitle
                  text-[13px]
                  text-white/80
                "
              >
                {t(
                  "filters.type",
                )}
              </strong>
            </div>
          </div>

          {renderTypeOptions(
            true,
          )}
        </div>

        {/* =================================================
            MOBILE ACTIONS
        ================================================= */}

        <div
          className="
            sticky
            bottom-0
            z-10
            -mx-1
            mt-6
            flex
            gap-2.5
            border-t
            border-white/[0.08]
            bg-[#151515]/95
            px-1
            pb-1
            pt-4
            backdrop-blur-xl
          "
        >
          <button
            type="button"
            onClick={
              onReset
            }
            disabled={
              activeCount ===
              0
            }
            className="
              secondary-button
              min-h-[52px]
              flex-1

              disabled:cursor-default
              disabled:opacity-25
            "
          >
            <RotateCcw
              size={
                16
              }
            />

            Effacer
          </button>

          <button
            type="button"
            disabled={
              !rangeValid
            }
            onClick={() =>
              setOpenPanel(
                null,
              )
            }
            className="
              primary-button
              min-h-[52px]
              flex-[1.4]

              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <Check
              size={
                16
              }
            />

            {t(
              "common.apply",
            )}
          </button>
        </div>
      </FilterLayer>
    </>
  );
}