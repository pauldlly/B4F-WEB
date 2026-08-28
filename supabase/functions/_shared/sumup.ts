import { HttpError } from "./http.ts";

const apiBase = "https://api.sumup.com/v0.1";

function credentials() {
  const apiKey = Deno.env.get("SUMUP_API_KEY")?.trim();
  const merchantCode = Deno.env.get("SUMUP_MERCHANT_CODE")?.trim();

  if (!apiKey || !merchantCode) {
    throw new HttpError(
      500,
      "SUMUP_NOT_CONFIGURED",
      "SUMUP_API_KEY ou SUMUP_MERCHANT_CODE manquant.",
    );
  }

  return { apiKey, merchantCode };
}

async function sumupFetch(path: string, init: RequestInit = {}) {
  const { apiKey } = credentials();
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let data: any = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    console.error("SumUp API error", response.status, data);
    throw new HttpError(
      502,
      "SUMUP_API_ERROR",
      data?.message || data?.error_message || `Erreur SumUp ${response.status}`,
    );
  }

  return data;
}

export async function createHostedCheckout({
  reference,
  amount,
  description,
  returnUrl,
  redirectUrl,
}: {
  reference: string;
  amount: number;
  description: string;
  returnUrl: string;
  redirectUrl: string;
}) {
  const { merchantCode } = credentials();

  return await sumupFetch("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      checkout_reference: reference,
      amount,
      currency: "EUR",
      merchant_code: merchantCode,
      description,
      return_url: returnUrl,
      redirect_url: redirectUrl,
      hosted_checkout: { enabled: true },
    }),
  });
}

export async function getCheckout(checkoutId: string) {
  return await sumupFetch(`/checkouts/${encodeURIComponent(checkoutId)}`, {
    method: "GET",
  });
}
