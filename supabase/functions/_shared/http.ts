export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: HeadersInit = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

export function handleOptions(req: Request) {
  if (req.method !== "OPTIONS") return null;
  return new Response("ok", { headers: corsHeaders });
}

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error ?? "Erreur inconnue");
}

export function assertPost(req: Request) {
  if (req.method !== "POST") {
    throw new HttpError(405, "METHOD_NOT_ALLOWED");
  }
}

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message = code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function asHttpResponse(error: unknown) {
  if (error instanceof HttpError) {
    return jsonResponse(
      { ok: false, code: error.code, message: error.message },
      error.status,
    );
  }

  console.error(error);
  return jsonResponse(
    { ok: false, code: "INTERNAL_ERROR", message: errorMessage(error) },
    500,
  );
}
