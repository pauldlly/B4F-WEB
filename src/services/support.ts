import { supabase } from "../lib/supabase";

export type SupportRequestPayload = {
  name: string;
  email: string;
  phoneCode: string;
  phone: string;
  topic: string;
  orderReference: string;
  message: string;
};

export async function createSupportRequest(payload: SupportRequestPayload) {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");

  const { data, error } = await supabase.functions.invoke(
    "create-public-support-request",
    { body: payload },
  );

  if (error) throw error;
  if (data?.ok === false) {
    throw new Error(data.message || "Envoi impossible.");
  }

  return data as { ok: true; requestId: string; createdAt: string };
}
