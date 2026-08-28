import { HttpError } from "./http.ts";
import { admin } from "./supabase.ts";
import { cleanText, integer, money, normalizePhone } from "./security.ts";

type Promoter = {
  id: string;
  firstname: string | null;
  name: string | null;
  phone: string | null;
  phone_code: string | null;
  manager: boolean;
  manager_id: string | null;
  display_name: string | null;
};

type SellerContext = {
  promoter: Promoter | null;
  promoterId: string | null;
  managerId: string | null;
  sellerIsManager: boolean;
  sellerName: string;
};

type NormalizedExtra = {
  kind: "option" | "table";
  id: number;
  pack_event_id: string | null;
  event_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  full_price: number;
  deposit_percentage: number;
  total_price: number;
  promoter_commission_unit: number;
  promoter_commission_total: number;
  manager_commission_unit: number;
  manager_commission_total: number;
};

type SelectedEvent = {
  event_id: number;
  pack_event_id: string | null;
  name: string;
  event_date: string | null;
  start_time: string | null;
  location: string | null;
  base_total: number;
};

export type NormalizedGroup = {
  kind: "event" | "pack";
  source_id: number | string;
  label: string;
  image_url: string | null;
  gender: "man" | "woman";
  quantity: number;
  unit_price: number;
  base_total: number;
  options_total: number;
  tables_total: number;
  total: number;
  promoter_commission_total: number;
  manager_commission_total: number;
  options_promoter_commission_total: number;
  tables_promoter_commission_total: number;
  options_manager_commission_total: number;
  tables_manager_commission_total: number;
  selected_events: SelectedEvent[];
  extras: NormalizedExtra[];
};

export type NormalizedCheckout = {
  customer: {
    name: string;
    email: string | null;
    phoneCode: string;
    phone: string;
  };
  seller: SellerContext;
  groups: NormalizedGroup[];
  subtotal: number;
  transactionFee: number;
  applicationFee: number;
  serviceFee: number;
  total: number;
  ticketCount: number;
  notificationLines: Array<{
    name: string;
    quantity: number;
    isPack: boolean;
  }>;
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateFees(subtotal: number, ticketCount: number) {
  if (subtotal <= 0) {
    return { transactionFee: 0, applicationFee: 0, serviceFee: 0 };
  }

  const transactionFee = subtotal <= 40 ? 0.99 : round(subtotal * 0.025);
  const applicationFee = round(ticketCount * 0.5);

  return {
    transactionFee,
    applicationFee,
    serviceFee: round(transactionFee + applicationFee),
  };
}

function eventHasPassed(event: any) {
  if (!event?.event_date) return false;

  const now = new Date();
  const datePart = String(event.event_date).slice(0, 10);
  const startPart = String(event.start_time || "00:00:00");
  const endPart = String(event.end_time || event.start_time || "23:59:59");

  const start = new Date(`${datePart}T${startPart}`);
  const end = new Date(`${datePart}T${endPart}`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return datePart < now.toISOString().slice(0, 10);
  }

  if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
  return end.getTime() <= now.getTime();
}

async function resolveSeller(reference: unknown): Promise<SellerContext> {
  const promoterReference = cleanText(reference, 120);

  if (!promoterReference) {
    return {
      promoter: null,
      promoterId: null,
      managerId: null,
      sellerIsManager: false,
      sellerName: "B4F Events",
    };
  }

  const { data, error } = await admin.rpc("public_resolve_promoter_reference", {
    p_reference: promoterReference,
  });

  if (error) {
    throw new HttpError(400, "INVALID_PROMOTER_LINK", error.message);
  }

  const promoter = (Array.isArray(data) ? data[0] : data) as Promoter | null;

  if (!promoter?.id) {
    throw new HttpError(
      404,
      "PROMOTER_NOT_FOUND",
      "Le lien promoteur n’est plus valide.",
    );
  }

  return {
    promoter,
    promoterId: promoter.id,
    managerId: promoter.manager ? promoter.id : promoter.manager_id,
    sellerIsManager: promoter.manager === true,
    sellerName: promoter.firstname?.trim() || promoter.display_name?.trim() || "Promoteur B4F",
  };
}

function commissionValues({
  seller,
  promoterCommission,
  managerCommission,
  quantity,
}: {
  seller: SellerContext;
  promoterCommission: unknown;
  managerCommission: unknown;
  quantity: number;
}) {
  if (!seller.promoterId) {
    return {
      promoterUnit: 0,
      promoterTotal: 0,
      managerUnit: 0,
      managerTotal: 0,
    };
  }

  if (seller.sellerIsManager) {
    const managerUnit = money(managerCommission);
    return {
      promoterUnit: 0,
      promoterTotal: 0,
      managerUnit,
      managerTotal: round(managerUnit * quantity),
    };
  }

  const promoterUnit = money(promoterCommission);
  return {
    promoterUnit,
    promoterTotal: round(promoterUnit * quantity),
    managerUnit: 0,
    managerTotal: 0,
  };
}

async function assertPromoterCanSellEvent(promoterId: string | null, eventId: number) {
  if (!promoterId) return;

  const { data, error } = await admin
    .from("EventPromoterVisibility")
    .select("promoter_id")
    .eq("event_id", eventId);

  if (error) throw error;
  if ((data ?? []).length === 0) return;

  if (!(data ?? []).some((row) => row.promoter_id === promoterId)) {
    throw new HttpError(
      403,
      "PROMOTER_EVENT_NOT_ALLOWED",
      "Ce promoteur ne peut pas vendre cet événement.",
    );
  }
}

async function getEvent(eventId: number, allowPackOnly = false) {
  const { data, error } = await admin
    .from("Event")
    .select(
      "id,name,location,event_date,start_time,end_time,image_url,status,soldout,is_visible_only_in_packs,women_price,men_price,commission,manager_commission,women_capacity,men_capacity,capacity_women_init,capacity_men_init",
    )
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw error;

  if (
    !data ||
    data.status !== "active" ||
    data.soldout === true ||
    (!allowPackOnly && data.is_visible_only_in_packs === true) ||
    eventHasPassed(data)
  ) {
    throw new HttpError(409, "EVENT_UNAVAILABLE", "Cet événement n’est plus disponible.");
  }

  return data;
}

async function normalizeEventExtras({
  rawExtras,
  eventId,
  quantity,
  seller,
}: {
  rawExtras: any[];
  eventId: number;
  quantity: number;
  seller: SellerContext;
}) {
  const extras: NormalizedExtra[] = [];

  for (const rawExtra of rawExtras) {
    const kind = rawExtra?.kind;
    const id = integer(rawExtra?.id, 0);
    const extraQuantity = integer(rawExtra?.quantity, 0);

    if (!id || extraQuantity <= 0) continue;
    if (extraQuantity > quantity) {
      throw new HttpError(400, "EXTRA_QUANTITY_INVALID", "La quantité d’options dépasse le nombre de billets.");
    }

    if (kind === "option") {
      const { data, error } = await admin
        .from("EventOption")
        .select("id,event_id,name,price,commission,manager_commission,archived")
        .eq("id", id)
        .eq("event_id", eventId)
        .eq("archived", false)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new HttpError(400, "OPTION_NOT_ALLOWED", "Option non disponible.");

      const unitPrice = money(data.price);
      const commissions = commissionValues({
        seller,
        promoterCommission: data.commission,
        managerCommission: data.manager_commission,
        quantity: extraQuantity,
      });

      extras.push({
        kind: "option",
        id,
        pack_event_id: null,
        event_id: eventId,
        name: cleanText(data.name, 180) || "Option",
        quantity: extraQuantity,
        unit_price: unitPrice,
        full_price: unitPrice,
        deposit_percentage: 100,
        total_price: round(unitPrice * extraQuantity),
        promoter_commission_unit: commissions.promoterUnit,
        promoter_commission_total: commissions.promoterTotal,
        manager_commission_unit: commissions.managerUnit,
        manager_commission_total: commissions.managerTotal,
      });
      continue;
    }

    if (kind === "table") {
      const { data, error } = await admin
        .from("EventTable")
        .select("id,event_id,name,price,commission,manager_commission,deposit_percentage,archived")
        .eq("id", id)
        .eq("event_id", eventId)
        .eq("archived", false)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new HttpError(400, "TABLE_NOT_ALLOWED", "Table non disponible.");

      const fullPrice = money(data.price);
      const depositPercentage = money(data.deposit_percentage);
      const unitPrice = round(fullPrice * depositPercentage / 100);
      const commissions = commissionValues({
        seller,
        promoterCommission: data.commission,
        managerCommission: data.manager_commission,
        quantity: extraQuantity,
      });

      extras.push({
        kind: "table",
        id,
        pack_event_id: null,
        event_id: eventId,
        name: cleanText(data.name, 180) || "Table",
        quantity: extraQuantity,
        unit_price: unitPrice,
        full_price: fullPrice,
        deposit_percentage: depositPercentage,
        total_price: round(unitPrice * extraQuantity),
        promoter_commission_unit: commissions.promoterUnit,
        promoter_commission_total: commissions.promoterTotal,
        manager_commission_unit: commissions.managerUnit,
        manager_commission_total: commissions.managerTotal,
      });
      continue;
    }

    throw new HttpError(400, "INVALID_EXTRA_KIND", "Type d’option invalide.");
  }

  return extras;
}

function sumExtraTotals(extras: NormalizedExtra[]) {
  const options = extras.filter((extra) => extra.kind === "option");
  const tables = extras.filter((extra) => extra.kind === "table");

  return {
    optionsTotal: round(options.reduce((sum, extra) => sum + extra.total_price, 0)),
    tablesTotal: round(tables.reduce((sum, extra) => sum + extra.total_price, 0)),
    optionsPromoterCommission: round(
      options.reduce((sum, extra) => sum + extra.promoter_commission_total, 0),
    ),
    tablesPromoterCommission: round(
      tables.reduce((sum, extra) => sum + extra.promoter_commission_total, 0),
    ),
    optionsManagerCommission: round(
      options.reduce((sum, extra) => sum + extra.manager_commission_total, 0),
    ),
    tablesManagerCommission: round(
      tables.reduce((sum, extra) => sum + extra.manager_commission_total, 0),
    ),
  };
}

async function normalizeEventItem(rawItem: any, seller: SellerContext): Promise<NormalizedGroup> {
  const eventId = integer(rawItem?.eventId, 0);
  const quantity = integer(rawItem?.quantity, 1);
  const gender = rawItem?.gender === "woman" ? "woman" : "man";

  if (!eventId || quantity <= 0) {
    throw new HttpError(400, "INVALID_EVENT_ITEM", "Billet invalide.");
  }

  const event = await getEvent(eventId, false);
  await assertPromoterCanSellEvent(seller.promoterId, eventId);

  const unitPrice = money(gender === "woman" ? event.women_price : event.men_price);
  const baseTotal = round(unitPrice * quantity);
  const baseCommissions = commissionValues({
    seller,
    promoterCommission: event.commission,
    managerCommission: event.manager_commission,
    quantity,
  });

  const extras = await normalizeEventExtras({
    rawExtras: Array.isArray(rawItem?.extras) ? rawItem.extras : [],
    eventId,
    quantity,
    seller,
  });

  const extraTotals = sumExtraTotals(extras);

  return {
    kind: "event",
    source_id: eventId,
    label: cleanText(event.name, 180) || "Événement B4F",
    image_url: event.image_url ?? null,
    gender,
    quantity,
    unit_price: unitPrice,
    base_total: baseTotal,
    options_total: extraTotals.optionsTotal,
    tables_total: extraTotals.tablesTotal,
    total: round(baseTotal + extraTotals.optionsTotal + extraTotals.tablesTotal),
    promoter_commission_total: round(
      baseCommissions.promoterTotal +
        extraTotals.optionsPromoterCommission +
        extraTotals.tablesPromoterCommission,
    ),
    manager_commission_total: round(
      baseCommissions.managerTotal +
        extraTotals.optionsManagerCommission +
        extraTotals.tablesManagerCommission,
    ),
    options_promoter_commission_total: extraTotals.optionsPromoterCommission,
    tables_promoter_commission_total: extraTotals.tablesPromoterCommission,
    options_manager_commission_total: extraTotals.optionsManagerCommission,
    tables_manager_commission_total: extraTotals.tablesManagerCommission,
    selected_events: [
      {
        event_id: eventId,
        pack_event_id: null,
        name: cleanText(event.name, 180) || "Événement B4F",
        event_date: event.event_date,
        start_time: event.start_time,
        location: event.location,
        base_total: baseTotal,
      },
    ],
    extras,
  };
}

async function normalizePackItem(rawItem: any, seller: SellerContext): Promise<NormalizedGroup[]> {
  const packId = cleanText(rawItem?.packId, 80, true);
  const maleQuantity = integer(rawItem?.maleQuantity, 0);
  const femaleQuantity = integer(rawItem?.femaleQuantity, 0);
  const totalQuantity = maleQuantity + femaleQuantity;

  if (totalQuantity <= 0) {
    throw new HttpError(400, "INVALID_PACK_QUANTITY", "Sélectionnez au moins un pack.");
  }

  const { data: pack, error: packError } = await admin
    .from("Pack")
    .select(
      "id,name,description,image_url,status,soldout,women_price,men_price,commission,manager_commission,women_capacity,men_capacity,capacity_women_init,capacity_men_init",
    )
    .eq("id", packId)
    .maybeSingle();

  if (packError) throw packError;
  if (!pack || pack.status !== "active" || pack.soldout === true) {
    throw new HttpError(409, "PACK_UNAVAILABLE", "Ce pack n’est plus disponible.");
  }

  const { data: packEvents, error: packEventsError } = await admin
    .from("PackEvent")
    .select(
      "id,pack_id,event_id,event_type,choice_group_key,choice_group_title,min_choices,max_choices,is_active,removed_at",
    )
    .eq("pack_id", packId)
    .eq("is_active", true)
    .is("removed_at", null);

  if (packEventsError) throw packEventsError;

  const selectedIds = new Set(
    (Array.isArray(rawItem?.selectedEvents) ? rawItem.selectedEvents : [])
      .map((item: any) => String(item?.packEventId ?? ""))
      .filter(Boolean),
  );

  const required = (packEvents ?? []).filter((item) => item.event_type === "required");
  if (required.some((item) => !selectedIds.has(item.id))) {
    throw new HttpError(400, "PACK_REQUIRED_EVENT_MISSING", "Un événement obligatoire du pack manque.");
  }

  const choiceGroups = new Map<string, any[]>();
  for (const relation of packEvents ?? []) {
    if (relation.event_type !== "choice") continue;
    const key = relation.choice_group_key || `choice-${relation.id}`;
    const current = choiceGroups.get(key) ?? [];
    current.push(relation);
    choiceGroups.set(key, current);
  }

  for (const relations of choiceGroups.values()) {
    const selectedCount = relations.filter((item) => selectedIds.has(item.id)).length;
    const min = Math.max(...relations.map((item) => integer(item.min_choices, 1)));
    const max = Math.max(...relations.map((item) => integer(item.max_choices, 1)));

    if (selectedCount < min || selectedCount > max) {
      throw new HttpError(400, "PACK_CHOICE_INVALID", "Les choix du pack ne sont pas valides.");
    }
  }

  const selectedRelations = (packEvents ?? []).filter((item) => selectedIds.has(item.id));
  if (selectedRelations.length === 0) {
    throw new HttpError(400, "PACK_NO_EVENT", "Aucun événement sélectionné dans le pack.");
  }

  const selectedEvents = [] as Array<{
    relation: any;
    event: any;
  }>;

  for (const relation of selectedRelations) {
    const eventId = integer(relation.event_id, 0);
    const event = await getEvent(eventId, true);
    await assertPromoterCanSellEvent(seller.promoterId, eventId);
    selectedEvents.push({ relation, event });
  }

  const rawExtras = Array.isArray(rawItem?.extras) ? rawItem.extras : [];
  const normalizedAllExtras: NormalizedExtra[] = [];

  for (const rawExtra of rawExtras) {
    const kind = rawExtra?.kind;
    const id = integer(rawExtra?.id, 0);
    const quantity = integer(rawExtra?.quantity, 0);
    const packEventId = cleanText(rawExtra?.packEventId, 80);

    if (!id || quantity <= 0) continue;
    if (!packEventId || !selectedIds.has(packEventId)) {
      throw new HttpError(400, "PACK_EXTRA_EVENT_INVALID", "Cette option ne correspond pas à un événement sélectionné.");
    }
    if (quantity > totalQuantity) {
      throw new HttpError(400, "PACK_EXTRA_QUANTITY_INVALID", "La quantité d’options dépasse le nombre de packs.");
    }

    const relation = selectedRelations.find((item) => item.id === packEventId);
    if (!relation) throw new HttpError(400, "PACK_EVENT_NOT_FOUND", "Événement de pack introuvable.");

    if (kind === "option") {
      const [{ data: allowed, error: allowedError }, { data, error }] = await Promise.all([
        admin
          .from("PackEventOption")
          .select("id")
          .eq("pack_event_id", packEventId)
          .eq("option_id", id)
          .maybeSingle(),
        admin
          .from("EventOption")
          .select("id,event_id,name,price,commission,manager_commission,archived")
          .eq("id", id)
          .eq("event_id", relation.event_id)
          .eq("archived", false)
          .maybeSingle(),
      ]);

      if (allowedError) throw allowedError;
      if (error) throw error;
      if (!allowed || !data) throw new HttpError(400, "PACK_OPTION_NOT_ALLOWED", "Option non autorisée dans ce pack.");

      const unitPrice = money(data.price);
      const commissions = commissionValues({
        seller,
        promoterCommission: data.commission,
        managerCommission: data.manager_commission,
        quantity,
      });

      normalizedAllExtras.push({
        kind: "option",
        id,
        pack_event_id: packEventId,
        event_id: integer(relation.event_id, 0),
        name: cleanText(data.name, 180) || "Option",
        quantity,
        unit_price: unitPrice,
        full_price: unitPrice,
        deposit_percentage: 100,
        total_price: round(unitPrice * quantity),
        promoter_commission_unit: commissions.promoterUnit,
        promoter_commission_total: commissions.promoterTotal,
        manager_commission_unit: commissions.managerUnit,
        manager_commission_total: commissions.managerTotal,
      });
      continue;
    }

    if (kind === "table") {
      const [{ data: allowed, error: allowedError }, { data, error }] = await Promise.all([
        admin
          .from("PackEventTable")
          .select("id")
          .eq("pack_event_id", packEventId)
          .eq("table_id", id)
          .maybeSingle(),
        admin
          .from("EventTable")
          .select("id,event_id,name,price,commission,manager_commission,deposit_percentage,archived")
          .eq("id", id)
          .eq("event_id", relation.event_id)
          .eq("archived", false)
          .maybeSingle(),
      ]);

      if (allowedError) throw allowedError;
      if (error) throw error;
      if (!allowed || !data) throw new HttpError(400, "PACK_TABLE_NOT_ALLOWED", "Table non autorisée dans ce pack.");

      const fullPrice = money(data.price);
      const depositPercentage = money(data.deposit_percentage);
      const unitPrice = round(fullPrice * depositPercentage / 100);
      const commissions = commissionValues({
        seller,
        promoterCommission: data.commission,
        managerCommission: data.manager_commission,
        quantity,
      });

      normalizedAllExtras.push({
        kind: "table",
        id,
        pack_event_id: packEventId,
        event_id: integer(relation.event_id, 0),
        name: cleanText(data.name, 180) || "Table",
        quantity,
        unit_price: unitPrice,
        full_price: fullPrice,
        deposit_percentage: depositPercentage,
        total_price: round(unitPrice * quantity),
        promoter_commission_unit: commissions.promoterUnit,
        promoter_commission_total: commissions.promoterTotal,
        manager_commission_unit: commissions.managerUnit,
        manager_commission_total: commissions.managerTotal,
      });
      continue;
    }

    throw new HttpError(400, "INVALID_EXTRA_KIND", "Type d’option invalide.");
  }

  const groups: NormalizedGroup[] = [];
  const genderRows = [
    { gender: "man" as const, quantity: maleQuantity, unitPrice: money(pack.men_price) },
    { gender: "woman" as const, quantity: femaleQuantity, unitPrice: money(pack.women_price) },
  ].filter((row) => row.quantity > 0);
  const remainingExtraQuantities = new Map(
    normalizedAllExtras.map((extra) => [`${extra.kind}:${extra.pack_event_id}:${extra.id}`, extra.quantity]),
  );

  for (let index = 0; index < genderRows.length; index += 1) {
    const row = genderRows[index];
    const baseTotal = round(row.unitPrice * row.quantity);
    const extras = normalizedAllExtras
      .map((extra) => {
        const allocationKey = `${extra.kind}:${extra.pack_event_id}:${extra.id}`;
        const remaining = remainingExtraQuantities.get(allocationKey) ?? 0;
        const allocatedQuantity = Math.min(remaining, row.quantity);
        remainingExtraQuantities.set(allocationKey, remaining - allocatedQuantity);

        if (allocatedQuantity <= 0) return null;

        return {
          ...extra,
          quantity: allocatedQuantity,
          total_price: round(extra.unit_price * allocatedQuantity),
          promoter_commission_total: round(
            extra.promoter_commission_unit * allocatedQuantity,
          ),
          manager_commission_total: round(
            extra.manager_commission_unit * allocatedQuantity,
          ),
        };
      })
      .filter((extra): extra is NormalizedExtra => extra !== null);
    const extraTotals = sumExtraTotals(extras);
    const baseCommissions = commissionValues({
      seller,
      promoterCommission: pack.commission,
      managerCommission: pack.manager_commission,
      quantity: row.quantity,
    });

    groups.push({
      kind: "pack",
      source_id: pack.id,
      label: cleanText(pack.name, 180) || "Pack B4F",
      image_url: pack.image_url ?? null,
      gender: row.gender,
      quantity: row.quantity,
      unit_price: row.unitPrice,
      base_total: baseTotal,
      options_total: extraTotals.optionsTotal,
      tables_total: extraTotals.tablesTotal,
      total: round(baseTotal + extraTotals.optionsTotal + extraTotals.tablesTotal),
      promoter_commission_total: round(
        baseCommissions.promoterTotal +
          extraTotals.optionsPromoterCommission +
          extraTotals.tablesPromoterCommission,
      ),
      manager_commission_total: round(
        baseCommissions.managerTotal +
          extraTotals.optionsManagerCommission +
          extraTotals.tablesManagerCommission,
      ),
      options_promoter_commission_total: extraTotals.optionsPromoterCommission,
      tables_promoter_commission_total: extraTotals.tablesPromoterCommission,
      options_manager_commission_total: extraTotals.optionsManagerCommission,
      tables_manager_commission_total: extraTotals.tablesManagerCommission,
      selected_events: selectedEvents.map(({ relation, event }) => ({
        event_id: integer(event.id, 0),
        pack_event_id: relation.id,
        name: cleanText(event.name, 180) || "Événement B4F",
        event_date: event.event_date,
        start_time: event.start_time,
        location: event.location,
        base_total: round(baseTotal / selectedEvents.length),
      })),
      extras,
    });
  }

  return groups;
}

export async function normalizeCheckoutPayload(body: any): Promise<NormalizedCheckout> {
  const customerName = cleanText(body?.customer?.name, 120, true);
  const customerEmail = cleanText(body?.customer?.email, 180) || null;
  const phone = normalizePhone(body?.customer?.phoneCode, body?.customer?.phone);
  const seller = await resolveSeller(body?.affiliate?.promoterReference ?? body?.promoterReference);
  const items = Array.isArray(body?.items) ? body.items : [];

  if (items.length === 0 || items.length > 25) {
    throw new HttpError(400, "EMPTY_OR_TOO_LARGE_CART", "Le panier est vide ou trop volumineux.");
  }

  const groups: NormalizedGroup[] = [];

  for (const item of items) {
    if (item?.kind === "event") {
      groups.push(await normalizeEventItem(item, seller));
    } else if (item?.kind === "pack") {
      groups.push(...(await normalizePackItem(item, seller)));
    } else {
      throw new HttpError(400, "INVALID_CART_ITEM", "Article de panier invalide.");
    }
  }

  const subtotal = round(groups.reduce((sum, group) => sum + group.total, 0));
  const ticketCount = groups.reduce(
    (sum, group) => sum + group.quantity * group.selected_events.length,
    0,
  );
  const fees = calculateFees(subtotal, ticketCount);
  const total = round(subtotal + fees.serviceFee);

  const lineMap = new Map<string, { name: string; quantity: number; isPack: boolean }>();
  for (const group of groups) {
    const key = `${group.kind}:${group.label.toLocaleLowerCase("fr-FR")}`;
    const current = lineMap.get(key);
    if (current) current.quantity += group.quantity;
    else lineMap.set(key, { name: group.label, quantity: group.quantity, isPack: group.kind === "pack" });
  }

  return {
    customer: {
      name: customerName,
      email: customerEmail,
      phoneCode: phone.phoneCode,
      phone: phone.phone,
    },
    seller,
    groups,
    subtotal,
    transactionFee: fees.transactionFee,
    applicationFee: fees.applicationFee,
    serviceFee: fees.serviceFee,
    total,
    ticketCount,
    notificationLines: Array.from(lineMap.values()),
  };
}
