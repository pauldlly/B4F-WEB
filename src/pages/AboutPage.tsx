import {
  ArrowRight,
  CalendarCheck2,
  Headphones,
  Ship,
  Smartphone,
  TicketCheck,
  Umbrella
} from "lucide-react";

import { useEffect } from "react";
import { Link } from "react-router-dom";

import { Reveal } from "../components/Reveal";
import { Seo } from "../components/Seo";
import { media } from "../data/media";
import { useI18n } from "../i18n/LanguageProvider";

const experiences = [
  {
    key: "pool_party",
    icon: Umbrella,
    image: media.pool,
    number: "01",
    title: "experience.pool",
    text: "experience.poolText",
    tag: "Day Party · Summer"
  },
  {
    key: "boat_party",
    icon: Ship,
    image: media.boat,
    number: "02",
    title: "experience.boat",
    text: "experience.boatText",
    tag: "Sea · Music · Sunset"
  },
  {
    key: "nightclubs",
    icon: Headphones,
    image: media.club,
    number: "03",
    title: "experience.club",
    text: "experience.clubText",
    tag: "Night · Clubs · Barcelona"
  }
] as const;

const steps = [
  {
    number: "01",
    icon: CalendarCheck2,
    title: "Choisis ton expérience",
    text:
      "Découvre les prochaines soirées B4F et sélectionne l’expérience et la date qui te correspondent."
  },
  {
    number: "02",
    icon: Smartphone,
    title: "Réserve simplement",
    text:
      "Choisis tes billets ou ton pack, renseigne tes informations et finalise ta réservation en ligne."
  },
  {
    number: "03",
    icon: TicketCheck,
    title: "Profite",
    text:
      "Retrouve tes billets et tes QR codes puis présente-les simplement le jour de l’événement."
  }
];

export function AboutPage() {
  const { t } = useI18n();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <Seo
        title={t("nav.about")}
        description={t("aboutPage.description")}
        path="/about"
        image={media.city}
      />

      <section className="relative overflow-hidden bg-black">
        <img
          src={media.city}
          alt="Barcelona"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.96)_0%,rgba(0,0,0,.76)_45%,rgba(0,0,0,.30)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.30)_0%,rgba(0,0,0,.08)_38%,rgba(0,0,0,.92)_100%)]" />

        <div className="pointer-events-none absolute -left-36 top-16 h-[380px] w-[380px] rounded-full bg-secondary/[0.07] blur-[130px]" />

        <div className="page-shell relative min-h-[520px] pt-[125px] sm:min-h-[550px] sm:pt-[135px] lg:min-h-[570px] lg:pt-[140px]">
          <Reveal>
            <div className="max-w-[800px]">
              <p className="font-subtitle text-[11px] uppercase tracking-[0.22em] text-white/40 sm:text-xs">
                Pool Party · Boat Party · Nightclubs
              </p>

              <h1 className="mt-4 font-title text-[clamp(3rem,5.8vw,5.5rem)] uppercase leading-[0.81] ">
                Barcelone.

                <span className="block">
                  Tes soirées.
                </span>

                <span className="block text-gradient">
                  Ton expérience.
                </span>
              </h1>

              <p className="mt-5 max-w-lg font-body text-sm leading-7 text-white/48 sm:text-base">
                Découvre les meilleures expériences B4F,
                réserve simplement et profite de Barcelone
                sans prise de tête.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#0c0c0c] py-12 sm:py-16">
        <div className="page-shell">
          <Reveal>
            <div className="max-w-3xl">
              <span className="eyebrow">
                Nos expériences
              </span>

              <h2 className="mt-3 font-title text-3xl uppercase leading-[0.9] sm:text-5xl">
                Trois ambiances.

                <span className="block text-gradient">
                  À toi de choisir.
                </span>
              </h2>
            </div>
          </Reveal>

          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {experiences.map(
              (experience, index) => {
                const Icon =
                  experience.icon;

                return (
                  <Reveal
                    key={experience.key}
                    delay={index * 80}
                    direction="scale"
                  >
                    <Link
                      to={`/events?types=${experience.key}`}
                      className="group relative flex min-h-[460px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#111]"
                    >
                      <img
                        src={experience.image}
                        alt={t(
                          experience.title
                        )}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />

                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.04)_0%,rgba(0,0,0,.17)_40%,rgba(0,0,0,.94)_100%)]" />

                      <span className="pointer-events-none absolute -right-3 -top-8 font-title text-[135px] leading-none text-white/[0.045]">
                        {experience.number}
                      </span>

                      <div className="relative z-10 flex w-full flex-col justify-between p-6">
                        <div className="flex items-start justify-between gap-4">
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-white/15 bg-black/25 text-white backdrop-blur-xl">
                            <Icon
                              size={22}
                            />
                          </span>

                          <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 font-subtitle text-[9px] uppercase tracking-[0.14em] text-white/55 backdrop-blur-xl">
                            {experience.tag}
                          </span>
                        </div>

                        <div>
                          <span className="font-subtitle text-[10px] uppercase tracking-[0.2em] text-secondary">
                            Expérience{" "}
                            {experience.number}
                          </span>

                          <h3 className="mt-2 font-title text-3xl uppercase leading-[0.88] sm:text-4xl">
                            {t(
                              experience.title
                            )}
                          </h3>

                          <p className="mt-4 max-w-sm font-body text-sm leading-6 text-white/48">
                            {t(
                              experience.text
                            )}
                          </p>

                          <div className="mt-6 flex items-center gap-2 font-subtitle text-[10px] uppercase tracking-[0.15em] text-white">
                            Découvrir

                            <ArrowRight
                              size={15}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              }
            )}
          </div>
        </div>
      </section>

      <section className="page-shell py-10 sm:py-14">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              Comment ça marche
            </span>

            <h2 className="mt-3 font-title text-4xl uppercase leading-[0.88] sm:text-5xl">
              3 étapes.

              <span className="block text-gradient">
                Rien de plus.
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="relative mt-10">
          <div className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-white/[0.08] lg:block" />

          <div className="relative grid gap-4 lg:grid-cols-3">
            {steps.map(
              (step, index) => {
                const Icon =
                  step.icon;

                return (
                  <Reveal
                    key={step.number}
                    delay={index * 80}
                  >
                    <article className="relative h-full rounded-[24px] border border-white/[0.08] bg-[#101010] p-6">
                      <div className="flex items-center justify-between">
                        <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-secondary/30 bg-[#101010] text-secondary">
                          <Icon
                            size={21}
                          />
                        </span>

                        <span className="font-title text-4xl text-white/[0.07]">
                          {step.number}
                        </span>
                      </div>

                      <h3 className="mt-6 font-title text-2xl uppercase leading-[0.9]">
                        {step.title}
                      </h3>

                      <p className="mt-2 font-body text-sm leading-5 text-white/40">
                        {step.text}
                      </p>
                    </article>
                  </Reveal>
                );
              }
            )}
          </div>
        </div>
      </section>
    </>
  );
}