import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgePercent,
  Coffee,
  Ship,
  TicketCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getPublicPartnerBenefits } from "../services/benefits";
import { Reveal } from "./Reveal";

function BenefitIcon({ category }: { category: string }) {
  if (category === "jetski") return <Ship size={23} />;
  if (category === "coffee_shop") return <Coffee size={23} />;
  return <BadgePercent size={23} />;
}

export function TicketBenefitsPreview() {
  const query = useQuery({
    queryKey: ["public-partner-benefits"],
    queryFn: getPublicPartnerBenefits,
    staleTime: 5 * 60_000,
  });

  if (query.isPending || query.error || !query.data?.length) return null;

  return (
    <section className="border-y border-white/[0.08] bg-[radial-gradient(circle_at_15%_10%,rgba(251,146,60,.13),transparent_34%),radial-gradient(circle_at_90%_70%,rgba(255,105,180,.11),transparent_34%),#0d0d0d] py-16 sm:py-24">
      <div className="page-shell">
        <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Plus qu’un billet</span>
            <h2 className="mt-4 max-w-4xl font-title text-4xl uppercase leading-[0.88] sm:text-6xl">
              Des avantages pendant votre séjour
            </h2>
          </div>

          <p className="max-w-xl font-body leading-7 text-white/[0.48]">
            Après votre achat, présentez un billet B4F valide chez le partenaire
            pour profiter de l’offre indiquée.
          </p>
        </Reveal>

        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.slice(0, 6).map((benefit, index) => (
            <Reveal key={benefit.id} delay={index * 80} direction="scale">
              <article className="group relative min-h-[270px] overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#151515] p-6 transition duration-300 hover:-translate-y-1 hover:border-secondary/[0.35]">
                {benefit.imageUrl && (
                  <>
                    <img
                      src={benefit.imageUrl}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-25 transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/85 to-[#111]/50" />
                  </>
                )}

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-[18px] border border-white/[0.1] bg-white/[0.06] text-secondary">
                      <BenefitIcon category={benefit.category} />
                    </span>
                    <span className="rounded-full bg-primary px-4 py-2 font-title text-sm uppercase text-ink">
                      {benefit.discountLabel}
                    </span>
                  </div>

                  <span className="mt-7 font-subtitle text-[10px] uppercase tracking-[0.18em] text-secondary">
                    {benefit.partnerName}
                  </span>
                  <h3 className="mt-2 font-title text-2xl uppercase leading-none">
                    {benefit.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 font-body text-sm leading-6 text-white/[0.48]">
                    {benefit.description}
                  </p>

                  <div className="mt-auto flex items-center gap-2 pt-6 font-subtitle text-xs uppercase tracking-[0.1em] text-white/[0.7]">
                    <TicketCheck size={17} className="text-primary" />
                    Billet payé à présenter
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-black/[0.24] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm leading-6 text-white/[0.42]">
            Les réductions, partenaires et périodes de validité sont pilotés
            depuis Supabase et peuvent évoluer.
          </p>
          <Link to="/events" className="secondary-button shrink-0">
            Choisir une soirée
            <ArrowRight size={17} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
