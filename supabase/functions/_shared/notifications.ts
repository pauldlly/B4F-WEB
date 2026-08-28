import { admin } from "./supabase.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type SaleLine = {
  name: string;
  quantity: number;
  isPack?: boolean;
};

function validExpoToken(token: unknown): token is string {
  const value = String(token ?? "").trim();
  return /^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/.test(value);
}

function buildBody(sellerName: string, lines: SaleLine[]) {
  const summary = lines
    .filter((line) => Number(line.quantity) > 0)
    .slice(0, 4)
    .map((line) => `${line.quantity} × ${line.name}`)
    .join(" · ");

  return `${sellerName} a vendu ${summary || "un billet"}`;
}

function chunk<T>(items: T[], size = 100) {
  const groups: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }

  return groups;
}

async function sendExpoMessages(
  messages: Array<Record<string, unknown>>,
) {
  if (messages.length === 0) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate",
  };

  const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN")?.trim();
  if (expoAccessToken) {
    headers.Authorization = `Bearer ${expoAccessToken}`;
  }

  for (const batch of chunk(messages, 100)) {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Expo Push ${response.status}: ${text}`);
    }
  }
}

export async function sendSaleNotification({
  orderId,
  sellerName,
  lines,
}: {
  orderId: string;
  sellerName: string;
  lines: SaleLine[];
}) {
  const { data: existing } = await admin
    .from("public_sale_notification_dispatches")
    .select("status")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing?.status === "sent") {
    return { ok: true, skipped: true, recipients: 0 };
  }

  await admin.from("public_sale_notification_dispatches").upsert(
    {
      order_id: orderId,
      status: "pending",
      error_message: null,
    },
    { onConflict: "order_id" },
  );

  const [globalResult, promoterResult] = await Promise.all([
    admin.from("push_tokens").select("token").eq("active", true),
    admin
      .from("Promoter")
      .select("expo_push_token")
      .eq("status", "active")
      .not("expo_push_token", "is", null),
  ]);

  if (globalResult.error) throw globalResult.error;
  if (promoterResult.error) throw promoterResult.error;

  const tokens = new Set<string>();

  for (const row of globalResult.data ?? []) {
    if (validExpoToken(row.token)) tokens.add(row.token);
  }

  for (const row of promoterResult.data ?? []) {
    if (validExpoToken(row.expo_push_token)) tokens.add(row.expo_push_token);
  }

  if (tokens.size === 0) {
    await admin
      .from("public_sale_notification_dispatches")
      .update({
        status: "sent",
        recipient_count: 0,
        sent_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    return { ok: true, recipients: 0 };
  }

  const messages = Array.from(tokens).map((to) => ({
    to,
    sound: "default",
    title: "Nouvelle vente web 🎟️",
    body: buildBody(sellerName, lines),
    data: {
      type: "public_ticket_sale",
      orderId,
    },
    priority: "high",
  }));

  try {
    await sendExpoMessages(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await admin
      .from("public_sale_notification_dispatches")
      .update({
        status: "failed",
        error_message: message.slice(0, 1000),
      })
      .eq("order_id", orderId);

    throw error;
  }

  await admin
    .from("public_sale_notification_dispatches")
    .update({
      status: "sent",
      recipient_count: tokens.size,
      sent_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("order_id", orderId);

  return { ok: true, recipients: tokens.size };
}

export async function sendSupportNotification({
  requestId,
  name,
  topic,
}: {
  requestId: string;
  name: string;
  topic: string;
}) {
  const { data, error } = await admin
    .from("Promoter")
    .select("expo_push_token")
    .eq("status", "active")
    .eq("administrateur", true)
    .not("expo_push_token", "is", null);

  if (error) throw error;

  const tokens = Array.from(
    new Set(
      (data ?? [])
        .map((row) => row.expo_push_token)
        .filter(validExpoToken),
    ),
  );

  if (tokens.length === 0) return { ok: true, recipients: 0 };

  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    title: "Nouvelle demande support",
    body: `${name} · ${topic}`,
    data: { type: "public_support_request", requestId },
  }));

  await sendExpoMessages(messages);

  return { ok: true, recipients: tokens.length };
}
