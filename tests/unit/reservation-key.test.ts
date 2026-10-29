import { decryptString, encryptString } from "@govtechsg/oa-encryption";
import { ERROR_MESSAGE } from "../../src/constants";
import {
  isConditionalWriteConflict,
  isIssuedReservationId,
  issueReservationId,
  keyForUpload,
  reservationKeyFor,
  writeHeadersForObserved,
} from "../../src/functions/storage/reservationKey";

const SECRET = "test-reservation-secret";

describe("reservationKeyFor", () => {
  const previous = process.env.STORAGE_RESERVATION_SECRET;

  beforeEach(() => {
    process.env.STORAGE_RESERVATION_SECRET = SECRET;
  });

  afterAll(() => {
    process.env.STORAGE_RESERVATION_SECRET = previous;
  });

  it("returns the same 256-bit hex key for the same id", () => {
    const key = reservationKeyFor("document-id");
    expect(key).toBe(reservationKeyFor("document-id"));
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns a different key for a different id", () => {
    expect(reservationKeyFor("document-a")).not.toBe(
      reservationKeyFor("document-b")
    );
  });

  it("encrypts with the derived key", async () => {
    const key = reservationKeyFor("document-id");
    const encrypted = await encryptString("hello", key);
    expect(encrypted.key).toBe(key);
    expect(await decryptString(encrypted)).toBe("hello");
  });

  it("fails when the secret is missing", () => {
    delete process.env.STORAGE_RESERVATION_SECRET;
    expect(() => reservationKeyFor("document-id")).toThrow(
      ERROR_MESSAGE.RESERVATION_SECRET_MISSING
    );
  });
});

describe("keyForUpload", () => {
  beforeEach(() => {
    process.env.STORAGE_RESERVATION_SECRET = SECRET;
  });

  it("derives a key when nothing is stored yet for an issued id", () => {
    const id = issueReservationId();
    expect(keyForUpload(null, id)).toBe(reservationKeyFor(id));
    expect(keyForUpload(undefined, id)).toBe(reservationKeyFor(id));
  });

  it("rejects an absent slot whose id was not issued by /queue", () => {
    expect(() => keyForUpload(null, "document-id")).toThrow(
      ERROR_MESSAGE.RESERVATION_REQUIRED
    );
  });

  it("keeps the key from a reservation that was stored earlier", () => {
    expect(keyForUpload({ key: "legacy-reservation-key" }, "document-id")).toBe(
      "legacy-reservation-key"
    );
  });

  it("rejects a slot that already holds a document", () => {
    expect(() =>
      keyForUpload(
        { key: "legacy-reservation-key", document: { cipherText: "stored" } },
        "document-id"
      )
    ).toThrow(ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS);
  });
});

describe("isIssuedReservationId", () => {
  beforeEach(() => {
    process.env.STORAGE_RESERVATION_SECRET = SECRET;
  });

  it("accepts an id from issueReservationId", () => {
    expect(isIssuedReservationId(issueReservationId())).toBe(true);
  });

  it.each([
    ["a bare uuid", "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"],
    ["an arbitrary name", "document-id"],
    ["a forged tag", `1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed.${"0".repeat(32)}`],
    ["an extra segment", `${"x"}.${"0".repeat(32)}.extra`],
    ["an empty string", ""],
  ])("rejects %s", (_label, id) => {
    expect(isIssuedReservationId(id)).toBe(false);
  });

  it("rejects an issued tag moved onto a different uuid", () => {
    const tag = issueReservationId().split(".")[1];
    expect(
      isIssuedReservationId(`1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed.${tag}`)
    ).toBe(false);
  });

  it("rejects an id issued under a different secret", () => {
    const id = issueReservationId();
    process.env.STORAGE_RESERVATION_SECRET = "another-secret";
    expect(isIssuedReservationId(id)).toBe(false);
  });
});

describe("writeHeadersForObserved", () => {
  it("creates the object only when the key is still absent", () => {
    expect(writeHeadersForObserved(null)).toEqual({ "If-None-Match": "*" });
  });

  it("replaces only the reservation version that was read", () => {
    expect(writeHeadersForObserved({ etag: '"legacy-etag"' })).toEqual({
      "If-Match": '"legacy-etag"',
    });
  });

  it("refuses a present object that has no version to match", () => {
    expect(() => writeHeadersForObserved({ etag: "" })).toThrow(
      ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS
    );
  });
});

describe("isConditionalWriteConflict", () => {
  it("recognises a lost compare-and-swap", () => {
    expect(isConditionalWriteConflict({ statusCode: 412 })).toBe(true);
    expect(isConditionalWriteConflict({ code: "PreconditionFailed" })).toBe(
      true
    );
    expect(
      isConditionalWriteConflict({ code: "ConditionalRequestConflict" })
    ).toBe(true);
    expect(
      isConditionalWriteConflict({ statusCode: 409, code: "NoSuchKey" })
    ).toBe(false);
    expect(isConditionalWriteConflict(null)).toBe(false);
  });
});
