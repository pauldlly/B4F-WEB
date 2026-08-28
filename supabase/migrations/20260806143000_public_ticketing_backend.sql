-- B4F public ticketing backend V10
-- New public-specific objects only. Existing mobile RPCs and tables are not replaced.

create extension if not exists pgcrypto;

create table if not exists public.public_customer_profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  client_id bigint unique references public."Client"(id) on delete set null,
  email text,
  full_name text,
  phone_code text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.public_customer_profiles
  add column if not exists client_id bigint references public."Client"(id) on delete set null;

create unique index if not exists public_customer_profiles_client_id_key
  on public.public_customer_profiles(client_id)
  where client_id is not null;

create table if not exists public.public_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  access_token_hash text not null,
  auth_user_id uuid references auth.users(id) on delete set null,
  client_id bigint references public."Client"(id) on delete set null,
  promoter_id uuid references public."Promoter"(id) on delete set null,
  promoter_reference text,
  affiliate_scope_type text check (affiliate_scope_type in ('general', 'event', 'pack')),
  affiliate_scope_id text,
  checkout_id text unique,
  checkout_reference text unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  customer_name text not null,
  customer_email text,
  customer_phone_code text,
  customer_phone text not null,
  subtotal numeric not null default 0 check (subtotal >= 0),
  service_fee numeric not null default 0 check (service_fee >= 0),
  total numeric not null default 0 check (total >= 0),
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists public_orders_auth_user_id_idx
  on public.public_orders(auth_user_id, created_at desc);
create index if not exists public_orders_promoter_id_idx
  on public.public_orders(promoter_id, created_at desc);
create index if not exists public_orders_status_idx
  on public.public_orders(status, created_at desc);

-- Performance indexes for public stock reservations and promoter visibility.
create index if not exists ticket_reservation_public_event_active_idx
  on public."TicketReservation"(event_id, item_type, item_id, expires_at)
  where status = 'active';

create index if not exists ticket_reservation_public_pack_active_idx
  on public."TicketReservation"(pack_id, item_type, item_id, expires_at)
  where status = 'active';

create index if not exists ticket_reservation_public_cart_idx
  on public."TicketReservation"(cart_id, status);

create index if not exists event_promoter_visibility_public_idx
  on public."EventPromoterVisibility"(event_id, promoter_id);

create table if not exists public.public_order_payments (
  order_id uuid not null references public.public_orders(id) on delete cascade,
  payment_id uuid not null references public."Payment"(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (order_id, payment_id)
);

create table if not exists public.public_order_tickets (
  order_id uuid not null references public.public_orders(id) on delete cascade,
  ticket_id uuid not null references public."Ticket"(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (order_id, ticket_id)
);

create table if not exists public.partner_benefits (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('jetski', 'coffee_shop', 'restaurant', 'activity', 'other')),
  partner_name text not null,
  title text not null,
  description text not null,
  discount_label text not null,
  redemption_instructions text not null default 'Présentez un billet B4F valide au partenaire.',
  image_url text,
  website_url text,
  address text,
  active boolean not null default true,
  valid_from timestamptz,
  valid_until timestamptz,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.public_support_requests (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  order_reference text,
  name text not null,
  email text,
  phone_code text,
  phone text,
  topic text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'closed')),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_support_requests_status_idx
  on public.public_support_requests(status, created_at desc);

create table if not exists public.public_sale_notification_dispatches (
  order_id uuid primary key references public.public_orders(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  recipient_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.public_customer_profiles enable row level security;
alter table public.public_orders enable row level security;
alter table public.public_order_payments enable row level security;
alter table public.public_order_tickets enable row level security;
alter table public.partner_benefits enable row level security;
alter table public.public_support_requests enable row level security;
alter table public.public_sale_notification_dispatches enable row level security;

-- The public website may read only currently active benefits.
drop policy if exists "Public can read active partner benefits" on public.partner_benefits;
create policy "Public can read active partner benefits"
  on public.partner_benefits
  for select
  to anon, authenticated
  using (
    active = true
    and (valid_from is null or valid_from <= now())
    and (valid_until is null or valid_until >= now())
  );

-- Authenticated customers may read and update only their own public profile.
drop policy if exists "Customers read own public profile" on public.public_customer_profiles;
create policy "Customers read own public profile"
  on public.public_customer_profiles
  for select
  to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists "Customers update own public profile" on public.public_customer_profiles;
create policy "Customers update own public profile"
  on public.public_customer_profiles
  for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

grant select on public.partner_benefits to anon, authenticated;
grant select, update on public.public_customer_profiles to authenticated;

create or replace function public.public_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists public_customer_profiles_touch_updated_at on public.public_customer_profiles;
create trigger public_customer_profiles_touch_updated_at
before update on public.public_customer_profiles
for each row execute function public.public_touch_updated_at();

drop trigger if exists public_orders_touch_updated_at on public.public_orders;
create trigger public_orders_touch_updated_at
before update on public.public_orders
for each row execute function public.public_touch_updated_at();

drop trigger if exists partner_benefits_touch_updated_at on public.partner_benefits;
create trigger partner_benefits_touch_updated_at
before update on public.partner_benefits
for each row execute function public.public_touch_updated_at();

drop trigger if exists public_support_requests_touch_updated_at on public.public_support_requests;
create trigger public_support_requests_touch_updated_at
before update on public.public_support_requests
for each row execute function public.public_touch_updated_at();

create or replace function public.handle_new_public_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.public_customer_profiles (
    auth_user_id,
    email,
    full_name
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (auth_user_id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.public_customer_profiles.full_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_public_customer on auth.users;
create trigger on_auth_user_created_public_customer
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_public_customer();

-- Backfill accounts that existed before this migration.
insert into public.public_customer_profiles (
  auth_user_id,
  email,
  full_name
)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name')
from auth.users u
on conflict (auth_user_id) do update
set
  email = excluded.email,
  full_name = coalesce(excluded.full_name, public.public_customer_profiles.full_name),
  updated_at = now();

create or replace function public.public_slugify(value text)
returns text
language sql
immutable
parallel safe
as $$
  select trim(both '-' from regexp_replace(
    lower(
      translate(
        coalesce(value, ''),
        'àáâäãåçèéêëìíîïñòóôöõùúûüýÿÀÁÂÄÃÅÇÈÉÊËÌÍÎÏÑÒÓÔÖÕÙÚÛÜÝ',
        'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'
      )
    ),
    '[^a-z0-9]+',
    '-',
    'g'
  ));
$$;

create or replace function public.public_resolve_promoter_reference(p_reference text)
returns table (
  id uuid,
  firstname text,
  name text,
  phone text,
  phone_code text,
  manager boolean,
  manager_id uuid,
  display_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reference text := trim(coalesce(p_reference, ''));
  v_count integer;
begin
  if v_reference = '' then
    return;
  end if;

  if v_reference ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return query
    select
      p.id,
      p.firstname,
      p.name,
      p.phone,
      p."phoneCode",
      coalesce(p.manager, false),
      p.manager_id,
      trim(concat_ws(' ', p.firstname, p.name))
    from public."Promoter" p
    where p.id = v_reference::uuid
      and p.status = 'active'
    limit 1;

    return;
  end if;

  select count(*)
  into v_count
  from public."Promoter" p
  where p.status = 'active'
    and public.public_slugify(concat_ws('-', p.firstname, p.name)) = public.public_slugify(v_reference);

  if v_count > 1 then
    raise exception 'PROMOTER_REFERENCE_AMBIGUOUS';
  end if;

  return query
  select
    p.id,
    p.firstname,
    p.name,
    p.phone,
    p."phoneCode",
    coalesce(p.manager, false),
    p.manager_id,
    trim(concat_ws(' ', p.firstname, p.name))
  from public."Promoter" p
  where p.status = 'active'
    and public.public_slugify(concat_ws('-', p.firstname, p.name)) = public.public_slugify(v_reference)
  limit 1;
end;
$$;

revoke all on function public.public_resolve_promoter_reference(text) from public, anon, authenticated;
grant execute on function public.public_resolve_promoter_reference(text) to service_role;

create or replace function public.public_cancel_checkout_reservations(p_cart_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public."TicketReservation"
  set status = 'cancelled'
  where cart_id = p_cart_id
    and status = 'active';
$$;

revoke all on function public.public_cancel_checkout_reservations(text) from public, anon, authenticated;
grant execute on function public.public_cancel_checkout_reservations(text) to service_role;

create or replace function public.public_reserve_ticket_checkout(
  p_cart_id text,
  p_promoter_id uuid,
  p_groups jsonb,
  p_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group jsonb;
  v_selected_event jsonb;
  v_extra jsonb;
  v_kind text;
  v_gender text;
  v_quantity integer;
  v_event_id bigint;
  v_pack_id uuid;
  v_pack_event_id uuid;
  v_first_event_id bigint;
  v_first_pack_event_id uuid;
  v_event public."Event"%rowtype;
  v_pack public."Pack"%rowtype;
  v_capacity integer;
  v_sold integer;
  v_reserved integer;
  v_item_id text;
  v_now_local timestamp := timezone('Europe/Madrid', now());
begin
  if trim(coalesce(p_cart_id, '')) = '' then
    raise exception 'CART_ID_REQUIRED';
  end if;

  if jsonb_typeof(p_groups) <> 'array' or jsonb_array_length(p_groups) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  update public."TicketReservation"
  set status = 'cancelled'
  where cart_id = p_cart_id
    and status = 'active';

  for v_group in select value from jsonb_array_elements(p_groups)
  loop
    v_kind := v_group ->> 'kind';
    v_gender := v_group ->> 'gender';
    v_quantity := greatest(0, coalesce((v_group ->> 'quantity')::integer, 0));

    if v_gender not in ('man', 'woman') or v_quantity <= 0 then
      raise exception 'INVALID_GROUP_QUANTITY';
    end if;

    if jsonb_typeof(v_group -> 'selected_events') <> 'array'
       or jsonb_array_length(v_group -> 'selected_events') = 0 then
      raise exception 'NO_SELECTED_EVENT';
    end if;

    v_item_id := 'ticket:' || v_gender;

    if v_kind = 'pack' then
      v_pack_id := (v_group ->> 'source_id')::uuid;

      select * into v_pack
      from public."Pack"
      where id = v_pack_id
      for update;

      if not found or v_pack.status <> 'active' or coalesce(v_pack.soldout, false) then
        raise exception 'PACK_UNAVAILABLE';
      end if;

      if v_gender = 'man' then
        v_capacity := v_pack.men_capacity;
        v_sold := coalesce(v_pack.capacity_men_init, 0);
      else
        v_capacity := v_pack.women_capacity;
        v_sold := coalesce(v_pack.capacity_women_init, 0);
      end if;

      select coalesce(sum(qty), 0)
      into v_reserved
      from public."TicketReservation"
      where pack_id = v_pack_id
        and item_type = 'ticket'
        and item_id = 'pack:' || v_gender
        and status = 'active'
        and expires_at > now();

      if v_capacity is not null and v_sold + v_reserved + v_quantity > v_capacity then
        raise exception 'PACK_CAPACITY_EXCEEDED';
      end if;

      select
        (value ->> 'event_id')::bigint,
        nullif(value ->> 'pack_event_id', '')::uuid
      into v_first_event_id, v_first_pack_event_id
      from jsonb_array_elements(v_group -> 'selected_events')
      limit 1;

      insert into public."TicketReservation" (
        expires_at,
        event_id,
        promoter_id,
        cart_id,
        item_id,
        item_type,
        qty,
        status,
        pack_id,
        pack_event_id
      ) values (
        p_expires_at,
        v_first_event_id,
        p_promoter_id,
        p_cart_id,
        'pack:' || v_gender,
        'ticket',
        v_quantity,
        'active',
        v_pack_id,
        v_first_pack_event_id
      );
    elsif v_kind <> 'event' then
      raise exception 'INVALID_GROUP_KIND';
    end if;

    for v_selected_event in
      select value from jsonb_array_elements(v_group -> 'selected_events')
    loop
      v_event_id := (v_selected_event ->> 'event_id')::bigint;
      v_pack_event_id := nullif(v_selected_event ->> 'pack_event_id', '')::uuid;

      select * into v_event
      from public."Event"
      where id = v_event_id
      for update;

      if not found
         or v_event.status <> 'active'
         or coalesce(v_event.soldout, false)
         or (
           v_event.event_date is not null
           and (
             case
               when v_event.end_time is null then
                 v_event.event_date + coalesce(v_event.start_time, time '23:59:59')
               when v_event.end_time <= coalesce(v_event.start_time, time '00:00') then
                 (v_event.event_date + 1) + v_event.end_time
               else
                 v_event.event_date + v_event.end_time
             end
           ) <= v_now_local
         ) then
        raise exception 'EVENT_UNAVAILABLE_%', v_event_id;
      end if;

      if v_gender = 'man' then
        v_capacity := v_event.men_capacity;
        v_sold := coalesce(v_event.capacity_men_init, 0);
      else
        v_capacity := v_event.women_capacity;
        v_sold := coalesce(v_event.capacity_women_init, 0);
      end if;

      select coalesce(sum(qty), 0)
      into v_reserved
      from public."TicketReservation"
      where event_id = v_event_id
        and item_type = 'ticket'
        and item_id = v_item_id
        and status = 'active'
        and expires_at > now();

      if v_capacity is not null and v_sold + v_reserved + v_quantity > v_capacity then
        raise exception 'EVENT_CAPACITY_EXCEEDED_%', v_event_id;
      end if;

      insert into public."TicketReservation" (
        expires_at,
        event_id,
        promoter_id,
        cart_id,
        item_id,
        item_type,
        qty,
        status,
        pack_id,
        pack_event_id
      ) values (
        p_expires_at,
        v_event_id,
        p_promoter_id,
        p_cart_id,
        v_item_id,
        'ticket',
        v_quantity,
        'active',
        case when v_kind = 'pack' then v_pack_id else null end,
        v_pack_event_id
      );
    end loop;

    if jsonb_typeof(v_group -> 'extras') = 'array' then
      for v_extra in select value from jsonb_array_elements(v_group -> 'extras')
      loop
        if coalesce((v_extra ->> 'quantity')::integer, 0) <= 0 then
          continue;
        end if;

        insert into public."TicketReservation" (
          expires_at,
          event_id,
          promoter_id,
          cart_id,
          item_id,
          item_type,
          qty,
          status,
          pack_id,
          pack_event_id
        ) values (
          p_expires_at,
          (v_extra ->> 'event_id')::bigint,
          p_promoter_id,
          p_cart_id,
          v_extra ->> 'id',
          v_extra ->> 'kind',
          (v_extra ->> 'quantity')::integer,
          'active',
          case when v_kind = 'pack' then v_pack_id else null end,
          nullif(v_extra ->> 'pack_event_id', '')::uuid
        );
      end loop;
    end if;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'cart_id', p_cart_id,
    'expires_at', p_expires_at
  );
end;
$$;

revoke all on function public.public_reserve_ticket_checkout(text, uuid, jsonb, timestamptz) from public, anon, authenticated;
grant execute on function public.public_reserve_ticket_checkout(text, uuid, jsonb, timestamptz) to service_role;

create or replace function public.public_finalize_sumup_checkout(
  p_checkout_id text,
  p_provider_checkout jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_draft public."SumupTicketCheckoutDraft"%rowtype;
  v_order public.public_orders%rowtype;
  v_payload jsonb;
  v_order_payload jsonb;
  v_group jsonb;
  v_selected_event jsonb;
  v_extra jsonb;
  v_client_qr_id uuid;
  v_ticket_qr_id uuid;
  v_client_id bigint;
  v_booking_id uuid;
  v_booking_pack_id uuid;
  v_payment_id uuid;
  v_first_payment_id uuid;
  v_ticket_id uuid;
  v_event_id bigint;
  v_pack_id uuid;
  v_pack_event_id uuid;
  v_group_kind text;
  v_gender text;
  v_quantity integer;
  v_event_count integer;
  v_loop integer;
  v_group_total numeric;
  v_group_base_total numeric;
  v_group_options_total numeric;
  v_group_tables_total numeric;
  v_group_promoter_commission numeric;
  v_group_manager_commission numeric;
  v_group_options_promoter_commission numeric;
  v_group_tables_promoter_commission numeric;
  v_group_options_manager_commission numeric;
  v_group_tables_manager_commission numeric;
  v_event_base_total numeric;
  v_event_options_total numeric;
  v_event_tables_total numeric;
  v_event_options_promoter_commission numeric;
  v_event_tables_promoter_commission numeric;
  v_event_options_manager_commission numeric;
  v_event_tables_manager_commission numeric;
  v_event_promoter_commission numeric;
  v_event_manager_commission numeric;
  v_transaction_fee_for_payment numeric;
  v_application_fee_for_payment numeric;
  v_transaction_fee_remaining numeric;
  v_application_fee_remaining numeric;
  v_payment_ids jsonb := '[]'::jsonb;
  v_ticket_ids jsonb := '[]'::jsonb;
  v_ticket_snapshots jsonb := '[]'::jsonb;
  v_promoter_contact jsonb := 'null'::jsonb;
  v_sale_result jsonb;
  v_status text;
  v_provider_amount numeric;
  v_provider_payment_id text;
  v_provider_reference text;
  v_ticket_qr_code text;
  v_customer_phone text;
  v_customer_phone_code text;
  v_customer_name text;
  v_customer_email text;
  v_promoter_id uuid;
  v_manager_id uuid;
  v_seller_is_manager boolean;
  v_notification_lines jsonb;
  v_event_row public."Event"%rowtype;
begin
  select * into v_draft
  from public."SumupTicketCheckoutDraft"
  where checkout_id = p_checkout_id
  for update;

  if not found then
    raise exception 'CHECKOUT_DRAFT_NOT_FOUND';
  end if;

  if v_draft.sale_created then
    return coalesce(v_draft.sale_result, jsonb_build_object('ok', true, 'already_created', true));
  end if;

  v_status := upper(coalesce(p_provider_checkout ->> 'status', ''));
  v_provider_amount := coalesce((p_provider_checkout ->> 'amount')::numeric, 0);

  if v_status <> 'PAID' then
    raise exception 'CHECKOUT_NOT_PAID';
  end if;

  if abs(v_provider_amount - v_draft.charged_amount) > 0.01 then
    raise exception 'CHECKOUT_AMOUNT_MISMATCH';
  end if;

  v_payload := v_draft.payload;
  v_order_payload := v_payload -> 'order';
  v_promoter_id := nullif(v_order_payload ->> 'promoter_id', '')::uuid;
  v_manager_id := nullif(v_order_payload ->> 'manager_id', '')::uuid;
  v_seller_is_manager := coalesce((v_order_payload ->> 'seller_is_manager')::boolean, false);

  -- A direct B4F sale never creates a promoter or manager commission.
  if v_promoter_id is null then
    v_manager_id := null;
    v_seller_is_manager := false;
  end if;

  v_customer_name := v_order_payload ->> 'customer_name';
  v_customer_email := nullif(v_order_payload ->> 'customer_email', '');
  v_customer_phone_code := nullif(v_order_payload ->> 'customer_phone_code', '');
  v_customer_phone := v_order_payload ->> 'customer_phone';
  v_notification_lines := coalesce(v_payload -> 'notification_lines', '[]'::jsonb);

  select * into v_order
  from public.public_orders
  where id = (v_order_payload ->> 'order_id')::uuid
  for update;

  if not found then
    raise exception 'PUBLIC_ORDER_NOT_FOUND';
  end if;

  -- A connected customer reuses the same Client row across purchases.
  if v_order.auth_user_id is not null then
    select profile.client_id
    into v_client_id
    from public.public_customer_profiles profile
    where profile.auth_user_id = v_order.auth_user_id
    for update;
  end if;

  if v_client_id is null then
    insert into public.qr_pass (qr_code)
    values ('B4F-CLIENT-' || replace(gen_random_uuid()::text, '-', ''))
    returning id into v_client_qr_id;

    insert into public."Client" (
      name,
      phone,
      commentary,
      qr_pass_id,
      "phoneCode"
    ) values (
      v_customer_name,
      array[v_customer_phone],
      'Client web B4F',
      v_client_qr_id,
      v_customer_phone_code
    )
    returning id into v_client_id;

    if v_order.auth_user_id is not null then
      insert into public.public_customer_profiles (
        auth_user_id,
        client_id,
        email,
        full_name,
        phone_code,
        phone
      ) values (
        v_order.auth_user_id,
        v_client_id,
        v_customer_email,
        v_customer_name,
        v_customer_phone_code,
        v_customer_phone
      )
      on conflict (auth_user_id) do update
      set
        client_id = excluded.client_id,
        email = coalesce(excluded.email, public.public_customer_profiles.email),
        full_name = excluded.full_name,
        phone_code = excluded.phone_code,
        phone = excluded.phone,
        updated_at = now();
    end if;
  else
    update public."Client"
    set
      name = v_customer_name,
      phone = array[v_customer_phone],
      "phoneCode" = v_customer_phone_code,
      commentary = 'Client web B4F'
    where id = v_client_id;

    update public.public_customer_profiles
    set
      email = coalesce(v_customer_email, email),
      full_name = v_customer_name,
      phone_code = v_customer_phone_code,
      phone = v_customer_phone,
      updated_at = now()
    where auth_user_id = v_order.auth_user_id;
  end if;

  v_transaction_fee_remaining := coalesce((v_order_payload ->> 'transaction_fee')::numeric, 0);
  v_application_fee_remaining := coalesce((v_order_payload ->> 'application_fee')::numeric, 0);
  v_provider_payment_id := coalesce(
    p_provider_checkout #>> '{transactions,0,transaction_code}',
    p_provider_checkout #>> '{transactions,0,id}',
    p_provider_checkout ->> 'id'
  );
  v_provider_reference := coalesce(p_provider_checkout ->> 'checkout_reference', v_draft.checkout_reference);

  for v_group in select value from jsonb_array_elements(v_payload -> 'groups')
  loop
    v_group_kind := v_group ->> 'kind';
    v_gender := v_group ->> 'gender';
    v_quantity := (v_group ->> 'quantity')::integer;
    v_group_total := coalesce((v_group ->> 'total')::numeric, 0);
    v_group_base_total := coalesce((v_group ->> 'base_total')::numeric, 0);
    v_group_options_total := coalesce((v_group ->> 'options_total')::numeric, 0);
    v_group_tables_total := coalesce((v_group ->> 'tables_total')::numeric, 0);
    v_group_promoter_commission := coalesce((v_group ->> 'promoter_commission_total')::numeric, 0);
    v_group_manager_commission := coalesce((v_group ->> 'manager_commission_total')::numeric, 0);
    v_group_options_promoter_commission := coalesce((v_group ->> 'options_promoter_commission_total')::numeric, 0);
    v_group_tables_promoter_commission := coalesce((v_group ->> 'tables_promoter_commission_total')::numeric, 0);
    v_group_options_manager_commission := coalesce((v_group ->> 'options_manager_commission_total')::numeric, 0);
    v_group_tables_manager_commission := coalesce((v_group ->> 'tables_manager_commission_total')::numeric, 0);

    -- Never trust commission values blindly, even though the payload was built server-side.
    if v_promoter_id is null then
      v_group_promoter_commission := 0;
      v_group_manager_commission := 0;
      v_group_options_promoter_commission := 0;
      v_group_tables_promoter_commission := 0;
      v_group_options_manager_commission := 0;
      v_group_tables_manager_commission := 0;
    elsif v_seller_is_manager then
      v_group_promoter_commission := 0;
      v_group_options_promoter_commission := 0;
      v_group_tables_promoter_commission := 0;
    else
      v_group_manager_commission := 0;
      v_group_options_manager_commission := 0;
      v_group_tables_manager_commission := 0;
    end if;

    v_event_count := greatest(1, jsonb_array_length(v_group -> 'selected_events'));

    if v_group_kind = 'pack' then
      v_pack_id := (v_group ->> 'source_id')::uuid;

      insert into public."BookingPack" (
        pack_id,
        client_id,
        promoter_id,
        gender,
        status,
        base_price,
        total_options_price,
        total_tables_price,
        total_price,
        pack_commission,
        options_commission,
        tables_commission,
        total_commission,
        pack_manager_commission,
        options_manager_commission,
        tables_manager_commission,
        total_manager_commission,
        note
      ) values (
        v_pack_id,
        v_client_id,
        v_promoter_id,
        v_gender,
        'paid',
        v_group_base_total,
        v_group_options_total,
        v_group_tables_total,
        v_group_total,
        greatest(v_group_promoter_commission - v_group_options_promoter_commission - v_group_tables_promoter_commission, 0),
        v_group_options_promoter_commission,
        v_group_tables_promoter_commission,
        v_group_promoter_commission,
        greatest(v_group_manager_commission - v_group_options_manager_commission - v_group_tables_manager_commission, 0),
        v_group_options_manager_commission,
        v_group_tables_manager_commission,
        v_group_manager_commission,
        'Vente web ' || v_order.reference
      ) returning id into v_booking_pack_id;

      for v_selected_event in select value from jsonb_array_elements(v_group -> 'selected_events')
      loop
        v_event_id := (v_selected_event ->> 'event_id')::bigint;
        v_pack_event_id := nullif(v_selected_event ->> 'pack_event_id', '')::uuid;
        v_event_base_total := coalesce((v_selected_event ->> 'base_total')::numeric, v_group_base_total / v_event_count);

        select
          coalesce(sum((x.value ->> 'total_price')::numeric), 0),
          coalesce(sum((x.value ->> 'promoter_commission_total')::numeric), 0),
          coalesce(sum((x.value ->> 'manager_commission_total')::numeric), 0)
        into v_event_options_total, v_event_options_promoter_commission, v_event_options_manager_commission
        from jsonb_array_elements(coalesce(v_group -> 'extras', '[]'::jsonb)) x
        where x.value ->> 'kind' = 'option'
          and (x.value ->> 'event_id')::bigint = v_event_id;

        select
          coalesce(sum((x.value ->> 'total_price')::numeric), 0),
          coalesce(sum((x.value ->> 'promoter_commission_total')::numeric), 0),
          coalesce(sum((x.value ->> 'manager_commission_total')::numeric), 0)
        into v_event_tables_total, v_event_tables_promoter_commission, v_event_tables_manager_commission
        from jsonb_array_elements(coalesce(v_group -> 'extras', '[]'::jsonb)) x
        where x.value ->> 'kind' = 'table'
          and (x.value ->> 'event_id')::bigint = v_event_id;

        v_event_promoter_commission := greatest(
          (v_group_promoter_commission - v_group_options_promoter_commission - v_group_tables_promoter_commission) / v_event_count,
          0
        );
        v_event_manager_commission := greatest(
          (v_group_manager_commission - v_group_options_manager_commission - v_group_tables_manager_commission) / v_event_count,
          0
        );

        insert into public."Booking" (
          client_id,
          event_id,
          promoter_id,
          gender,
          base_price,
          total_options_price,
          total_price,
          event_commission,
          options_commission,
          total_commission,
          note,
          total_tables_price,
          event_manager_commission,
          options_manager_commission,
          tables_manager_commission,
          total_manager_commission,
          pack_booking_id,
          pack_event_id,
          manager_id
        ) values (
          v_client_id,
          v_event_id,
          v_promoter_id,
          v_gender,
          v_event_base_total,
          v_event_options_total,
          v_event_base_total + v_event_options_total + v_event_tables_total,
          v_event_promoter_commission,
          v_event_options_promoter_commission,
          v_event_promoter_commission + v_event_options_promoter_commission + v_event_tables_promoter_commission,
          'Vente web pack ' || v_order.reference,
          v_event_tables_total,
          v_event_manager_commission,
          v_event_options_manager_commission,
          v_event_tables_manager_commission,
          v_event_manager_commission + v_event_options_manager_commission + v_event_tables_manager_commission,
          v_booking_pack_id,
          v_pack_event_id,
          v_manager_id
        ) returning id into v_booking_id;

        for v_extra in
          select value from jsonb_array_elements(coalesce(v_group -> 'extras', '[]'::jsonb))
          where (value ->> 'event_id')::bigint = v_event_id
        loop
          if v_extra ->> 'kind' = 'option' then
            insert into public."BookingOption" (
              booking_id,
              option_id,
              quantity,
              unit_price,
              unit_commission,
              total_price,
              total_commission,
              unit_manager_commission,
              total_manager_commission
            ) values (
              v_booking_id,
              (v_extra ->> 'id')::bigint,
              (v_extra ->> 'quantity')::integer,
              (v_extra ->> 'unit_price')::numeric,
              coalesce((v_extra ->> 'promoter_commission_unit')::numeric, 0),
              (v_extra ->> 'total_price')::numeric,
              coalesce((v_extra ->> 'promoter_commission_total')::numeric, 0),
              coalesce((v_extra ->> 'manager_commission_unit')::numeric, 0),
              coalesce((v_extra ->> 'manager_commission_total')::numeric, 0)
            );
          elsif v_extra ->> 'kind' = 'table' then
            insert into public."BookingTable" (
              booking_id,
              table_id,
              quantity,
              unit_price,
              unit_commission,
              unit_manager_commission,
              deposit_percentage,
              total_price,
              total_commission,
              total_manager_commission,
              status
            ) values (
              v_booking_id,
              (v_extra ->> 'id')::bigint,
              (v_extra ->> 'quantity')::integer,
              (v_extra ->> 'full_price')::numeric,
              coalesce((v_extra ->> 'promoter_commission_unit')::numeric, 0),
              coalesce((v_extra ->> 'manager_commission_unit')::numeric, 0),
              coalesce((v_extra ->> 'deposit_percentage')::numeric, 0),
              (v_extra ->> 'total_price')::numeric,
              coalesce((v_extra ->> 'promoter_commission_total')::numeric, 0),
              coalesce((v_extra ->> 'manager_commission_total')::numeric, 0),
              'paid'
            );
          end if;
        end loop;

        select * into v_event_row from public."Event" where id = v_event_id;

        for v_loop in 1..v_quantity loop
          v_ticket_qr_code := 'B4F-' || replace(gen_random_uuid()::text, '-', '');
          insert into public.qr_pass (qr_code)
          values (v_ticket_qr_code)
          returning id into v_ticket_qr_id;

          insert into public."Ticket" (
            booking_id,
            event_id,
            qr_pass_id
          ) values (
            v_booking_id,
            v_event_id,
            v_ticket_qr_id
          ) returning id into v_ticket_id;

          insert into public.public_order_tickets(order_id, ticket_id)
          values (v_order.id, v_ticket_id);

          v_ticket_ids := v_ticket_ids || jsonb_build_array(v_ticket_id);
          v_ticket_snapshots := v_ticket_snapshots || jsonb_build_array(
            jsonb_build_object(
              'id', v_ticket_id,
              'orderId', v_order.id,
              'source', 'pack',
              'eventId', v_event_id,
              'eventName', coalesce(v_selected_event ->> 'name', v_event_row.name),
              'eventDate', coalesce(v_selected_event ->> 'event_date', v_event_row.event_date::text),
              'startTime', coalesce(v_selected_event ->> 'start_time', v_event_row.start_time::text),
              'location', coalesce(v_selected_event ->> 'location', v_event_row.location),
              'holderName', v_customer_name,
              'gender', v_gender,
              'optionNames', coalesce((
                select jsonb_agg(x.value ->> 'name' order by x.value ->> 'name')
                from jsonb_array_elements(coalesce(v_group -> 'extras', '[]'::jsonb)) x
                where x.value ->> 'kind' = 'option'
                  and (x.value ->> 'event_id')::bigint = v_event_id
              ), '[]'::jsonb),
              'tableNames', coalesce((
                select jsonb_agg(x.value ->> 'name' order by x.value ->> 'name')
                from jsonb_array_elements(coalesce(v_group -> 'extras', '[]'::jsonb)) x
                where x.value ->> 'kind' = 'table'
                  and (x.value ->> 'event_id')::bigint = v_event_id
              ), '[]'::jsonb),
              'qrCode', v_ticket_qr_code,
              'scanned', false
            )
          );
        end loop;

        if v_gender = 'man' then
          update public."Event"
          set capacity_men_init = coalesce(capacity_men_init, 0) + v_quantity
          where id = v_event_id;
        else
          update public."Event"
          set capacity_women_init = coalesce(capacity_women_init, 0) + v_quantity
          where id = v_event_id;
        end if;
      end loop;

      if v_gender = 'man' then
        update public."Pack"
        set capacity_men_init = coalesce(capacity_men_init, 0) + v_quantity
        where id = v_pack_id;
      else
        update public."Pack"
        set capacity_women_init = coalesce(capacity_women_init, 0) + v_quantity
        where id = v_pack_id;
      end if;

      v_booking_id := null;
    else
      v_selected_event := (v_group -> 'selected_events') -> 0;
      v_event_id := (v_selected_event ->> 'event_id')::bigint;
      v_event_base_total := v_group_base_total;

      insert into public."Booking" (
        client_id,
        event_id,
        promoter_id,
        gender,
        base_price,
        total_options_price,
        total_price,
        event_commission,
        options_commission,
        total_commission,
        note,
        total_tables_price,
        event_manager_commission,
        options_manager_commission,
        tables_manager_commission,
        total_manager_commission,
        manager_id
      ) values (
        v_client_id,
        v_event_id,
        v_promoter_id,
        v_gender,
        v_group_base_total,
        v_group_options_total,
        v_group_total,
        greatest(v_group_promoter_commission - v_group_options_promoter_commission - v_group_tables_promoter_commission, 0),
        v_group_options_promoter_commission,
        v_group_promoter_commission,
        'Vente web ' || v_order.reference,
        v_group_tables_total,
        greatest(v_group_manager_commission - v_group_options_manager_commission - v_group_tables_manager_commission, 0),
        v_group_options_manager_commission,
        v_group_tables_manager_commission,
        v_group_manager_commission,
        v_manager_id
      ) returning id into v_booking_id;

      for v_extra in select value from jsonb_array_elements(coalesce(v_group -> 'extras', '[]'::jsonb))
      loop
        if v_extra ->> 'kind' = 'option' then
          insert into public."BookingOption" (
            booking_id,
            option_id,
            quantity,
            unit_price,
            unit_commission,
            total_price,
            total_commission,
            unit_manager_commission,
            total_manager_commission
          ) values (
            v_booking_id,
            (v_extra ->> 'id')::bigint,
            (v_extra ->> 'quantity')::integer,
            (v_extra ->> 'unit_price')::numeric,
            coalesce((v_extra ->> 'promoter_commission_unit')::numeric, 0),
            (v_extra ->> 'total_price')::numeric,
            coalesce((v_extra ->> 'promoter_commission_total')::numeric, 0),
            coalesce((v_extra ->> 'manager_commission_unit')::numeric, 0),
            coalesce((v_extra ->> 'manager_commission_total')::numeric, 0)
          );
        elsif v_extra ->> 'kind' = 'table' then
          insert into public."BookingTable" (
            booking_id,
            table_id,
            quantity,
            unit_price,
            unit_commission,
            unit_manager_commission,
            deposit_percentage,
            total_price,
            total_commission,
            total_manager_commission,
            status
          ) values (
            v_booking_id,
            (v_extra ->> 'id')::bigint,
            (v_extra ->> 'quantity')::integer,
            (v_extra ->> 'full_price')::numeric,
            coalesce((v_extra ->> 'promoter_commission_unit')::numeric, 0),
            coalesce((v_extra ->> 'manager_commission_unit')::numeric, 0),
            coalesce((v_extra ->> 'deposit_percentage')::numeric, 0),
            (v_extra ->> 'total_price')::numeric,
            coalesce((v_extra ->> 'promoter_commission_total')::numeric, 0),
            coalesce((v_extra ->> 'manager_commission_total')::numeric, 0),
            'paid'
          );
        end if;
      end loop;

      select * into v_event_row from public."Event" where id = v_event_id;

      for v_loop in 1..v_quantity loop
        v_ticket_qr_code := 'B4F-' || replace(gen_random_uuid()::text, '-', '');
        insert into public.qr_pass (qr_code)
        values (v_ticket_qr_code)
        returning id into v_ticket_qr_id;

        insert into public."Ticket" (
          booking_id,
          event_id,
          qr_pass_id
        ) values (
          v_booking_id,
          v_event_id,
          v_ticket_qr_id
        ) returning id into v_ticket_id;

        insert into public.public_order_tickets(order_id, ticket_id)
        values (v_order.id, v_ticket_id);

        v_ticket_ids := v_ticket_ids || jsonb_build_array(v_ticket_id);
        v_ticket_snapshots := v_ticket_snapshots || jsonb_build_array(
          jsonb_build_object(
            'id', v_ticket_id,
            'orderId', v_order.id,
            'source', 'event',
            'eventId', v_event_id,
            'eventName', coalesce(v_selected_event ->> 'name', v_event_row.name),
            'eventDate', coalesce(v_selected_event ->> 'event_date', v_event_row.event_date::text),
            'startTime', coalesce(v_selected_event ->> 'start_time', v_event_row.start_time::text),
            'location', coalesce(v_selected_event ->> 'location', v_event_row.location),
            'holderName', v_customer_name,
            'gender', v_gender,
            'optionNames', coalesce((
              select jsonb_agg(x.value ->> 'name' order by x.value ->> 'name')
              from jsonb_array_elements(coalesce(v_group -> 'extras', '[]'::jsonb)) x
              where x.value ->> 'kind' = 'option'
                and (x.value ->> 'event_id')::bigint = v_event_id
            ), '[]'::jsonb),
            'tableNames', coalesce((
              select jsonb_agg(x.value ->> 'name' order by x.value ->> 'name')
              from jsonb_array_elements(coalesce(v_group -> 'extras', '[]'::jsonb)) x
              where x.value ->> 'kind' = 'table'
                and (x.value ->> 'event_id')::bigint = v_event_id
            ), '[]'::jsonb),
            'qrCode', v_ticket_qr_code,
            'scanned', false
          )
        );
      end loop;

      if v_gender = 'man' then
        update public."Event"
        set capacity_men_init = coalesce(capacity_men_init, 0) + v_quantity
        where id = v_event_id;
      else
        update public."Event"
        set capacity_women_init = coalesce(capacity_women_init, 0) + v_quantity
        where id = v_event_id;
      end if;

      v_booking_pack_id := null;
    end if;

    v_transaction_fee_for_payment := v_transaction_fee_remaining;
    v_application_fee_for_payment := v_application_fee_remaining;
    v_transaction_fee_remaining := 0;
    v_application_fee_remaining := 0;

    insert into public."Payment" (
      booking_id,
      booking_pack_id,
      client_id,
      promoter_id,
      manager_id,
      status,
      tip_amount,
      transaction_fee_amount,
      app_fee_amount,
      promoter_commission_amount,
      manager_commission_amount,
      total_amount,
      provider_payment_id,
      paid_at,
      cash_amount,
      stripe_amount,
      payment_provider,
      provider_checkout_id,
      provider_reference,
      provider_status,
      paid_amount,
      provider_paid_amount,
      raw_provider_response
    ) values (
      v_booking_id,
      v_booking_pack_id,
      v_client_id,
      v_promoter_id,
      v_manager_id,
      'completed',
      0,
      v_transaction_fee_for_payment,
      v_application_fee_for_payment,
      v_group_promoter_commission,
      v_group_manager_commission,
      v_group_total,
      v_provider_payment_id,
      now(),
      0,
      v_group_total,
      'sumup',
      p_checkout_id,
      v_provider_reference,
      'PAID',
      v_group_total,
      v_group_total + v_transaction_fee_for_payment + v_application_fee_for_payment,
      p_provider_checkout
    ) returning id into v_payment_id;

    if v_first_payment_id is null then
      v_first_payment_id := v_payment_id;
    end if;

    insert into public.public_order_payments(order_id, payment_id)
    values (v_order.id, v_payment_id);

    v_payment_ids := v_payment_ids || jsonb_build_array(v_payment_id);
  end loop;

  if v_promoter_id is not null then
    select jsonb_build_object(
      'reference', v_order.promoter_reference,
      'displayName', trim(concat_ws(' ', p.firstname, p.name)),
      'firstname', p.firstname,
      'phone', p.phone,
      'phoneCode', p."phoneCode",
      'whatsappNumber', regexp_replace(coalesce(p."phoneCode", '') || coalesce(p.phone, ''), '[^0-9]', '', 'g'),
      'instagram', null
    )
    into v_promoter_contact
    from public."Promoter" p
    where p.id = v_promoter_id;
  end if;

  update public.public_orders
  set
    client_id = v_client_id,
    status = 'paid',
    paid_at = now(),
    snapshot = jsonb_build_object(
      'id', v_order.id,
      'reference', v_order.reference,
      'createdAt', v_order.created_at,
      'customer', jsonb_build_object(
        'name', v_customer_name,
        'phoneCode', v_customer_phone_code,
        'phone', v_customer_phone,
        'email', v_customer_email
      ),
      'userId', v_order.auth_user_id,
      'promoterReference', v_order.promoter_reference,
      'promoterContact', v_promoter_contact,
      'status', 'paid',
      'subtotal', v_order.subtotal,
      'serviceFee', v_order.service_fee,
      'total', v_order.total,
      'tickets', v_ticket_snapshots,
      'benefits', '[]'::jsonb
    )
  where id = v_order.id;

  update public."TicketReservation"
  set status = 'confirmed'
  where cart_id = v_draft.cart_id
    and status = 'active';

  v_sale_result := jsonb_build_object(
    'ok', true,
    'order_id', v_order.id,
    'order_reference', v_order.reference,
    'cart_id', v_draft.cart_id,
    'payment_id', v_first_payment_id,
    'payment_ids', v_payment_ids,
    'ticket_ids', v_ticket_ids,
    'ticket_count', jsonb_array_length(v_ticket_ids),
    'promoter_id', v_promoter_id,
    'promoter_name', coalesce(nullif(v_order_payload ->> 'seller_name', ''), 'B4F Events'),
    'notification_lines', v_notification_lines
  );

  update public."SumupTicketCheckoutDraft"
  set
    status = 'PAID',
    raw_checkout = p_provider_checkout,
    provider_paid_amount = v_provider_amount,
    paid_at = now(),
    sale_created = true,
    sale_created_at = now(),
    payment_id = v_first_payment_id,
    sale_result = v_sale_result,
    error_message = null,
    updated_at = now()
  where id = v_draft.id;

  return v_sale_result;
exception
  when others then
    update public."SumupTicketCheckoutDraft"
    set
      status = 'SALE_CREATION_FAILED',
      error_message = sqlerrm,
      raw_checkout = coalesce(p_provider_checkout, '{}'::jsonb),
      updated_at = now()
    where checkout_id = p_checkout_id
      and sale_created = false;

    return jsonb_build_object(
      'ok', false,
      'message', sqlerrm,
      'checkout_id', p_checkout_id
    );
end;
$$;

revoke all on function public.public_finalize_sumup_checkout(text, jsonb) from public, anon, authenticated;
grant execute on function public.public_finalize_sumup_checkout(text, jsonb) to service_role;

-- Keep the public website synchronized when events and packs change in the mobile app.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'Event',
    'EventOption',
    'EventTable',
    'Pack',
    'PackEvent',
    'PackEventOption',
    'PackEventTable'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception
      when duplicate_object then null;
      when undefined_object then null;
    end;
  end loop;
end;
$$;

-- Editable examples requested by B4F. Replace names, percentages and terms with signed partner offers.
insert into public.partner_benefits (
  category,
  partner_name,
  title,
  description,
  discount_label,
  redemption_instructions,
  display_order
)
select
  'jetski',
  'Partenaire Jet Ski Barcelona',
  'Réduction Jet Ski',
  'Une remise réservée aux clients B4F sur une activité Jet Ski partenaire.',
  '-15 %',
  'Présentez un billet B4F valide et non remboursé. Offre exemple à remplacer par les conditions du partenaire.',
  10
where not exists (
  select 1 from public.partner_benefits where category = 'jetski'
);

insert into public.partner_benefits (
  category,
  partner_name,
  title,
  description,
  discount_label,
  redemption_instructions,
  display_order
)
select
  'coffee_shop',
  'Coffee Shop partenaire B4F',
  'Réduction Coffee Shop',
  'Une remise réservée aux clients B4F dans un coffee shop partenaire.',
  '-10 %',
  'Présentez un billet B4F valide et non remboursé. Offre exemple à remplacer par les conditions du partenaire.',
  20
where not exists (
  select 1 from public.partner_benefits where category = 'coffee_shop'
);
