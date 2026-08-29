import {
  ArrowLeft,
  Armchair,
  BadgePlus,
  CalendarDays,
  Check,
  CircleAlert,
  Layers3,
  MapPin,
  PackageCheck,
  ShoppingBag,
  TicketCheck,
  WandSparkles,
  X,
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

import { usePackDetail } from "../hooks/useCatalogQueries";

import { useI18n } from "../i18n/LanguageProvider";

import {
  clampToMaximum,
  eventGenderRemaining,
  formatEventDate,
  formatMoney,
  minimumKnown,
  packGenderRemaining,
  parseEventDate,
} from "../lib/format";

import { useCart } from "../providers/CartProvider";

import type {
  PublicPackEvent,
  SelectedExtra,
} from "../types";

/* =========================================================
   TYPES
========================================================= */

type ChoiceGroup = {
  key: string;
  title: string;
  minChoices: number;
  maxChoices: number;
  events: PublicPackEvent[];
};

/* =========================================================
   HELPERS
========================================================= */

function availabilityLabel(
  value: number | null,
  fallback: string,
) {
  return value === null
    ? fallback
    : String(value);
}

function formatExtraMoney(
  value: number,
  locale: string,
) {
  const hasDecimals =
    Math.abs(value % 1) >
    Number.EPSILON;

  return new Intl.NumberFormat(
    locale || "fr-FR",
    {
      style: "currency",
      currency: "EUR",

      minimumFractionDigits:
        hasDecimals
          ? 2
          : 0,

      maximumFractionDigits:
        hasDecimals
          ? 2
          : 0,
    },
  ).format(value);
}

/* =========================================================
   PAGE
========================================================= */

export function PackPage() {
  const {
    packId = "",
  } = useParams();

  const navigate =
    useNavigate();

  const query =
    usePackDetail(
      packId,
    );

  const {
    addItem,
    items: cartItems,
    setOpen,
  } =
    useCart();

  const {
    t,
    locale,
  } =
    useI18n();

  const [
    maleQuantity,
    setMaleQuantity,
  ] =
    useState(0);

  const [
    femaleQuantity,
    setFemaleQuantity,
  ] =
    useState(0);

  const [
    selectedChoiceIds,
    setSelectedChoiceIds,
  ] =
    useState<string[]>(
      [],
    );

  const [
    extraQuantities,
    setExtraQuantities,
  ] =
    useState<
      Record<
        string,
        number
      >
    >({});

  const [
    quickStart,
    setQuickStart,
  ] =
    useState("");

  const [
    quickEnd,
    setQuickEnd,
  ] =
    useState("");

  const [
    feedback,
    setFeedback,
  ] =
    useState("");

  const pack =
    query.data;

  /* =====================================================
     REQUIRED EVENTS
  ===================================================== */

  const requiredEvents =
    useMemo(
      () =>
        pack?.events.filter(
          (
            item,
          ) =>
            item.eventType ===
            "required",
        ) ?? [],
      [
        pack,
      ],
    );

  /* =====================================================
     CHOICE GROUPS
  ===================================================== */

  const choiceGroups =
    useMemo<
      ChoiceGroup[]
    >(
      () => {
        const groups =
          new Map<
            string,
            ChoiceGroup
          >();

        (
          pack?.events ??
          []
        )
          .filter(
            (
              item,
            ) =>
              item.eventType ===
              "choice",
          )
          .forEach(
            (
              item,
            ) => {
              const key =
                item.choiceGroupKey ||
                `choice-${item.id}`;

              const current =
                groups.get(
                  key,
                );

              if (
                current
              ) {
                current.events.push(
                  item,
                );

                current.minChoices =
                  Math.max(
                    current.minChoices,
                    item.minChoices,
                  );

                current.maxChoices =
                  Math.max(
                    current.maxChoices,
                    item.maxChoices,
                  );

                return;
              }

              groups.set(
                key,
                {
                  key,

                  title:
                    item.choiceGroupTitle ||
                    t(
                      "pack.choice",
                    ),

                  minChoices:
                    item.minChoices,

                  maxChoices:
                    item.maxChoices,

                  events: [
                    item,
                  ],
                },
              );
            },
          );

        return Array.from(
          groups.values(),
        ).map(
          (
            group,
          ) => ({
            ...group,

            events: [
              ...group.events,
            ].sort(
              (
                a,
                b,
              ) => {
                const aDate =
                  parseEventDate(
                    a.event.eventDate,
                    a.event.startTime,
                  )?.getTime() ??
                  0;

                const bDate =
                  parseEventDate(
                    b.event.eventDate,
                    b.event.startTime,
                  )?.getTime() ??
                  0;

                return (
                  aDate -
                  bDate
                );
              },
            ),
          }),
        );
      },
      [
        pack,
        t,
      ],
    );

  /* =====================================================
     CLEAN CHOICES
  ===================================================== */

  useEffect(
    () => {
      if (
        !pack
      ) {
        return;
      }

      const validIds =
        new Set(
          pack.events.map(
            (
              item,
            ) =>
              item.id,
          ),
        );

      setSelectedChoiceIds(
        (
          current,
        ) =>
          current.filter(
            (
              id,
            ) =>
              validIds.has(
                id,
              ),
          ),
      );
    },
    [
      pack,
    ],
  );

  /* =====================================================
     AUTO SELECT
  ===================================================== */

  useEffect(
    () => {
      setSelectedChoiceIds(
        (
          current,
        ) => {
          const next =
            new Set(
              current,
            );

          choiceGroups.forEach(
            (
              group,
            ) => {
              const selected =
                group.events.filter(
                  (
                    item,
                  ) =>
                    next.has(
                      item.id,
                    ),
                );

              const available =
                group.events.filter(
                  (
                    item,
                  ) =>
                    !item.event.soldout,
                );

              if (
                selected.length ===
                  0 &&
                group.minChoices >
                  0 &&
                available.length ===
                  1
              ) {
                next.add(
                  available[
                    0
                  ].id,
                );
              }
            },
          );

          return Array.from(
            next,
          );
        },
      );
    },
    [
      choiceGroups,
    ],
  );

  /* =====================================================
     SELECTED EVENTS
  ===================================================== */

  const selectedEvents =
    useMemo(
      () => [
        ...requiredEvents,

        ...(
          pack?.events.filter(
            (
              item,
            ) =>
              item.eventType ===
                "choice" &&
              selectedChoiceIds.includes(
                item.id,
              ),
          ) ??
          []
        ),
      ],
      [
        pack,
        requiredEvents,
        selectedChoiceIds,
      ],
    );

  /* =====================================================
     VALIDATION
  ===================================================== */

  const choiceValidation =
    useMemo(
      () =>
        choiceGroups.map(
          (
            group,
          ) => {
            const count =
              group.events.filter(
                (
                  item,
                ) =>
                  selectedChoiceIds.includes(
                    item.id,
                  ),
              ).length;

            return {
              ...group,

              count,

              valid:
                count >=
                  group.minChoices &&
                count <=
                  group.maxChoices,
            };
          },
        ),
      [
        choiceGroups,
        selectedChoiceIds,
      ],
    );

  const choicesValid =
    choiceValidation.every(
      (
        group,
      ) =>
        group.valid,
    );

  /* =====================================================
     STOCK MAN
  ===================================================== */

  const maleMaximum =
    useMemo(
      () => {
        if (
          !pack
        ) {
          return 0;
        }

        return minimumKnown([
          packGenderRemaining(
            pack,
            "man",
          ),

          ...selectedEvents.map(
            (
              item,
            ) =>
              eventGenderRemaining(
                item.event,
                "man",
              ),
          ),
        ]);
      },
      [
        pack,
        selectedEvents,
      ],
    );

  /* =====================================================
     STOCK WOMAN
  ===================================================== */

  const femaleMaximum =
    useMemo(
      () => {
        if (
          !pack
        ) {
          return 0;
        }

        return minimumKnown([
          packGenderRemaining(
            pack,
            "woman",
          ),

          ...selectedEvents.map(
            (
              item,
            ) =>
              eventGenderRemaining(
                item.event,
                "woman",
              ),
          ),
        ]);
      },
      [
        pack,
        selectedEvents,
      ],
    );

  /* =====================================================
     CLAMP STOCK
  ===================================================== */

  useEffect(
    () => {
      setMaleQuantity(
        (
          current,
        ) =>
          clampToMaximum(
            current,
            maleMaximum,
          ),
      );

      setFemaleQuantity(
        (
          current,
        ) =>
          clampToMaximum(
            current,
            femaleMaximum,
          ),
      );
    },
    [
      femaleMaximum,
      maleMaximum,
    ],
  );

  const totalPackTickets =
    maleQuantity +
    femaleQuantity;

  const requiredUnavailable =
    requiredEvents.some(
      (
        item,
      ) =>
        item.event.soldout,
    );

  /* =====================================================
     AVAILABLE EXTRAS
  ===================================================== */

  const availableExtras =
    useMemo(
      () =>
        selectedEvents.flatMap(
          (
            packEvent,
          ) => [
            ...packEvent.options.map(
              (
                option,
              ) => ({
                key:
                  `pack-option:${packEvent.id}:${option.id}`,

                kind:
                  "option" as const,

                id:
                  option.id,

                packEventId:
                  packEvent.id,

                eventId:
                  packEvent.eventId,

                name:
                  `${option.name} · ${packEvent.event.name}`,

                displayName:
                  option.name,

                eventName:
                  packEvent.event.name,

                description:
                  option.description ??
                  "",

                unitPrice:
                  option.price,

                fullPrice:
                  undefined,

                depositPercentage:
                  undefined,
              }),
            ),

            ...packEvent.tables.map(
              (
                table,
              ) => ({
                key:
                  `pack-table:${packEvent.id}:${table.id}`,

                kind:
                  "table" as const,

                id:
                  table.id,

                packEventId:
                  packEvent.id,

                eventId:
                  packEvent.eventId,

                name:
                  `${table.name} · ${packEvent.event.name}`,

                displayName:
                  table.name,

                eventName:
                  packEvent.event.name,

                description:
                  table.description ??
                  "",

                unitPrice:
                  table.depositPrice,

                fullPrice:
                  table.fullPrice,

                depositPercentage:
                  table.depositPercentage,
              }),
            ),
          ],
        ),
      [
        selectedEvents,
      ],
    );

  const availableOptions =
    useMemo(
      () =>
        availableExtras.filter(
          (
            extra,
          ) =>
            extra.kind ===
            "option",
        ),
      [
        availableExtras,
      ],
    );

  const availableTables =
    useMemo(
      () =>
        availableExtras.filter(
          (
            extra,
          ) =>
            extra.kind ===
            "table",
        ),
      [
        availableExtras,
      ],
    );

  /* =====================================================
     CLEAN EXTRAS
  ===================================================== */

  useEffect(
    () => {
      const validKeys =
        new Set(
          availableExtras.map(
            (
              extra,
            ) =>
              extra.key,
          ),
        );

      setExtraQuantities(
        (
          current,
        ) =>
          Object.fromEntries(
            Object.entries(
              current,
            )
              .filter(
                (
                  [
                    key,
                  ],
                ) =>
                  validKeys.has(
                    key,
                  ),
              )
              .map(
                (
                  [
                    key,
                    value,
                  ],
                ) => {
                  const extra =
                    availableExtras.find(
                      (
                        item,
                      ) =>
                        item.key ===
                        key,
                    );

                  if (
                    extra?.kind ===
                    "table"
                  ) {
                    return [
                      key,

                      Math.min(
                        Math.max(
                          Number(
                            value,
                          ) ||
                            0,
                          0,
                        ),
                        1,
                      ),
                    ];
                  }

                  return [
                    key,

                    Math.min(
                      Math.max(
                        Number(
                          value,
                        ) ||
                          0,
                        0,
                      ),

                      totalPackTickets,
                    ),
                  ];
                },
              ),
          ),
      );
    },
    [
      availableExtras,
      totalPackTickets,
    ],
  );

  /* =====================================================
     SELECTED EXTRAS
  ===================================================== */

  const selectedExtras =
    useMemo<
      SelectedExtra[]
    >(
      () =>
        availableExtras
          .map(
            (
              extra,
            ) => ({
              ...extra,

              quantity:
                extraQuantities[
                  extra.key
                ] ??
                0,
            }),
          )
          .filter(
            (
              extra,
            ) =>
              extra.quantity >
              0,
          ),
      [
        availableExtras,
        extraQuantities,
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
     NOT FOUND
  ===================================================== */

  if (
    query.error ||
    !pack
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
            "pack.notFoundTitle",
          )}
          description={t(
            "pack.notFoundText",
          )}
          noIndex
        />

        <Layers3
          size={48}
          className="
            mx-auto
            text-white/20
          "
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
            "pack.notFoundTitle",
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
            "pack.notFoundText",
          )}
        </p>

        <Link
          to="/packs"
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
     TOTAL
  ===================================================== */

  const extrasTotal =
    selectedExtras.reduce(
      (
        sum,
        extra,
      ) =>
        sum +
        extra.quantity *
          extra.unitPrice,
      0,
    );

  const total =
    maleQuantity *
      pack.menPrice +
    femaleQuantity *
      pack.womenPrice +
    extrasTotal;

  /* =====================================================
     EVENT AVAILABILITY
  ===================================================== */

  const eventCanHandleSelection =
    (
      item:
        PublicPackEvent,
    ) => {
      if (
        item.event.soldout
      ) {
        return false;
      }

      const maleRemaining =
        eventGenderRemaining(
          item.event,
          "man",
        );

      const femaleRemaining =
        eventGenderRemaining(
          item.event,
          "woman",
        );

      return (
        (
          maleRemaining ===
            null ||
          maleQuantity <=
            maleRemaining
        ) &&
        (
          femaleRemaining ===
            null ||
          femaleQuantity <=
            femaleRemaining
        )
      );
    };

  /* =====================================================
     TOGGLE CHOICE
  ===================================================== */

  const toggleChoice =
    (
      group:
        ChoiceGroup,

      packEventId:
        string,
    ) => {
      const target =
        group.events.find(
          (
            item,
          ) =>
            item.id ===
            packEventId,
        );

      if (
        !target ||
        !eventCanHandleSelection(
          target,
        )
      ) {
        setFeedback(
          t(
            "pack.choiceUnavailable",
          ),
        );

        return;
      }

      setFeedback(
        "",
      );

      setSelectedChoiceIds(
        (
          current,
        ) => {
          const selectedInGroup =
            group.events
              .filter(
                (
                  item,
                ) =>
                  current.includes(
                    item.id,
                  ),
              )
              .map(
                (
                  item,
                ) =>
                  item.id,
              );

          const alreadySelected =
            current.includes(
              packEventId,
            );

          if (
            alreadySelected
          ) {
            return current.filter(
              (
                id,
              ) =>
                id !==
                packEventId,
            );
          }

          if (
            selectedInGroup.length >=
            group.maxChoices
          ) {
            if (
              group.maxChoices ===
              1
            ) {
              const groupIds =
                new Set(
                  group.events.map(
                    (
                      item,
                    ) =>
                      item.id,
                  ),
                );

              return [
                ...current.filter(
                  (
                    id,
                  ) =>
                    !groupIds.has(
                      id,
                    ),
                ),

                packEventId,
              ];
            }

            setFeedback(
              t(
                "pack.minMax",
                {
                  min:
                    group.minChoices,

                  max:
                    group.maxChoices,
                },
              ),
            );

            return current;
          }

          return [
            ...current,
            packEventId,
          ];
        },
      );
    };

  /* =====================================================
     QUICK SELECTION
  ===================================================== */

  const applyQuickSelection =
    () => {
      if (
        !quickStart ||
        !quickEnd
      ) {
        setFeedback(
          t(
            "filters.range",
          ),
        );

        return;
      }

      const start =
        new Date(
          `${quickStart}T00:00:00`,
        );

      const end =
        new Date(
          `${quickEnd}T23:59:59`,
        );

      if (
        end.getTime() <
        start.getTime()
      ) {
        setFeedback(
          t(
            "filters.endDate",
          ),
        );

        return;
      }

      const nextIds:
        string[] =
        [];

      for (
        const group
        of choiceGroups
      ) {
        const candidates =
          group.events.filter(
            (
              item,
            ) => {
              const date =
                parseEventDate(
                  item.event.eventDate,
                  item.event.startTime,
                );

              return Boolean(
                date &&
                  date.getTime() >=
                    start.getTime() &&
                  date.getTime() <=
                    end.getTime() &&
                  eventCanHandleSelection(
                    item,
                  ),
              );
            },
          );

        if (
          candidates.length <
          group.minChoices
        ) {
          setFeedback(
            t(
              "pack.unavailable",
            ),
          );

          return;
        }

        nextIds.push(
          ...candidates
            .slice(
              0,
              group.minChoices,
            )
            .map(
              (
                item,
              ) =>
                item.id,
            ),
        );
      }

      const allChoiceIds =
        new Set(
          choiceGroups.flatMap(
            (
              group,
            ) =>
              group.events.map(
                (
                  item,
                ) =>
                  item.id,
              ),
          ),
        );

      setSelectedChoiceIds(
        (
          current,
        ) => [
          ...current.filter(
            (
              id,
            ) =>
              !allChoiceIds.has(
                id,
              ),
          ),

          ...nextIds,
        ],
      );

      setFeedback(
        "",
      );
    };

  /* =====================================================
     UPDATE EXTRA
  ===================================================== */

  const updateExtra =
    (
      key:
        string,

      value:
        number,
    ) => {
      const target =
        availableExtras.find(
          (
            extra,
          ) =>
            extra.key ===
            key,
        );

      if (
        !target
      ) {
        return;
      }

      if (
        target.kind ===
          "table" &&
        value >
          0
      ) {
        setExtraQuantities(
          (
            current,
          ) => {
            const next = {
              ...current,
            };

            availableExtras
              .filter(
                (
                  extra,
                ) =>
                  extra.kind ===
                    "table" &&
                  extra.packEventId ===
                    target.packEventId,
              )
              .forEach(
                (
                  extra,
                ) => {
                  next[
                    extra.key
                  ] =
                    extra.key ===
                    key
                      ? 1
                      : 0;
                },
              );

            return next;
          },
        );

        return;
      }

      setExtraQuantities(
        (
          current,
        ) => ({
          ...current,

          [key]:
            target.kind ===
            "table"
              ? Math.min(
                  Math.max(
                    Number(
                      value,
                    ) ||
                      0,
                    0,
                  ),
                  1,
                )
              : Math.min(
                  Math.max(
                    Number(
                      value,
                    ) ||
                      0,
                    0,
                  ),

                  totalPackTickets,
                ),
        }),
      );
    };

  /* =====================================================
     ADD PACK
  ===================================================== */

  const addPack =
    () => {
      if (
        pack.soldout
      ) {
        setFeedback(
          t(
            "pack.full",
          ),
        );

        return;
      }

      if (
        requiredUnavailable
      ) {
        setFeedback(
          t(
            "pack.requiredUnavailable",
          ),
        );

        return;
      }

      if (
        cartItems.some(
          (
            item,
          ) =>
            item.kind ===
            "event",
        )
      ) {
        setFeedback(
          t(
            "pack.noMixedCart",
          ),
        );

        return;
      }

      if (
        cartItems.some(
          (
            item,
          ) =>
            item.kind ===
              "pack" &&
            item.packId !==
              pack.id,
        )
      ) {
        setFeedback(
          t(
            "pack.onePackRule",
          ),
        );

        return;
      }

      if (
        totalPackTickets <=
        0
      ) {
        setFeedback(
          t(
            "pack.selectionRequired",
          ),
        );

        return;
      }

      if (
        !choicesValid
      ) {
        setFeedback(
          t(
            "pack.completeChoices",
          ),
        );

        return;
      }

      if (
        !selectedEvents.every(
          eventCanHandleSelection,
        )
      ) {
        setFeedback(
          t(
            "pack.unavailable",
          ),
        );

        return;
      }

      const selectionSignature =
        selectedEvents
          .map(
            (
              item,
            ) =>
              item.id,
          )
          .sort()
          .join(
            ",",
          );

      const extrasSignature =
        selectedExtras
          .map(
            (
              extra,
            ) =>
              `${extra.key}:${extra.quantity}`,
          )
          .sort()
          .join(
            ",",
          );

      addItem({
        kind:
          "pack",

        key:
          `pack:${pack.id}:${selectionSignature}:${extrasSignature}`,

        packId:
          pack.id,

        packName:
          pack.name,

        imageUrl:
          pack.imageUrl,

        maleQuantity,

        femaleQuantity,

        maleUnitPrice:
          pack.menPrice,

        femaleUnitPrice:
          pack.womenPrice,

        maleMaximumAvailable:
          maleMaximum,

        femaleMaximumAvailable:
          femaleMaximum,

        selectedEvents:
          selectedEvents.map(
            (
              item,
            ) => ({
              packEventId:
                item.id,

              eventId:
                item.eventId,

              name:
                item.event.name,

              eventDate:
                item.event.eventDate,

              startTime:
                item.event.startTime,

              location:
                item.event.location,
            }),
          ),

        extras:
          selectedExtras,
      });

      setFeedback(
        "",
      );

      navigate(
        "/packs",
      );

      setOpen(
        true,
      );
    };

  /* =====================================================
     FINAL VALUES
  ===================================================== */

  const purchaseUnavailable =
    pack.soldout ||
    requiredUnavailable;

  const packColor =
    pack.colorHex ||
    "#ff69b4";

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
          pack.name
        }
        description={
          pack.description ||
          `Réservez le pack ${pack.name} avec B4F EVENTS.`
        }
        path={
          `/pack/${pack.id}`
        }
        image={
          pack.imageUrl
        }
        structuredData={{
          "@context":
            "https://schema.org",

          "@type":
            "Product",

          name:
            pack.name,

          description:
            pack.description,

          image:
            pack.imageUrl,

          brand: {
            "@type":
              "Brand",

            name:
              "B4F EVENTS",
          },

          offers: {
            "@type":
              "Offer",

            price:
              Math.min(
                pack.womenPrice,
                pack.menPrice,
              ),

            priceCurrency:
              "EUR",

            availability:
              pack.soldout
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
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
          to="/packs"
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
              size={13}
            />
          </span>

          Retour aux packs
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
            lg:grid-cols-[minmax(0,1fr)_460px]
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

                lg:h-[550px]
                lg:rounded-[28px]
              "
            >
              {pack.imageUrl ? (
                <img
                  src={
                    pack.imageUrl
                  }
                  alt={
                    pack.name
                  }
                  className={`
                    h-full
                    w-full
                    object-cover

                    ${
                      pack.soldout
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
                  <Layers3
                    size={96}
                    style={{
                      color:
                        packColor,
                    }}
                    className="
                      opacity-30

                      sm:h-[112px]
                      sm:w-[112px]
                    "
                  />
                </div>
              )}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[linear-gradient(180deg,rgba(0,0,0,.06)_0%,transparent_55%,rgba(0,0,0,.30)_100%)]
                "
              />

              {pack.soldout && (
                <div
                  className="
                    sold-out-shade
                    absolute
                    inset-0
                  "
                />
              )}
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
                  font-title

                  text-3xl

                  uppercase
                  leading-[0.88]

                  sm:text-5xl

                  lg:text-6xl
                "
                style={{
                  color:
                    packColor,
                }}
              >
                {
                  pack.name
                }
              </h1>
            </div>

            {/* ===============================================
                DESCRIPTION
            =============================================== */}

            {pack.description && (
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
                    pack.description
                  }
                </p>
              </div>
            )}

            {/* ===============================================
                UNAVAILABLE
            =============================================== */}

            {purchaseUnavailable && (
              <div
                className="
                  mt-5

                  flex
                  gap-3

                  rounded-[20px]

                  border
                  border-red-500/[0.18]
                  bg-red-500/[0.055]

                  p-4

                  sm:mt-7
                  sm:gap-4
                  sm:rounded-[24px]
                  sm:p-5
                "
              >
                <CircleAlert
                  className="
                    shrink-0
                    text-red-300
                  "
                  size={20}
                />

                <p
                  className="
                    font-body
                    text-[13px]
                    leading-6
                    text-red-100/75

                    sm:text-sm
                  "
                >
                  {pack.soldout
                    ? t(
                        "pack.full",
                      )
                    : t(
                        "pack.requiredUnavailable",
                      )}
                </p>
              </div>
            )}

            {/* ===============================================
                QUICK SELECTION
            =============================================== */}

            {choiceGroups.length >
              0 && (
              <div
                className="
                  mt-6

                  rounded-[22px]

                  border
                  border-white/[0.07]
                  bg-[#111]

                  p-4

                  sm:mt-8
                  sm:rounded-[26px]
                  sm:p-6
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

                      h-10
                      w-10

                      shrink-0
                      place-items-center

                      rounded-[12px]

                      bg-secondary/10
                      text-secondary

                      sm:h-11
                      sm:w-11
                      sm:rounded-[13px]
                    "
                  >
                    <WandSparkles
                      size={19}
                    />
                  </span>

                  <div>
                    <h2
                      className="
                        font-title

                        text-lg

                        uppercase

                        sm:text-xl
                      "
                    >
                      {t(
                        "pack.quickTitle",
                      )}
                    </h2>

                    <p
                      className="
                        mt-0.5
                        font-body
                        text-[11px]
                        text-white/[0.35]

                        sm:mt-1
                        sm:text-xs
                      "
                    >
                      {t(
                        "pack.quickText",
                      )}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-4
                    grid
                    gap-3

                    sm:mt-5
                    sm:grid-cols-2
                    sm:gap-4
                  "
                >
                  <label>
                    <span
                      className="
                        mb-2
                        block
                        font-subtitle
                        text-[11px]
                        text-white/50

                        sm:text-xs
                      "
                    >
                      {t(
                        "filters.startDate",
                      )}
                    </span>

                    <input
                      type="date"
                      value={
                        quickStart
                      }
                      onChange={(
                        event,
                      ) =>
                        setQuickStart(
                          event.target.value,
                        )
                      }
                      className="form-input"
                    />
                  </label>

                  <label>
                    <span
                      className="
                        mb-2
                        block
                        font-subtitle
                        text-[11px]
                        text-white/50

                        sm:text-xs
                      "
                    >
                      {t(
                        "filters.endDate",
                      )}
                    </span>

                    <input
                      type="date"
                      min={
                        quickStart ||
                        undefined
                      }
                      value={
                        quickEnd
                      }
                      onChange={(
                        event,
                      ) =>
                        setQuickEnd(
                          event.target.value,
                        )
                      }
                      className="form-input"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={
                    applyQuickSelection
                  }
                  className="
                    secondary-button
                    mt-3
                    w-full

                    sm:mt-4
                  "
                >
                  <WandSparkles
                    size={18}
                  />

                  {t(
                    "common.apply",
                  )}
                </button>
              </div>
            )}

            {/* ===============================================
                EVENTS
            =============================================== */}

            <div
              className="
                mt-7

                sm:mt-10
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
                  "pack.selectedEvents",
                )}
              </h2>

              <div
                className="
                  mt-4
                  space-y-3

                  sm:mt-5
                  sm:space-y-4
                "
              >
                {/* REQUIRED */}

                {requiredEvents.map(
                  (
                    item,
                  ) => (
                    <article
                      key={
                        item.id
                      }
                      className={`
                        rounded-[20px]
                        border
                        bg-[#111]

                        p-4

                        sm:rounded-[24px]
                        sm:p-5

                        ${
                          item.event.soldout
                            ? "border-red-500/[0.18]"
                            : "border-white/[0.07]"
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-3

                          sm:gap-4
                        "
                      >
                        <span
                          className={`
                            grid

                            h-10
                            w-10

                            shrink-0
                            place-items-center

                            rounded-[12px]

                            sm:h-11
                            sm:w-11
                            sm:rounded-[13px]

                            ${
                              item.event.soldout
                                ? "bg-red-500/10 text-red-300"
                                : "bg-green-500/10 text-green-300"
                            }
                          `}
                        >
                          {item.event.soldout ? (
                            <CircleAlert
                              size={19}
                            />
                          ) : (
                            <PackageCheck
                              size={19}
                            />
                          )}
                        </span>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <span
                            className={`
                              font-subtitle
                              text-[8px]
                              uppercase
                              tracking-[0.14em]

                              sm:text-[9px]

                              ${
                                item.event.soldout
                                  ? "text-red-300"
                                  : "text-green-300"
                              }
                            `}
                          >
                            {item.event.soldout
                              ? t(
                                  "common.soldOut",
                                )
                              : t(
                                  "pack.includedAutomatically",
                                )}
                          </span>

                          <h3
                            className="
                              mt-1
                              font-subtitle
                              text-[15px]
                              text-white/90

                              sm:text-lg
                            "
                          >
                            {
                              item.event.name
                            }
                          </h3>

                          <div
                            className="
                              mt-1.5
                              flex
                              flex-wrap
                              items-center
                              gap-x-3
                              gap-y-1
                              font-body
                              text-[10px]
                              text-white/35

                              sm:mt-2
                              sm:text-xs
                            "
                          >
                            <span
                              className="
                                flex
                                items-center
                                gap-1.5
                              "
                            >
                              <CalendarDays
                                size={13}
                                className="shrink-0"
                              />

                              {formatEventDate(
                                item.event.eventDate,
                                item.event.startTime,
                                {
                                  locale,

                                  includeYear:
                                    false,
                                },
                              )}
                            </span>

                            <span
                              className="
                                h-1
                                w-1
                                rounded-full
                                bg-white/15
                              "
                            />

                            <span
                              className="
                                flex
                                min-w-0
                                items-center
                                gap-1.5
                              "
                            >
                              <MapPin
                                size={13}
                                className="shrink-0"
                              />

                              <span className="truncate">
                                {item.event.location ||
                                  t(
                                    "common.placeTbd",
                                  )}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ),
                )}

                {/* CHOICE GROUPS */}

                {choiceGroups.map(
                  (
                    group,
                  ) => {
                    const validation =
                      choiceValidation.find(
                        (
                          item,
                        ) =>
                          item.key ===
                          group.key,
                      );

                    return (
                      <section
                        key={
                          group.key
                        }
                        className="
                          rounded-[22px]

                          border
                          border-white/[0.07]
                          bg-[#111]

                          p-4

                          sm:rounded-[26px]
                          sm:p-6
                        "
                      >
                        <div
                          className="
                            flex
                            flex-col
                            gap-2.5

                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                            sm:gap-3
                          "
                        >
                          <div>
                            <span
                              className="
                                font-subtitle
                                text-[8px]
                                uppercase
                                tracking-[0.14em]

                                sm:text-[9px]
                              "
                              style={{
                                color:
                                  packColor,
                              }}
                            >
                              {t(
                                "pack.choice",
                              )}
                            </span>

                            <h3
                              className="
                                mt-1
                                font-title
                                text-lg
                                uppercase

                                sm:text-xl
                              "
                            >
                              {
                                group.title
                              }
                            </h3>
                          </div>

                          <span
                            className={`
                              w-fit
                              rounded-full

                              px-2.5
                              py-1.5

                              font-subtitle
                              text-[8px]
                              uppercase
                              tracking-[0.08em]

                              sm:px-3
                              sm:py-2
                              sm:text-[9px]

                              ${
                                validation?.valid
                                  ? "bg-green-500/10 text-green-300"
                                  : "bg-secondary/10 text-secondary"
                              }
                            `}
                          >
                            {t(
                              "pack.selectedCount",
                              {
                                count:
                                  validation?.count ??
                                  0,

                                max:
                                  group.maxChoices,
                              },
                            )}
                          </span>
                        </div>

                        <div
                          className="
                            mt-4
                            grid
                            gap-2.5

                            sm:mt-5
                            sm:gap-3
                          "
                        >
                          {group.events.map(
                            (
                              item,
                            ) => {
                              const selected =
                                selectedChoiceIds.includes(
                                  item.id,
                                );

                              const available =
                                eventCanHandleSelection(
                                  item,
                                );

                              return (
                                <button
                                  key={
                                    item.id
                                  }
                                  type="button"
                                  disabled={
                                    !available
                                  }
                                  onClick={() =>
                                    toggleChoice(
                                      group,
                                      item.id,
                                    )
                                  }
                                  className={`
                                    flex
                                    items-center

                                    gap-3

                                    rounded-[17px]
                                    border

                                    p-3

                                    text-left
                                    transition-all
                                    duration-200

                                    sm:gap-4
                                    sm:rounded-[20px]
                                    sm:p-4

                                    ${
                                      selected
                                        ? "border-green-400/25 bg-green-400/[0.055]"
                                        : available
                                          ? "border-white/[0.07] bg-[#151515] hover:border-white/[0.14]"
                                          : "cursor-not-allowed border-red-500/[0.12] bg-red-500/[0.035] opacity-55"
                                    }
                                  `}
                                >
                                  <span
                                    className={`
                                      grid

                                      h-9
                                      w-9

                                      shrink-0
                                      place-items-center

                                      rounded-[11px]

                                      sm:h-10
                                      sm:w-10
                                      sm:rounded-[12px]

                                      ${
                                        selected
                                          ? "bg-green-400/10 text-green-300"
                                          : available
                                            ? "bg-white/[0.05] text-white/30"
                                            : "bg-red-500/10 text-red-300"
                                      }
                                    `}
                                  >
                                    {selected ? (
                                      <TicketCheck
                                        size={18}
                                      />
                                    ) : available ? (
                                      <CalendarDays
                                        size={17}
                                      />
                                    ) : (
                                      <CircleAlert
                                        size={17}
                                      />
                                    )}
                                  </span>

                                  <span
                                    className="
                                      min-w-0
                                      flex-1
                                    "
                                  >
                                    <strong
                                      className={`
                                        block
                                        truncate
                                        font-subtitle

                                        text-[13px]

                                        sm:text-sm

                                        ${
                                          selected
                                            ? "text-white/90"
                                            : "text-white/65"
                                        }
                                      `}
                                    >
                                      {
                                        item.event.name
                                      }
                                    </strong>

                                    <span
                                      className="
                                        mt-1
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-x-2
                                        gap-y-1
                                        font-body
                                        text-[9px]
                                        text-white/35

                                        sm:mt-1.5
                                        sm:gap-x-3
                                        sm:text-[10px]
                                      "
                                    >
                                      <span
                                        className="
                                          flex
                                          items-center
                                          gap-1.5
                                        "
                                      >
                                        <CalendarDays
                                          size={11}
                                          className="
                                            shrink-0
                                            text-white/25
                                          "
                                        />

                                        {formatEventDate(
                                          item.event.eventDate,
                                          item.event.startTime,
                                          {
                                            locale,

                                            includeYear:
                                              false,
                                          },
                                        )}
                                      </span>

                                      {item.event.location && (
                                        <>
                                          <span
                                            className="
                                              h-1
                                              w-1
                                              rounded-full
                                              bg-white/15
                                            "
                                          />

                                          <span
                                            className="
                                              flex
                                              min-w-0
                                              items-center
                                              gap-1.5
                                            "
                                          >
                                            <MapPin
                                              size={11}
                                              className="
                                                shrink-0
                                                text-white/25
                                              "
                                            />

                                            <span className="truncate">
                                              {
                                                item.event.location
                                              }
                                            </span>
                                          </span>
                                        </>
                                      )}
                                    </span>
                                  </span>

                                  {selected && (
                                    <span
                                      className="
                                        grid

                                        h-7
                                        w-7

                                        shrink-0
                                        place-items-center
                                        rounded-full
                                        border
                                        border-green-400/25
                                        bg-green-400/10
                                        text-green-300

                                        sm:h-8
                                        sm:w-8
                                      "
                                    >
                                      <TicketCheck
                                        size={15}
                                        strokeWidth={2.5}
                                      />
                                    </span>
                                  )}
                                </button>
                              );
                            },
                          )}
                        </div>
                      </section>
                    );
                  },
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT / SELECTION
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
            <div
              className="
                flex
                items-end
                justify-between
                gap-3
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
                  "pack.yourSelection",
                )}
              </h2>

              {totalPackTickets >
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
                    totalPackTickets
                  }{" "}
                  pack
                  {totalPackTickets >
                  1
                    ? "s"
                    : ""}
                </span>
              )}
            </div>

            {/* ===============================================
                WOMAN + MAN
            =============================================== */}

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
              {/* WOMAN */}

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
                    femaleQuantity >
                    0
                      ? "border-[#ff4f9a]/40 bg-[#ff4f9a]/[0.07]"
                      : "border-white/[0.08] bg-[#151515]"
                  }
                `}
              >
                {femaleQuantity >
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
                      size={12}
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

                    sm:text-2xl
                  "
                  style={{
                    color:
                      packColor,
                  }}
                >
                  {formatMoney(
                    pack.womenPrice,
                    locale,
                  )}
                </strong>

                <p
                  className="
                    mt-1
                    font-body

                    text-[9px]

                    text-white/25

                    sm:text-[10px]
                  "
                >
                  {femaleMaximum ===
                  null
                    ? t(
                        "event.unknownStock",
                      )
                    : `${availabilityLabel(
                        femaleMaximum,

                        t(
                          "event.unknownStock",
                        ),
                      )} restant${
                        femaleMaximum >
                        1
                          ? "s"
                          : ""
                      }`}
                </p>

                <div
                  className="
                    mt-3

                    sm:mt-4
                  "
                >
                  <QuantityInput
                    compact
                    value={
                      femaleQuantity
                    }
                    minimum={
                      0
                    }
                    maximum={
                      femaleMaximum
                    }
                    onChange={(
                      value,
                    ) => {
                      setFemaleQuantity(
                        value,
                      );

                      setFeedback(
                        "",
                      );
                    }}
                  />
                </div>
              </div>

              {/* MAN */}

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
                    maleQuantity >
                    0
                      ? "border-secondary/40 bg-secondary/[0.07]"
                      : "border-white/[0.08] bg-[#151515]"
                  }
                `}
              >
                {maleQuantity >
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
                      size={12}
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

                    sm:text-2xl
                  "
                  style={{
                    color:
                      packColor,
                  }}
                >
                  {formatMoney(
                    pack.menPrice,
                    locale,
                  )}
                </strong>

                <p
                  className="
                    mt-1
                    font-body

                    text-[9px]

                    text-white/25

                    sm:text-[10px]
                  "
                >
                  {maleMaximum ===
                  null
                    ? t(
                        "event.unknownStock",
                      )
                    : `${availabilityLabel(
                        maleMaximum,

                        t(
                          "event.unknownStock",
                        ),
                      )} restant${
                        maleMaximum >
                        1
                          ? "s"
                          : ""
                      }`}
                </p>

                <div
                  className="
                    mt-3

                    sm:mt-4
                  "
                >
                  <QuantityInput
                    compact
                    value={
                      maleQuantity
                    }
                    minimum={
                      0
                    }
                    maximum={
                      maleMaximum
                    }
                    onChange={(
                      value,
                    ) => {
                      setMaleQuantity(
                        value,
                      );

                      setFeedback(
                        "",
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ===============================================
                PACK EVENTS SUMMARY
            =============================================== */}

            <div
              className="
                mt-4

                rounded-[18px]

                border
                border-white/[0.07]
                bg-[#151515]

                p-3

                sm:mt-5
                sm:rounded-[20px]
                sm:p-4
              "
            >
              <strong
                className="
                  font-subtitle

                  text-[13px]

                  text-white/85

                  sm:text-sm
                "
              >
                Soirées du pack
              </strong>

              <div
                className="
                  mt-3
                  space-y-2.5

                  sm:mt-4
                  sm:space-y-3
                "
              >
                {requiredEvents.map(
                  (
                    item,
                  ) => (
                    <div
                      key={
                        item.id
                      }
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className={`
                          grid
                          h-7
                          w-7
                          shrink-0
                          place-items-center
                          rounded-full

                          ${
                            item.event.soldout
                              ? "bg-red-500/10 text-red-300"
                              : "bg-green-400/10 text-green-300"
                          }
                        `}
                      >
                        {item.event.soldout ? (
                          <X
                            size={14}
                            strokeWidth={2.6}
                          />
                        ) : (
                          <TicketCheck
                            size={14}
                            strokeWidth={2.4}
                          />
                        )}
                      </span>

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <span
                          className="
                            block
                            font-body
                            text-[10px]
                            text-white/30

                            sm:text-[11px]
                          "
                        >
                          Inclus
                        </span>

                        <strong
                          className="
                            block
                            truncate
                            font-subtitle
                            text-[11px]
                            text-white/65

                            sm:text-xs
                          "
                        >
                          {
                            item.event.name
                          }
                        </strong>
                      </div>
                    </div>
                  ),
                )}

                {choiceGroups.map(
                  (
                    group,
                  ) => {
                    const selectedInGroup =
                      group.events.filter(
                        (
                          item,
                        ) =>
                          selectedChoiceIds.includes(
                            item.id,
                          ),
                      );

                    const hasSelection =
                      selectedInGroup.length >
                      0;

                    return (
                      <div
                        key={
                          group.key
                        }
                        className="
                          flex
                          items-start
                          gap-3
                          border-t
                          border-white/[0.05]
                          pt-3
                        "
                      >
                        <span
                          className={`
                            mt-0.5
                            grid
                            h-7
                            w-7
                            shrink-0
                            place-items-center
                            rounded-full

                            ${
                              hasSelection
                                ? "bg-green-400/10 text-green-300"
                                : "bg-red-500/[0.09] text-red-300"
                            }
                          `}
                        >
                          {hasSelection ? (
                            <TicketCheck
                              size={14}
                              strokeWidth={2.4}
                            />
                          ) : (
                            <X
                              size={14}
                              strokeWidth={2.7}
                            />
                          )}
                        </span>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <span
                            className="
                              block
                              font-body
                              text-[9px]
                              text-white/30

                              sm:text-[10px]
                            "
                          >
                            {
                              group.title
                            }
                          </span>

                          {hasSelection ? (
                            <div
                              className="
                                mt-0.5
                                space-y-1
                              "
                            >
                              {selectedInGroup.map(
                                (
                                  item,
                                ) => (
                                  <strong
                                    key={
                                      item.id
                                    }
                                    className="
                                      block
                                      truncate
                                      font-subtitle
                                      text-[11px]
                                      text-white/65

                                      sm:text-xs
                                    "
                                  >
                                    {
                                      item.event.name
                                    }
                                  </strong>
                                ),
                              )}
                            </div>
                          ) : (
                            <span
                              className="
                                mt-0.5
                                block
                                font-body
                                text-[9px]
                                text-red-300/55

                                sm:text-[10px]
                              "
                            >
                              Aucune soirée sélectionnée
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* ===============================================
                OPTIONS
            =============================================== */}

            {availableOptions.length >
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
                      size={17}
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
                      Les options s’ajoutent au prix de ton pack.
                    </p>
                  </div>
                </div>

                {totalPackTickets ===
                  0 && (
                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-3
                      rounded-[14px]
                      border
                      border-white/[0.07]
                      bg-[#151515]

                      px-3
                      py-2.5

                      sm:rounded-[16px]
                      sm:px-4
                      sm:py-3
                    "
                  >
                    <CircleAlert
                      size={15}
                      className="
                        shrink-0
                        text-white/25
                      "
                    />

                    <p
                      className="
                        font-body
                        text-[10px]
                        leading-5
                        text-white/35

                        sm:text-[11px]
                      "
                    >
                      Sélectionne au moins{" "}

                      <strong
                        className="
                          font-subtitle
                          text-white/65
                        "
                      >
                        1 pack
                      </strong>{" "}

                      avant d’ajouter une option.
                    </p>
                  </div>
                )}

                <div
                  className="
                    mt-3
                    space-y-2
                  "
                >
                  {availableOptions.map(
                    (
                      extra,
                    ) => {
                      const quantity =
                        extraQuantities[
                          extra.key
                        ] ??
                        0;

                      const selected =
                        quantity >
                        0;

                      const disabled =
                        totalPackTickets ===
                        0;

                      return (
                        <div
                          key={
                            extra.key
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
                                  extra.displayName
                                }
                              </strong>

                              <span
                                className="
                                  mt-1
                                  inline-flex
                                  rounded-full
                                  bg-white/[0.045]

                                  px-2
                                  py-0.5

                                  font-subtitle
                                  text-[7px]
                                  uppercase
                                  tracking-[0.07em]
                                  text-white/30

                                  sm:py-1
                                  sm:text-[8px]
                                "
                              >
                                {
                                  extra.eventName
                                }
                              </span>

                              {extra.description && (
                                <p
                                  className="
                                    mt-1.5
                                    whitespace-pre-wrap
                                    break-words
                                    font-body
                                    text-[9px]
                                    leading-[15px]
                                    text-white/35

                                    sm:mt-2
                                    sm:text-[10px]
                                    sm:leading-[17px]
                                  "
                                >
                                  {
                                    extra.description
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

                                  sm:mt-2.5
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
                                    extra.unitPrice,
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

                              <p
                                className="
                                  mt-1
                                  font-body
                                  text-[8px]
                                  text-white/20

                                  sm:text-[9px]
                                "
                              >
                                En supplément du pack
                              </p>
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
                                  quantity
                                }
                                minimum={
                                  0
                                }
                                maximum={
                                  totalPackTickets
                                }
                                onChange={(
                                  value,
                                ) =>
                                  updateExtra(
                                    extra.key,
                                    value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          {selected && (
                            <div
                              className="
                                mt-2.5
                                flex
                                items-center
                                justify-between
                                gap-3
                                border-t
                                border-white/[0.06]

                                pt-2.5

                                sm:mt-3
                                sm:pt-3
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
                                  quantity
                                }{" "}
                                ×{" "}
                                {formatExtraMoney(
                                  extra.unitPrice,
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
                                  quantity *
                                    extra.unitPrice,
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

            {/* ===============================================
                TABLES
            =============================================== */}

            {availableTables.length >
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
                      size={18}
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
                  {availableTables.map(
                    (
                      extra,
                    ) => {
                      const selected =
                        (
                          extraQuantities[
                            extra.key
                          ] ??
                          0
                        ) >
                        0;

                      const fullPrice =
                        extra.fullPrice ??
                        0;

                      const remainingPrice =
                        Math.max(
                          0,

                          fullPrice -
                            extra.unitPrice,
                        );

                      return (
                        <button
                          key={
                            extra.key
                          }
                          type="button"
                          onClick={() => {
                            updateExtra(
                              extra.key,

                              selected
                                ? 0
                                : 1,
                            );

                            setFeedback(
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
                                    extra.displayName
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
                                      py-0.5

                                      font-subtitle
                                      text-[7px]
                                      uppercase
                                      tracking-[0.08em]
                                      text-[#ff7eaf]

                                      sm:py-1
                                      sm:text-[8px]
                                    "
                                  >
                                    <Check
                                      size={10}
                                    />

                                    Sélectionnée
                                  </span>
                                )}
                              </div>

                              <span
                                className="
                                  mt-1
                                  inline-flex
                                  rounded-full
                                  bg-white/[0.045]

                                  px-2
                                  py-0.5

                                  font-subtitle
                                  text-[7px]
                                  uppercase
                                  tracking-[0.07em]
                                  text-white/30

                                  sm:mt-1.5
                                  sm:py-1
                                  sm:text-[8px]
                                "
                              >
                                {
                                  extra.eventName
                                }
                              </span>

                              {extra.description && (
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
                                    extra.description
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

                                ${
                                  selected
                                    ? "border-[#ff4f9a] bg-[#ff4f9a] text-black"
                                    : "border-white/15 text-transparent"
                                }
                              `}
                            >
                              <Check
                                size={14}
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
                            {/* NOW */}

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
                                  extra.unitPrice,
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
                                  extra.depositPercentage ??
                                  0
                                }
                                %
                              </span>
                            </div>

                            {/* TOTAL */}

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
                                  fullPrice,
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

                            {/* ON SITE */}

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
                                  extra.unitPrice,
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

            {/* ===============================================
                WARNING
            =============================================== */}

            {!choicesValid && (
              <div
                className="
                  mt-4
                  flex
                  gap-3

                  rounded-[14px]

                  border
                  border-secondary/20
                  bg-secondary/[0.07]

                  p-3

                  sm:mt-5
                  sm:rounded-[16px]
                  sm:p-4
                "
              >
                <CircleAlert
                  size={18}
                  className="
                    shrink-0
                    text-secondary
                  "
                />

                <p
                  className="
                    font-body
                    text-[11px]
                    leading-5
                    text-orange-100/75

                    sm:text-xs
                  "
                >
                  {t(
                    "pack.completeChoices",
                  )}
                </p>
              </div>
            )}

            {/* ===============================================
                FEEDBACK
            =============================================== */}

            {feedback && (
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
                  feedback
                }
              </div>
            )}

            {/* ===============================================
                TOTAL
            =============================================== */}

            <div
              className="
                mt-5
                flex
                items-end
                justify-between
                gap-4
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
                    "common.total",
                  )}
                </span>

                {totalPackTickets >
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
                    {femaleQuantity >
                      0 &&
                      `${femaleQuantity} femme${
                        femaleQuantity >
                        1
                          ? "s"
                          : ""
                      }`}

                    {femaleQuantity >
                      0 &&
                    maleQuantity >
                      0
                      ? " · "
                      : ""}

                    {maleQuantity >
                      0 &&
                      `${maleQuantity} homme${
                        maleQuantity >
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

            {/* ===============================================
                ADD
            =============================================== */}

            <button
              type="button"
              disabled={
                pack.soldout
              }
              onClick={
                addPack
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
              {pack.soldout
                ? t(
                    "pack.full",
                  )
                : totalPackTickets ===
                    0
                  ? "Sélectionne tes packs"
                  : t(
                      "pack.add",
                    )}

              {!pack.soldout && (
                <ShoppingBag
                  size={18}
                />
              )}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}