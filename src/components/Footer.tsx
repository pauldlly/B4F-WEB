import {
  Instagram,
  MessageCircle
} from "lucide-react";

import { Link } from "react-router-dom";

export function Footer() {
  const number = (
    import.meta.env
      .VITE_DEFAULT_PROMOTER_WHATSAPP_NUMBER ||
    "33652195888"
  ).replace(/\D/g, "");

  const whatsappUrl =
    `https://wa.me/${number}?text=${encodeURIComponent(
      ""
    )}`;

  const groups = [
    [
      {
        to: "/events",
        label: "Événements"
      },
      {
        to: "/packs",
        label: "Packs"
      }
    ],
    [
      {
        to: "/aide",
        label: "Aide & FAQ"
      },
      {
        to: "/about",
        label: "À propos"
      },
      {
        to: "/rejoindre",
        label: "Jobs"
      }
    ]
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-[#070707]">
      <div className="party-orb party-orb-orange pointer-events-none absolute -bottom-52 -left-44 h-80 w-80 opacity-20" />

      <div className="party-orb party-orb-pink pointer-events-none absolute -right-52 top-0 h-80 w-80 opacity-15" />

      <div className="page-shell relative py-7 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
          <div>
            <h2 className="font-title text-3xl uppercase leading-[0.92] sm:text-4xl">
              <span className="block">
                Barcelona
              </span>

              <span className="block text-gradient">
                We are the party
              </span>
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.06] px-3 font-body text-[11px] font-medium text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
              >
                <MessageCircle
                  size={13}
                />

                WhatsApp
              </a>

              <a
                href="https://www.instagram.com/b4f_events"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.06] px-3 font-body text-[11px] font-medium text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
              >
                <Instagram
                  size={13}
                />

                Instagram
              </a>

              <a
                href="https://www.tiktok.com/@b4fevents"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.06] px-3 font-body text-[11px] font-medium text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[13px] w-[13px]"
                  aria-hidden="true"
                >
                  <path d="M14.5 3c.4 2.1 1.6 3.4 3.5 4.1v2.8c-1.4 0-2.7-.4-3.8-1.2v6.2c0 3.5-2.4 6.1-5.8 6.1C5.3 21 3 18.7 3 15.6c0-3.4 2.6-5.8 6.2-5.8.3 0 .6 0 .9.1v2.9a4 4 0 0 0-.9-.1c-1.8 0-3.1 1.2-3.1 2.9 0 1.5 1.1 2.6 2.5 2.6 1.7 0 2.7-1.2 2.7-3.3V3h3.2Z" />
                </svg>

                TikTok
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 lg:min-w-[390px] lg:justify-self-end lg:gap-x-16">
            {groups.map(
              (
                group,
                index
              ) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 lg:items-end lg:text-right"
                >
                  {group.map(
                    (link) => (
                      <Link
                        key={
                          link.to
                        }
                        to={
                          link.to
                        }
                        className="w-fit font-body text-[13px] text-white/50 transition-colors duration-200 hover:text-white"
                      >
                        {
                          link.label
                        }
                      </Link>
                    )
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-white/[0.07] pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-10 shrink-0 items-center justify-start">
                <img
                  src="/brand/b4f-header-white.png"
                  alt="B4F EVENTS"
                  className="block max-h-full max-w-full object-contain object-left"
                />
              </div>

              <span className="h-4 w-px shrink-0 bg-white/30" />

              <span className="flex shrink-0 items-center gap-1.5 font-body text-[12px] text-white/30">
                © Copyright B4F Events,
                Barcelona 2027
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-[12px] text-white/25 sm:justify-end">
              <Link
                to="/cgv"
                className="transition-colors duration-200 hover:text-white/70"
              >
                CGV
              </Link>

              <Link
                to="/confidentialite"
                className="transition-colors duration-200 hover:text-white/70"
              >
                Confidentialité
              </Link>

              <Link
                to="/mentions-legales"
                className="transition-colors duration-200 hover:text-white/70"
              >
                Mentions légales
              </Link>

              <Link
                to="/cookies"
                className="transition-colors duration-200 hover:text-white/70"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}