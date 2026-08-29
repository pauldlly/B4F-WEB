import {
  ArrowUpRight,
  Clock3,
  MapPin,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useI18n,
} from "../i18n/LanguageProvider";

import {
  eventTypeLabel,
  formatMoney,
} from "../lib/format";

import type {
  PublicEvent,
} from "../types";

import {
  Reveal,
} from "./Reveal";

/*
 * FORMAT HEURE
 * 18:00:00 -> 18:00
 */
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

function getEventTypeAppearance(
  type:
    | string
    | null
    | undefined,
  label: string,
) {
  const value =
    `${type ?? ""} ${label}`
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      );

  /*
   * BOAT PARTY
   */
  if (
    value.includes(
      "boat",
    ) ||
    value.includes(
      "bateau",
    )
  ) {
    return {
      emoji:
        "🚤",

      className:
        "border-sky-300/25 bg-gradient-to-r from-sky-500/45 via-blue-500/40 to-cyan-400/30 text-sky-50 shadow-[0_8px_30px_rgba(14,165,233,.15)]",
    };
  }

  /*
   * POOL PARTY
   */
  if (
    value.includes(
      "pool",
    ) ||
    value.includes(
      "piscine",
    )
  ) {
    return {
      emoji:
        "🏊",

      className:
        "border-emerald-300/25 bg-gradient-to-r from-emerald-500/45 via-green-500/40 to-lime-400/25 text-emerald-50 shadow-[0_8px_30px_rgba(16,185,129,.14)]",
    };
  }

  /*
   * NIGHT CLUB
   */
  if (
    value.includes(
      "night",
    ) ||
    value.includes(
      "club",
    ) ||
    value.includes(
      "discotheque",
    )
  ) {
    return {
      emoji:
        "🪩",

      className:
        "border-violet-300/25 bg-gradient-to-r from-violet-500/45 via-purple-500/40 to-fuchsia-500/30 text-violet-50 shadow-[0_8px_30px_rgba(139,92,246,.15)]",
    };
  }

  /*
   * AUTRES
   */
  return {
    emoji:
      "✨",

    className:
      "border-orange-300/20 bg-gradient-to-r from-orange-500/40 via-orange-400/35 to-pink-500/30 text-orange-50",
  };
}

export function EventCard({
  event,
  featured = false,
  revealDelay = 0,
}: {
  event: PublicEvent;
  featured?: boolean;
  revealDelay?: number;
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
      event.womenPrice,
      event.menPrice,
    );

  /*
   * TYPE DE SOIRÉE
   */
  const typeLabel =
    eventTypeLabel(
      event.type,
      t,
    );

  const typeAppearance =
    getEventTypeAppearance(
      event.type,
      typeLabel,
    );

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
          hover:border-secondary/[0.28]
          hover:bg-[#131313]
          hover:shadow-[0_30px_90px_rgba(0,0,0,.38)]
        "
      >
        {/* IMAGE */}
        <Link
          to={`/event/${event.id}`}
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
          {event.imageUrl ? (
            <img
              src={
                event.imageUrl
              }
              alt={
                event.name
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
                  event.soldout
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
                bg-gradient-to-br
                from-secondary/20
                via-[#181818]
                to-primary/[0.15]
              "
            >
              <img
                src="/brand/b4f-mark-gradient.png"
                alt=""
                aria-hidden="true"
                className="
                  w-36
                  opacity-25
                "
              />
            </div>
          )}

          {/* IMAGE OVERLAY */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(0,0,0,.03)_10%,rgba(0,0,0,.06)_48%,rgba(0,0,0,.62)_100%)]
            "
          />

          {/* SOLD OUT SHADE */}
          {event.soldout && (
            <div className="sold-out-shade absolute inset-0" />
          )}

          {/* TYPE DE SOIRÉE */}
          <span
            className={`
              absolute
              left-4
              top-4
              inline-flex
              max-w-[65%]
              items-center
              gap-2
              rounded-full
              border
              px-3
              py-2
              backdrop-blur-xl
              ${typeAppearance.className}
            `}
          >
            {/* EMOJI */}
            <span
              className="
                text-[13px]
                leading-none
              "
            >
              {
                typeAppearance.emoji
              }
            </span>

            {/* TYPE */}
            <span
              className="
                truncate
                font-subtitle
                text-[9px]
                uppercase
                tracking-[0.12em]
              "
            >
              {
                typeLabel
              }
            </span>
          </span>

          {/* SOLD OUT — ANCIEN DESIGN */}
          {event.soldout && (
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
          {/* TITLE */}
          <Link
            to={`/event/${event.id}`}
            className="block"
          >
            <h3
              className="
                line-clamp-2
                font-title
                text-[1.65rem]
                uppercase
                leading-[0.92]
                text-white/95
                transition-colors
                duration-300
                group-hover:text-secondary
                sm:text-[1.8rem]
              "
            >
              {
                event.name
              }
            </h3>
          </Link>

          {/* HOURS + LOCATION */}
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
            {/* HOURS */}
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
                  border-orange-400/10
                  bg-orange-400/[0.06]
                  text-secondary
                "
              >
                <Clock3
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
                  Horaires
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
                  {formatClock(
                    event.startTime,
                  )}

                  <span
                    className="
                      mx-1
                      text-white/20
                    "
                  >
                    →
                  </span>

                  {formatClock(
                    event.endTime,
                  )}
                </strong>
              </div>
            </div>

            {/* LOCATION */}
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
                  border-pink-400/10
                  bg-pink-400/[0.055]
                  text-[#ff669f]
                "
              >
                <MapPin
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
                  Lieu
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
                  {event.location ||
                    event.address ||
                    t(
                      "common.placeTbd",
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
                {event.soldout
                  ? t(
                      "common.soldOut",
                    )
                  : t(
                      "common.from",
                    )}
              </span>

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

            {/* SMALL DETAILS BUTTON */}
            <Link
              to={`/event/${event.id}`}
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
              )} ${event.name}`}
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