import {
  ArrowUpRight,
} from "lucide-react";

import {
  Reveal,
} from "./Reveal";

const partners = [
  {
    name: "Shôko",
    logo: "/partners/shoko.svg",
    url: "https://shoko.biz/",
  },
  {
    name: "Opium",
    logo: "/partners/opium.svg",
    url: "https://opiumbarcelona.com/",
  },
  {
    name: "Carpe Diem",
    logo: "/partners/cdlc.svg",
    url: "https://cdlcbarcelona.com/",
  },
  {
    name: "Sutton",
    logo: "/partners/sutton.svg",
    url: "https://suttonbarcelona.com/",
  },
  {
    name: "Otto Zutz",
    logo: "/partners/otto-zutz.svg",
    url: "https://www.ottozutz.com/",
  },
  {
    name: "Sea Sea Club",
    logo: "/partners/sea-sea-club.svg",
    url: "https://www.seaseaclub.com/",
  },
];

export function PartnersSection() {
  /*
   * DUPLICATION POUR AVOIR
   * UNE BOUCLE INFINIE FLUIDE
   */
  const marqueePartners = [
    ...partners,
    ...partners,
  ];

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#090909]
        py-10
        sm:py-18
      "
    >
      <style>{`
        @keyframes partners-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .partners-marquee-track {
          animation: partners-marquee 28s linear infinite;
        }

        .partners-marquee:hover .partners-marquee-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .partners-marquee-track {
            animation: none;
          }
        }
      `}</style>

      {/* BACKGROUND GLOWS */}
      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-1/2
          h-[420px]
          w-[420px]
          -translate-y-1/2
          rounded-full
          bg-orange-500/[0.04]
          blur-[130px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          top-1/2
          h-[420px]
          w-[420px]
          -translate-y-1/2
          rounded-full
          bg-pink-500/[0.04]
          blur-[130px]
        "
      />

      {/* HEADER */}
      <div className="page-shell relative">
        <Reveal>
          <div
            className="
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div className="max-w-4xl">
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

                Le réseau B4F
              </span>

              <h2
                className="
                  mt-5
                  font-title
                  text-[clamp(2.8rem,6vw,5.5rem)]
                  uppercase
                  leading-[0.86]
                  tracking-[-0.05em]
                "
              >
                Les lieux qui font

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
                  vibrer Barcelone.
                </span>
              </h2>
            </div>

          </div>
        </Reveal>
      </div>

      {/* CAROUSEL */}
      <Reveal
        delay={100}
        className="
          relative
          mt-12
          sm:mt-14
        "
      >
        <div
          className="
            partners-marquee
            relative
            overflow-hidden
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
              w-16
              bg-gradient-to-r
              from-[#090909]
              to-transparent
              sm:w-32
              lg:w-48
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
              w-16
              bg-gradient-to-l
              from-[#090909]
              to-transparent
              sm:w-32
              lg:w-48
            "
          />

          {/* TRACK */}
          <div
            className="
              partners-marquee-track
              flex
              w-max
              gap-4
              px-2
            "
          >
            {marqueePartners.map(
              (
                partner,
                index,
              ) => (
                <a
                  key={`${partner.name}-${index}`}
                  href={partner.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={
                    partner.name
                  }
                  className="
                    group
                    relative
                    flex
                    h-[150px]
                    w-[220px]
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-white/[0.07]
                    bg-[#111]
                    px-7
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:border-secondary/[0.30]
                    hover:bg-[#151515]
                    hover:shadow-[0_24px_80px_rgba(0,0,0,.35)]
                    sm:h-[170px]
                    sm:w-[260px]
                  "
                >
                  {/* INNER GLOW */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      opacity-0
                      transition-opacity
                      duration-500
                      group-hover:opacity-100
                      bg-[radial-gradient(circle_at_50%_100%,rgba(255,120,55,.12),transparent_60%)]
                    "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                      absolute
                      left-1/2
                      top-0
                      h-px
                      w-0
                      -translate-x-1/2
                      bg-gradient-to-r
                      from-transparent
                      via-secondary
                      to-transparent
                      transition-all
                      duration-500
                      group-hover:w-2/3
                    "
                  />

                  {/* LOGO */}
                  <img
                    src={
                      partner.logo
                    }
                    alt={`Logo ${partner.name}`}
                    loading="lazy"
                    className="
                      relative
                      z-10
                      max-h-[68px]
                      w-[75%]
                      object-contain
                      opacity-55
                      grayscale
                      transition-all
                      duration-500
                      group-hover:scale-[1.05]
                      group-hover:opacity-100
                      group-hover:grayscale-0
                    "
                  />

                  {/* NAME */}
                  <span
                    className="
                      absolute
                      bottom-4
                      left-5
                      translate-y-2
                      font-subtitle
                      text-[9px]
                      uppercase
                      tracking-[0.12em]
                      text-white/0
                      transition-all
                      duration-300
                      group-hover:translate-y-0
                      group-hover:text-white/45
                    "
                  >
                    {
                      partner.name
                    }
                  </span>

                  {/* ARROW */}
                  <span
                    className="
                      absolute
                      bottom-4
                      right-4
                      grid
                      h-8
                      w-8
                      translate-y-2
                      place-items-center
                      rounded-full
                      border
                      border-white/[0.08]
                      bg-white/[0.035]
                      text-white/0
                      opacity-0
                      transition-all
                      duration-300
                      group-hover:translate-y-0
                      group-hover:text-secondary
                      group-hover:opacity-100
                    "
                  >
                    <ArrowUpRight
                      size={14}
                    />
                  </span>
                </a>
              ),
            )}
          </div>
        </div>
      </Reveal>

      {/* SMALL TEXT */}
      <div
        className="
          page-shell
          relative
          mt-8
        "
      >
      </div>
    </section>
  );
}