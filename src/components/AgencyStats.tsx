import { CalendarDays, PartyPopper, TicketCheck, Users } from "lucide-react";

import { useAgencyStats } from "../hooks/useAgencyStats";
import { Reveal } from "./Reveal";

function compact(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function AgencyStats() {
  const query = useAgencyStats();
  const stats = query.data;

  const items = [
    { icon: TicketCheck, value: stats?.tickets ?? 0, label: "billets vendus" },
    { icon: Users, value: stats?.promoters ?? 0, label: "promoteurs" },
    { icon: CalendarDays, value: stats?.events ?? 0, label: "événements" },
    { icon: PartyPopper, value: stats?.customers ?? 0, label: "Clubs partenaires" },
  ];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.08] bg-[#0c0c0c] py-10 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(251,146,60,.12),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(255,105,180,.10),transparent_30%)]" />
      <div className="page-shell relative">
       
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[26px] border border-white/10 bg-white/10 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.label} delay={index * 80} className="bg-[#111]">
              <article className="group min-h-[170px] p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <Icon size={22} className="text-secondary transition group-hover:scale-110" />
                  <span className="font-subtext text-[10px] tracking-[0.18em] text-white/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <strong className="mt-7 block font-title text-3xl text-white sm:text-5xl">
                  {query.isPending ? "—" : compact(item.value)}+
                </strong>
                <span className="mt-2 block font-body text-xs uppercase tracking-[0.12em] text-white/40 sm:text-sm">
                  {item.label}
                </span>
              </article>
            </Reveal>
          );
        })}
        </div>
      </div>
    </section>
  );
}
