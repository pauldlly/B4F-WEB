import {
  ArrowUpRight,
  CalendarRange,
  Layers3,
  PartyPopper,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useI18n,
} from "../i18n/LanguageProvider";

import {
  formatEventDate,
  formatMoney,
} from "../lib/format";

import type {
  PublicPack,
} from "../types";

import {
  Reveal,
} from "./Reveal";

export function PackCard({
  pack,
  revealDelay = 0,
  featured = false,
}: {
  pack: PublicPack;
  revealDelay?: number;
  featured?: boolean;
}) {
  const {
    t,
    locale,
  } = useI18n();

  /*
   * PRIX MINIMUM
   */
  const minimumPrice =
    Math.min(
      pack.womenPrice,
      pack.menPrice,
    );

  /*
   * COULEUR DU PACK
   */
  const packColor =
    pack.colorHex ||
    "#ff69b4";

  /*
   * NOMBRE RÉEL DE SOIRÉES INCLUSES
   *
   * - chaque soirée obligatoire = 1
   * - chaque groupe de choix = 1
   *
   * Exemple :
   * 2 soirées obligatoires
   * + 3 dates dans le même choix
   * = 3 soirées incluses
   */
  const requiredEventsCount =
    pack.events.filter(
      (item) =>
        item.eventType ===
        "required",
    ).length;

  const choiceGroupsCount =
    new Set(
      pack.events
        .filter(
          (item) =>
            item.eventType ===
            "choice",
        )
        .map(
          (item) =>
            item.choiceGroupKey ||
            `choice-${item.id}`,
        ),
    ).size;

  /*
   * Sécurité si d'autres types
   * de soirées existent
   */
  const otherEventsCount =
    pack.events.filter(
      (item) =>
        item.eventType !==
          "required" &&
        item.eventType !==
          "choice",
    ).length;

  const includedEventsCount =
    requiredEventsCount +
    choiceGroupsCount +
    otherEventsCount;

  return (
    <Reveal
      delay={
        revealDelay
      }
      direction="scale"
      className="h-full"
    >
      <article
        className="
          party-card
          group
          relative
          flex
          h-full
          min-w-0
          flex-col
          overflow-hidden
          rounded-[24px]
          border
          border-white/[0.09]
          bg-[#111]
          transition-all
          duration-500
          hover:-translate-y-1
          hover:border-white/[0.15]
          hover:bg-[#131313]
          hover:shadow-[0_30px_90px_rgba(0,0,0,.38)]
        "
      >
        {/* IMAGE */}
        <Link
          to={`/pack/${pack.id}`}
          className={`
            relative
            block
            overflow-hidden
            bg-[#181818]

            ${
              featured
                ? "h-[340px] sm:h-[420px]"
                : "h-[245px] sm:h-[285px]"
            }
          `}
        >
          {pack.imageUrl ? (
            <img
              src={
                pack.imageUrl
              }
              alt={
                pack.name
              }
              loading="lazy"
              className={`
                h-full
                w-full
                object-cover
                transition
                duration-700
                group-hover:scale-[1.045]

                ${
                  pack.soldout
                    ? "sold-out-image"
                    : ""
                }
              `}
            />
          ) : (
            <div
              className="
                grid
                h-full
                place-items-center
                bg-[#171717]
              "
            >
              <Layers3
                size={90}
                style={{
                  color:
                    packColor,
                }}
                className="
                  opacity-30
                  transition
                  duration-500
                  group-hover:scale-110
                "
              />
            </div>
          )}

          {/* OVERLAY */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(0,0,0,.03)_10%,rgba(0,0,0,.06)_48%,rgba(0,0,0,.62)_100%)]
            "
          />

          {/* SOLD OUT SHADE */}
          {pack.soldout && (
            <div className="sold-out-shade absolute inset-0" />
          )}

          {/* PACK BADGE */}
          <span
            className="
              absolute
              left-4
              top-4
              inline-flex
              items-center
              gap-2
              overflow-hidden
              rounded-full
              border
              border-white/[0.16]
              bg-black/35
              px-3
              py-2
              backdrop-blur-xl
            "
            style={{
              boxShadow:
                `0 8px 30px ${packColor}22`,
            }}
          >
            {/* BADGE COLOR */}
            <span
              className="
                pointer-events-none
                absolute
                inset-0
                opacity-30
              "
              style={{
                background:
                  `linear-gradient(90deg, ${packColor}, ${packColor}80)`,
              }}
            />

            <span
              className="
                relative
                z-10
                text-[13px]
                leading-none
              "
            >
              🎟️
            </span>

            <span
              className="
                relative
                z-10
                font-subtitle
                text-[9px]
                uppercase
                tracking-[0.12em]
                text-white/90
              "
            >
              Pack B4F
            </span>
          </span>

          {/* SOLD OUT */}
          {pack.soldout && (
            <span
              className="
                sold-out-ring
                absolute
                right-4
                top-4
                grid
                h-[82px]
                w-[82px]
                rotate-[-8deg]
                place-items-center
                rounded-full
                border-2
                border-primary/[0.65]
                bg-[#210e13]/[0.85]
                text-center
                font-title
                text-[14px]
                uppercase
                leading-[0.92]
                tracking-[0.08em]
                text-white
                shadow-[0_16px_45px_rgba(0,0,0,.45)]
                backdrop-blur
                sm:h-[94px]
                sm:w-[94px]
                sm:text-base
              "
            >
              Sold
              <br />
              out
            </span>
          )}
        </Link>

        {/* CONTENT */}
        <div
          className="
            flex
            flex-1
            flex-col
            p-5
          "
        >
          {/* PACK NAME */}
          <Link
            to={`/pack/${pack.id}`}
            className="block"
          >
            <h3
              className={`
                line-clamp-2
                font-title
                uppercase
                leading-[0.92]
                tracking-[-0.035em]
                transition-all
                duration-300
                group-hover:brightness-125

                ${
                  featured
                    ? "text-3xl sm:text-5xl"
                    : "text-[1.65rem] sm:text-[1.8rem]"
                }
              `}
              style={{
                color:
                  packColor,
              }}
            >
              {
                pack.name
              }
            </h3>
          </Link>

          {/* PACK INFO */}
          <div
            className="
              mt-3
              grid
              gap-3
              border-t
              border-white/[0.07]
              pt-4
              sm:grid-cols-2
            "
          >
            {/* NUMBER OF EVENTS */}
            <div
              className="
                flex
                min-w-0
                items-center
                gap-2.5
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
                  border-white/[0.07]
                  bg-white/[0.04]
                "
                style={{
                  color:
                    packColor,
                }}
              >
                <PartyPopper
                  size={15}
                />
              </span>

              <div className="min-w-0">
                <span
                  className="
                    block
                    font-body
                    text-[8px]
                    uppercase
                    tracking-[0.11em]
                    text-white/25
                  "
                >
                  Inclus
                </span>

                <strong
                  className="
                    mt-0.5
                    block
                    whitespace-nowrap
                    font-subtitle
                    text-[11px]
                    text-white/75
                  "
                >
                  {
                    includedEventsCount
                  }{" "}
                  soirée
                  {includedEventsCount >
                  1
                    ? "s"
                    : ""}
                </strong>
              </div>
            </div>

            {/* FIRST DATE */}
            <div
              className="
                flex
                min-w-0
                items-center
                gap-2.5
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
                  border-white/[0.07]
                  bg-white/[0.04]
                "
                style={{
                  color:
                    packColor,
                }}
              >
                <CalendarRange
                  size={15}
                />
              </span>

              <div className="min-w-0">
                <span
                  className="
                    block
                    font-body
                    text-[8px]
                    uppercase
                    tracking-[0.11em]
                    text-white/25
                  "
                >
                  À partir du
                </span>

                <strong
                  className="
                    mt-0.5
                    block
                    truncate
                    font-subtitle
                    text-[11px]
                    text-white/75
                  "
                >
                  {formatEventDate(
                    pack.earliestEventDate,
                    null,
                    {
                      includeWeekday:
                        false,

                      includeTime:
                        false,

                      includeYear:
                        false,

                      locale,
                    },
                  )}
                </strong>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div
            className="
              mt-4
              flex
              items-end
              justify-between
              gap-4
              border-t
              border-white/[0.07]
              pt-4
            "
          >
            {/* PRICE */}
            <div className="min-w-0">
              <span
                className="
                  block
                  font-body
                  text-[9px]
                  text-white/30
                "
              >
                {pack.soldout
                  ? t(
                      "common.soldOut",
                    )
                  : t(
                      "common.from",
                    )}
              </span>

              {/* PRIX TOUJOURS ORANGE */}
              <strong
                className="
                  mt-1
                  block
                  font-title
                  text-2xl
                  leading-none
                  text-secondary
                "
              >
                {formatMoney(
                  minimumPrice,
                  locale,
                )}
              </strong>
            </div>

            {/* DETAILS */}
            <Link
              to={`/pack/${pack.id}`}
              className="
                group/button
                grid
                h-9
                w-9
                shrink-0
                place-items-center
                rounded-full
                border
                border-white/[0.10]
                bg-white/[0.035]
                text-white/45
                transition-all
                duration-300
                hover:border-secondary/35
                hover:bg-secondary/10
                hover:text-secondary
              "
              aria-label={`${t(
                "common.details",
              )} ${pack.name}`}
            >
              <ArrowUpRight
                size={16}
                className="
                  transition-transform
                  duration-300
                  group-hover/button:translate-x-[1px]
                  group-hover/button:-translate-y-[1px]
                "
              />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}