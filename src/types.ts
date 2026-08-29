export type Gender = "man" | "woman";
export type CatalogMode = "events" | "packs";
export type DatePreset =
  | "all"
  | "today"
  | "tomorrow"
  | "weekend"
  | "range";

export type CatalogFilters = {
  search: string;
  eventTypes: string[];
  datePreset: DatePreset;
  startDate: string;
  endDate: string;
};

export type AffiliateScopeType = "general" | "event" | "pack";

export type AffiliateContext = {
  promoterReference: string | null;
  scopeType: AffiliateScopeType | null;
  scopeId: string | null;
};

export type PublicEventOption = {
  id: number;
  eventId: number;
  name: string;
  description: string | null;
  price: number;
};

export type PublicEventTable = {
  id: number;
  eventId: number;
  name: string;
  description: string | null;
  fullPrice: number;
  depositPercentage: number;
  depositPrice: number;
};

export type PublicEvent = {
  id: number;
  name: string;
  location: string | null;
  address: string | null;
  type: string | null;
  description: string | null;
  miniDescription: string | null;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  imageUrl: string | null;
  mediaLink: string | null;
  womenPrice: number;
  menPrice: number;
  womenCapacity: number | null;
  menCapacity: number | null;
  womenSold: number;
  menSold: number;
  soldout: boolean;
  options: PublicEventOption[];
  tables: PublicEventTable[];
};

export type PackEventKind = "required" | "choice";

export type PublicPackEvent = {
  id: string;
  packId: string;
  eventId: number;
  eventType: PackEventKind;
  choiceGroupKey: string | null;
  choiceGroupTitle: string | null;
  minChoices: number;
  maxChoices: number;
  event: PublicEvent;
  options: PublicEventOption[];
  tables: PublicEventTable[];
};

export type PublicPack = {
  id: string;
  name: string;
  description: string | null;
  womenPrice: number;
  menPrice: number;
  womenCapacity: number | null;
  menCapacity: number | null;
  womenSold: number;
  menSold: number;
  imageUrl: string | null;
  colorName: string | null;
  colorHex: string | null;
  soldout: boolean;
  earliestEventDate: string | null;
  events: PublicPackEvent[];
};

export type SelectedExtra = {
  key: string;
  kind: "option" | "table";
  id: number;
  packEventId: string | null;
  eventId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  fullPrice?: number;
  depositPercentage?: number;
};

export type EventCartItem = {
  kind: "event";
  key: string;
  eventId: number;
  eventName: string;
  eventDate: string | null;
  startTime: string | null;
  location: string | null;
  imageUrl: string | null;
  gender: Gender;
  quantity: number;
  unitPrice: number;
  maximumAvailable: number | null;
  extras: SelectedExtra[];
};

export type PackCartItem = {
  kind: "pack";
  key: string;
  packId: string;
  packName: string;
  imageUrl: string | null;
  maleQuantity: number;
  femaleQuantity: number;
  maleUnitPrice: number;
  femaleUnitPrice: number;
  maleMaximumAvailable: number | null;
  femaleMaximumAvailable: number | null;
  selectedEvents: Array<{
    packEventId: string;
    eventId: number;
    name: string;
    eventDate: string | null;
    startTime: string | null;
    location: string | null;
  }>;
  extras: SelectedExtra[];
};

export type CartItem = EventCartItem | PackCartItem;


export type PromoterContact = {
  reference: string;
  displayName: string;
  firstname: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  instagram: string | null;
};

export type GuestCustomer = {
  name: string;
  phoneCode: string;
  phone: string;
  email: string;
};

export type GuestTicket = {
  id: string;
  orderId: string;
  source: "event" | "pack";
  eventId: number;
  eventName: string;
  eventDate: string | null;
  startTime: string | null;
  location: string | null;
  holderName: string;
  gender: Gender;
  optionNames: string[];
  tableNames: string[];
  qrCode: string;
  scanned: boolean;
};

export type PartnerBenefit = {
  id: string;
  category: "jetski" | "coffee_shop" | "restaurant" | "activity" | "other" | string;
  partnerName: string;
  title: string;
  description: string;
  discountLabel: string;
  redemptionInstructions: string;
  imageUrl: string | null;
  websiteUrl: string | null;
  address: string | null;
  validFrom: string | null;
  validUntil: string | null;
};

export type GuestOrder = {
  id: string;
  accessToken?: string;
  reference: string;
  createdAt: string;
  paidAt?: string | null;
  customer: GuestCustomer;
  userId: string | null;
  promoterReference: string | null;
  promoterContact: PromoterContact | null;
  status: "paid" | "pending" | "failed" | "expired" | "cancelled";
  subtotal: number;
  serviceFee: number;
  total: number;
  tickets: GuestTicket[];
  benefits: PartnerBenefit[];
};

export type CheckoutPayload = {
  customer: GuestCustomer;
  affiliate: AffiliateContext;
  items: CartItem[];
};

export type PaginatedResult<T> = {
  items: T[];
  nextOffset: number | null;
  source: "supabase" | "demo";
};


export type GuestOrderAccess = {
  orderId: string;
  accessToken: string;
  orderReference?: string;
  createdAt: string;
};
