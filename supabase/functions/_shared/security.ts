import { HttpError } from "./http.ts";

export function randomToken(bytes = 32) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return toBase64Url(buffer);
}

export async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function normalizePhone(code: unknown, phone: unknown) {
  const phoneCode = String(code ?? "").replace(/[^0-9+]/g, "").slice(0, 6);
  const phoneNumber = String(phone ?? "").replace(/\D/g, "").slice(0, 24);

  if (phoneNumber.length < 6) {
    throw new HttpError(400, "INVALID_PHONE", "Numéro de téléphone invalide.");
  }

  return {
    phoneCode: phoneCode || "+33",
    phone: phoneNumber,
  };
}

export function cleanText(value: unknown, maxLength: number, required = false) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
  if (required && !text) {
    throw new HttpError(400, "REQUIRED_FIELD_MISSING", "Champ obligatoire manquant.");
  }
  return text;
}

export function money(value: unknown) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return 0;
  return Math.round(Math.max(0, number) * 100) / 100;
}

export function integer(value: unknown, minimum = 0) {
  const number = Math.floor(Number(value ?? 0));
  if (!Number.isFinite(number)) return minimum;
  return Math.max(minimum, number);
}
