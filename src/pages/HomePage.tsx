import {
  ArrowRight,
  CalendarCheck2,
  Camera,
  MapPin,
  Play,
  Users,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  Link,
} from "react-router-dom";

import { AgencyStats } from "../components/AgencyStats";
import { PartnersSection } from "../components/PartnersSection";
import { Reveal } from "../components/Reveal";
import { Seo } from "../components/Seo";

import { media } from "../data/media";

import {
  useEventsInfinite,
} from "../hooks/useCatalogQueries";

import {
  useI18n,
} from "../i18n/LanguageProvider";

import {
  formatEventDate,
  formatMoney,
} from "../lib/format";

import type {
  CatalogFilters,
} from "../types";

const defaultFilters: CatalogFilters = {
  search: "",
  eventTypes: [],
  datePreset: "all",
  startDate: "",
  endDate: "",
};

const socialImages = [
  media.backstage,
  media.pool,
  media.boat,
  media.club,
];

export function HomePage() {
  const {
    locale,
  } = useI18n();

  const siteUrl =
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    window.location.origin;

  const eventsQuery =
    useEventsInfinite(
      defaultFilters,
    );

  const allEvents =
    useMemo(
      () =>
        eventsQuery.data?.pages.flatMap(
          (page) =>
            page.items,
        ) ?? [],
      [
        eventsQuery.data,
      ],
    );

  const events =
    useMemo(
      () =>
        allEvents.slice(
          0,
          3,
        ),
      [
        allEvents,
      ],
    );

  const heroEvent =
    events[0] ??
    null;

  const heroImage =
    heroEvent?.imageUrl ||
    media.hero;

  return (
    <>
      <Seo
        title="B4F EVENTS Barcelona — Billets, soirées et packs"
        description="Réservez les prochaines soirées, clubs, boat parties et packs B4F à Barcelone. Achat sans compte, billets QR et assistance rapide."
        path="/"
        image={
          heroImage
        }
        structuredData={{
          "@context":
            "https://schema.org",

          "@graph": [
            {
              "@type":
                "Organization",

              "@id":
                `${siteUrl}/#organization`,

              name:
                "B4F EVENTS",

              url:
                siteUrl,

              logo:
                `${siteUrl}/brand/b4f-mark-gradient.png`,

              sameAs: [
                "https://www.instagram.com/b4f_events",
              ],
            },

            {
              "@type":
                "WebSite",

              "@id":
                `${siteUrl}/#website`,

              name:
                "B4F EVENTS Barcelona",

              url:
                siteUrl,

              publisher: {
                "@id":
                  `${siteUrl}/#organization`,
              },

              potentialAction: {
                "@type":
                  "SearchAction",

                target:
                  `${siteUrl}/events?search={search_term_string}`,

                "query-input":
                  "required name=search_term_string",
              },
            },
          ],
        }}
      />

      {/* =========================
          HERO
      ========================== */}
      <section
        className="
          relative
          min-h-[92svh]
          overflow-hidden
          bg-black
        "
      >
        {/* IMAGE */}
        <img
          src={
            heroImage
          }
          alt="B4F Barcelona nightlife"
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
            bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.74)_45%,rgba(0,0,0,.25)_100%)]
          "
        />

        {/* BOTTOM DARK */}
        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(180deg,rgba(0,0,0,.20)_0%,transparent_45%,#090909_100%)]
          "
        />

        {/* GLOWS */}
        <div
          className="
            party-orb
            party-orb-orange
            absolute
            -left-36
            top-1/4
            h-[440px]
            w-[440px]
            opacity-70
          "
        />

        <div
          className="
            party-orb
            party-orb-pink
            absolute
            -right-40
            top-10
            h-[520px]
            w-[520px]
            opacity-60
          "
        />

        <div
          className="
            party-noise
            absolute
            inset-0
            opacity-[0.14]
          "
        />

        {/* BIG LOGO */}
        <img
          src="/brand/b4f-mark-gradient.png"
          alt=""
          aria-hidden="true"
          className="
            logo-float
            pointer-events-none
            absolute
            -right-28
            top-1/2
            hidden
            w-[720px]
            -translate-y-1/2
            opacity-[0.10]
            mix-blend-screen
            lg:block
          "
        />

        {/* CONTENT */}
        <div
          className="
            page-shell
            relative
            z-10
            flex
            min-h-[92svh]
            items-end
            pb-16
            pt-32
            sm:pb-20
            lg:items-center
            lg:pb-12
          "
        >
          <Reveal
            className="
              max-w-5xl
            "
          >
            {/* SMALL LABEL */}
            <span
              className="
                inline-flex
                items-center
                gap-3
                font-subtitle
                text-[10px]
                uppercase
                tracking-[0.20em]
                text-white/45
              "
            >
              <span
                className="
                  h-px
                  w-9
                  bg-gradient-to-r
                  from-[#ff963f]
                  to-[#ff4f9a]
                "
              />

              Barcelona nightlife
            </span>

            {/* TITLE */}
            <h1
              className="
                mt-6
                font-title
                text-[clamp(3.8rem,12vw,9rem)]
                uppercase
                leading-[0.76]
              "
            >
              We are

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
                the party.
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mt-7
                max-w-2xl
                font-body
                text-base
                leading-7
                text-white/[0.55]
                sm:text-lg
                sm:leading-8
              "
            >
              Les soirées, les packs et les
              bons plans pour vivre
              Barcelone comme il faut.
            </p>


            {/* NEXT EVENT */}
            {heroEvent && (
              <Link
                to={`/event/${heroEvent.id}`}
                className="
                  group
                  relative
                  mt-9
                  flex
                  max-w-2xl
                  flex-col
                  gap-4
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-white/[0.10]
                  bg-black/[0.32]
                  p-3
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:border-secondary/[0.30]
                  hover:bg-black/[0.42]
                  sm:flex-row
                  sm:items-center
                "
              >
                {/* EVENT IMAGE */}
                <div
                  className="
                    relative
                    h-20
                    w-full
                    shrink-0
                    overflow-hidden
                    rounded-[15px]
                    sm:w-24
                  "
                >
                  {heroEvent.imageUrl ? (
                    <img
                      src={
                        heroEvent.imageUrl
                      }
                      alt=""
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div
                      className="
                        h-full
                        w-full
                        bg-gradient-to-br
                        from-secondary/30
                        to-primary/20
                      "
                    />
                  )}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/50
                      to-transparent
                    "
                  />
                </div>

                {/* EVENT INFO */}
                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <span
                    className="
                      font-subtitle
                      text-[8px]
                      uppercase
                      tracking-[0.15em]
                      text-secondary
                    "
                  >
                    Prochaine soirée
                  </span>

                  <strong
                    className="
                      mt-0.5
                      block
                      truncate
                      font-title
                      text-xl
                      uppercase
                    "
                  >
                    {
                      heroEvent.name
                    }
                  </strong>

                  <div
                    className="
                      mt-1.5
                      flex
                      flex-wrap
                      gap-x-4
                      gap-y-1
                      font-body
                      text-[10px]
                      text-white/[0.38]
                    "
                  >
                    <span
                      className="
                        flex
                        items-center
                        gap-1.5
                      "
                    >
                      <CalendarCheck2
                        size={13}
                      />

                      {formatEventDate(
                        heroEvent.eventDate,
                        heroEvent.startTime,
                        {
                          locale,
                        },
                      )}
                    </span>

                    <span
                      className="
                        flex
                        items-center
                        gap-1.5
                      "
                    >
                      <MapPin
                        size={13}
                      />

                      {heroEvent.location ||
                        heroEvent.address ||
                        "Barcelona"}
                    </span>
                  </div>
                </div>

                {/* PRICE */}
                <strong
                  className="
                    shrink-0
                    font-title
                    text-xl
                    text-secondary
                  "
                >
                  {formatMoney(
                    Math.min(
                      heroEvent.womenPrice,
                      heroEvent.menPrice,
                    ),
                    locale,
                  )}
                </strong>
              </Link>
            )}
          </Reveal>
        </div>
      </section>

      {/* =========================
          ORANGE MARQUEE
      ========================== */}
      <div
        className="
          marquee-strip
          overflow-hidden
          border-y
          border-white/[0.06]
          bg-secondary
          py-3
          text-black
        "
      >
        <div
          className="
            marquee-track
            whitespace-nowrap
            font-title
            text-base
            uppercase
            tracking-[0.08em]
            sm:text-lg
          "
        >
          {Array.from({
            length: 10,
          }).map(
            (
              _,
              index,
            ) => (
              <span
                key={
                  index
                }
                className="
                  mx-7
                  inline-flex
                  items-center
                  gap-7
                "
              >
                B4F EVENTS

                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-black
                  "
                />

                BARCELONA NIGHTS
              </span>
            ),
          )}
        </div>
      </div>
      <PartnersSection />

      <AgencyStats />
      <section
        className="
          relative
          overflow-hidden
          border-t
          border-white/[0.06]
          bg-[#090909]
          py-10
          sm:py-18
        "
      >
        {/* GLOWS */}
        <div
          className="
            pointer-events-none
            absolute
            -left-40
            top-1/2
            h-[400px]
            w-[400px]
            -translate-y-1/2
            rounded-full
            bg-orange-500/[0.035]
            blur-[130px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-40
            top-1/2
            h-[400px]
            w-[400px]
            -translate-y-1/2
            rounded-full
            bg-pink-500/[0.035]
            blur-[130px]
          "
        />

        {/* HEADER */}
        <div
          className="
            page-shell
            relative
          "
        >
          <Reveal
            className="
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div
              className="
                max-w-4xl
              "
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-3
                  font-subtitle
                  text-[10px]
                  uppercase
                  tracking-[0.18em]
                  text-white/40
                "
              >
                <span
                  className="
                    h-px
                    w-8
                    bg-gradient-to-r
                    from-[#ff963f]
                    to-[#ff4f9a]
                  "
                />

                B4F social club
              </span>

              <h2
                className="
                  mt-5
                  font-title
                  text-[clamp(2.8rem,6vw,5.5rem)]
                  uppercase
                  leading-[0.86]
                "
              >
                Regarde l’ambiance

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
                  avant de réserver.
                </span>
              </h2>
            </div>

            <a
              href="https://www.instagram.com/b4f_events"
              target="_blank"
              rel="noreferrer"
              className="
                group
                inline-flex
                min-h-[48px]
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-white/[0.10]
                bg-[#111]
                px-5
                font-subtitle
                text-[10px]
                uppercase
                tracking-[0.10em]
                text-white/60
                transition
                hover:border-secondary/35
                hover:text-secondary
              "
            >
              <Camera
                size={16}
              />

              Instagram

              <ArrowRight
                size={14}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </a>
          </Reveal>
        </div>

        {/* SOCIAL CAROUSEL */}
        <div
          className="
            relative
            mt-12
          "
        >
          {/* LEFT FADE */}
          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              left-0
              z-20
              w-12
              bg-gradient-to-r
              from-[#090909]
              to-transparent
              sm:w-24
            "
          />

          {/* RIGHT FADE */}
          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              right-0
              z-20
              w-12
              bg-gradient-to-l
              from-[#090909]
              to-transparent
              sm:w-24
            "
          />

          <div
            className="
              no-scrollbar
              flex
              snap-x
              gap-4
              overflow-x-auto
              px-[5vw]
              pb-3
            "
          >
            {socialImages.map(
              (
                image,
                index,
              ) => (
                <Reveal
                  key={
                    image
                  }
                  delay={
                    index *
                    70
                  }
                  direction="scale"
                  className="
                    min-w-[78vw]
                    snap-center
                    sm:min-w-[330px]
                    lg:min-w-[380px]
                  "
                >
                  <a
                    href="https://www.instagram.com/b4f_events"
                    target="_blank"
                    rel="noreferrer"
                    className="
                      group
                      relative
                      block
                      h-[420px]
                      overflow-hidden
                      rounded-[26px]
                      border
                      border-white/[0.08]
                      bg-[#111]
                    "
                  >
                    <img
                      src={
                        image
                      }
                      alt={`B4F social ${index + 1}`}
                      loading="lazy"
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-700
                        group-hover:scale-[1.05]
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-[linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.10),rgba(0,0,0,.58))]
                        transition
                        group-hover:bg-black/10
                      "
                    />

                    {/* PLAY */}
                    <span
                      className="
                        absolute
                        left-1/2
                        top-1/2
                        grid
                        h-14
                        w-14
                        -translate-x-1/2
                        -translate-y-1/2
                        place-items-center
                        rounded-full
                        border
                        border-white/25
                        bg-black/30
                        text-white
                        backdrop-blur-xl
                        transition-all
                        duration-300
                        group-hover:scale-110
                        group-hover:border-secondary/50
                        group-hover:text-secondary
                      "
                    >
                      <Play
                        size={18}
                        fill="currentColor"
                      />
                    </span>

                    {/* BOTTOM */}
                    <div
                      className="
                        absolute
                        inset-x-0
                        bottom-0
                        flex
                        items-end
                        justify-between
                        p-5
                      "
                    >
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
                          B4F Barcelona
                        </span>

                        <strong
                          className="
                            mt-1
                            block
                            font-title
                            text-xl
                            uppercase
                          "
                        >
                          We are the party
                        </strong>
                      </div>

                      <span
                        className="
                          grid
                          h-9
                          w-9
                          place-items-center
                          rounded-full
                          border
                          border-white/[0.12]
                          bg-black/25
                          text-white/45
                          backdrop-blur-xl
                          transition
                          group-hover:border-secondary/30
                          group-hover:text-secondary
                        "
                      >
                        <ArrowRight
                          size={15}
                        />
                      </span>
                    </div>
                  </a>
                </Reveal>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className="
          page-shell
          py-10
          sm:py-18
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[32px]
            border
            border-white/[0.08]
            bg-[#111]
            p-6
            sm:p-10
            lg:p-14
          "
        >
          {/* IMAGE */}
          <img
            src={
              media.crowd
            }
            alt="Équipe B4F"
            loading="lazy"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              opacity-30
            "
          />

          {/* DARK */}
          <div
            className="
              absolute
              inset-0
              bg-[linear-gradient(90deg,rgba(9,9,9,.98)_0%,rgba(9,9,9,.83)_48%,rgba(9,9,9,.30)_100%)]
            "
          />

          {/* GLOW */}
          <div
            className="
              party-orb
              party-orb-orange
              absolute
              -bottom-24
              -right-20
              h-80
              w-80
              opacity-60
            "
          />

          <div
            className="
              party-orb
              party-orb-pink
              absolute
              -left-32
              top-0
              h-64
              w-64
              opacity-30
            "
          />

          {/* CONTENT */}
          <Reveal
            className="
              relative
              max-w-4xl
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-2.5
                font-subtitle
                text-[10px]
                uppercase
                tracking-[0.16em]
                text-white/45
              "
            >
              <Users
                size={16}
                className="text-secondary"
              />

              Rejoindre l’équipe
            </span>

            <h2
              className="
                mt-5
                font-title
                text-[clamp(2.7rem,6vw,5.4rem)]
                uppercase
                leading-[0.86]
              "
            >
              Travaille là où

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
                les autres font la fête.
              </span>
            </h2>

            <p
              className="
                mt-6
                max-w-2xl
                font-body
                text-sm
                leading-7
                text-white/[0.48]
                sm:text-base
              "
            >
              Promotion, création de contenu,
              vente et relation client :
              rejoins une équipe internationale
              et vis Barcelone autrement.
            </p>

            <div
              className="
                mt-8
                flex
                flex-wrap
                gap-3
              "
            >
              <Link
                to="/rejoindre"
                className="
                  group
                  inline-flex
                  min-h-[50px]
                  items-center
                  gap-2
                  rounded-full
                  bg-secondary
                  px-6
                  font-subtitle
                  text-xs
                  uppercase
                  tracking-[0.07em]
                  text-black
                  transition
                  hover:brightness-110
                "
              >
                Voir les opportunités

                <ArrowRight
                  size={17}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </Link>

              <Link
                to="/about"
                className="
                  inline-flex
                  min-h-[50px]
                  items-center
                  rounded-full
                  border
                  border-white/[0.12]
                  bg-black/20
                  px-6
                  font-subtitle
                  text-xs
                  uppercase
                  tracking-[0.07em]
                  text-white/60
                  backdrop-blur-xl
                  transition
                  hover:border-white/25
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                Découvrir B4F
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}