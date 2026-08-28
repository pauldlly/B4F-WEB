-- Statistiques publiques agrégées pour la page d'accueil.
-- Vérifie les noms de tables et adapte les filtres de suppression/validation à ton schéma.

create or replace function public.public_agency_stats()
returns table (
  tickets bigint,
  promoters bigint,
  events bigint,
  customers bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*) from public."Ticket")::bigint as tickets,
    (select count(*) from public."Promoter")::bigint as promoters,
    (select count(*) from public."Event")::bigint as events,
    (select count(*) from public."Client")::bigint as customers;
$$;

revoke all on function public.public_agency_stats() from public;
grant execute on function public.public_agency_stats() to anon, authenticated;
