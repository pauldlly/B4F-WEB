import { supabase } from "../lib/supabase";
import type { PartnerBenefit } from "../types";

export async function getPublicPartnerBenefits(): Promise<PartnerBenefit[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("partner_benefits")
    .select(
      "id,category,partner_name,title,description,discount_label,redemption_instructions,image_url,website_url,address,valid_from,valid_until,display_order",
    )
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;

  const now = Date.now();

  return (data ?? [])
    .filter((row) => {
      const starts = row.valid_from ? new Date(row.valid_from).getTime() : null;
      const ends = row.valid_until ? new Date(row.valid_until).getTime() : null;

      return (starts === null || starts <= now) && (ends === null || ends >= now);
    })
    .map((row) => ({
      id: String(row.id),
      category: String(row.category),
      partnerName: String(row.partner_name),
      title: String(row.title),
      description: String(row.description),
      discountLabel: String(row.discount_label),
      redemptionInstructions: String(row.redemption_instructions),
      imageUrl: row.image_url ? String(row.image_url) : null,
      websiteUrl: row.website_url ? String(row.website_url) : null,
      address: row.address ? String(row.address) : null,
      validFrom: row.valid_from ? String(row.valid_from) : null,
      validUntil: row.valid_until ? String(row.valid_until) : null,
    }));
}
