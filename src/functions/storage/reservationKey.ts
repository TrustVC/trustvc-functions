import { createHmac, timingSafeEqual } from "crypto";
import { v4 as uuid } from "uuid";
import createError from "http-errors";
import { ERROR_MESSAGE } from "../../constants";
import { assertUnusedReservation, StoredObject } from "./reservationGuard";

const reservationSecret = (): string => {
  const secret = process.env.STORAGE_RESERVATION_SECRET;
  if (!secret) {
    throw createError(500, ERROR_MESSAGE.RESERVATION_SECRET_MISSING);
  }
  return secret;
};

// Same width as oa-encryption's generateEncryptionKey (256-bit hex).
export const reservationKeyFor = (id: string): string =>
  createHmac("sha256", reservationSecret()).update(id).digest("hex");

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// A separate HMAC input from reservationKeyFor, so the key handed to the client reveals nothing about the tag.
const reservationTag = (base: string): string =>
  createHmac("sha256", reservationSecret())
    .update(`reservation-id:${base}`)
    .digest("hex")
    .slice(0, 32);

// Nothing is stored at queue time, so the id itself carries proof that /queue issued it.
export const issueReservationId = (): string => {
  const base = uuid();
  return `${base}.${reservationTag(base)}`;
};

export const isIssuedReservationId = (id: string): boolean => {
  const [base, tag, ...rest] = id.split(".");
  if (
    rest.length > 0 ||
    !UUID_V4.test(base) ||
    !/^[0-9a-f]{32}$/.test(tag ?? "")
  ) {
    return false;
  }
  return timingSafeEqual(Buffer.from(tag), Buffer.from(reservationTag(base)));
};

// A missing object is accepted only for an id that /queue issued. An object already
// in the bucket must still be an unused reservation from before this change.
export const keyForUpload = (
  stored: StoredObject | null | undefined,
  documentId: string
): string => {
  if (stored == null) {
    if (!isIssuedReservationId(documentId)) {
      throw createError(403, ERROR_MESSAGE.RESERVATION_REQUIRED);
    }
    return reservationKeyFor(documentId);
  }
  return assertUnusedReservation(stored);
};

// Bind the later write to the object state the read just observed.
// Absent: create only if the key is still missing. Present: replace only that version.
export const writeHeadersForObserved = (
  observed: { etag: string } | null
): Record<string, string> => {
  if (observed == null) {
    return { "If-None-Match": "*" };
  }
  if (observed.etag.length === 0) {
    throw createError(409, ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS);
  }
  return { "If-Match": observed.etag };
};

export const isConditionalWriteConflict = (err: unknown): boolean => {
  if (typeof err !== "object" || err === null) {
    return false;
  }
  const code = "code" in err ? (err as { code?: unknown }).code : undefined;
  const statusCode =
    "statusCode" in err
      ? (err as { statusCode?: unknown }).statusCode
      : undefined;
  return (
    statusCode === 412 ||
    code === "PreconditionFailed" ||
    code === "ConditionalRequestConflict"
  );
};
