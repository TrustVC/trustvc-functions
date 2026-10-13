import { ALLOWED_ORIGIN_REGEX } from "../../src/constants";

describe("ALLOWED_ORIGIN_REGEX", () => {
  it("allows the apex and real subdomains", () => {
    expect(ALLOWED_ORIGIN_REGEX.test("https://trustvc.io")).toBe(true);
    expect(ALLOWED_ORIGIN_REGEX.test("https://www.trustvc.io")).toBe(true);
    expect(ALLOWED_ORIGIN_REGEX.test("https://dev.trustvc.io")).toBe(true);
    expect(ALLOWED_ORIGIN_REGEX.test("https://creator.trustvc.io")).toBe(true);
  });

  it("rejects a trusted name glued to another host", () => {
    expect(ALLOWED_ORIGIN_REGEX.test("https://trustvc.io.evil.com")).toBe(false);
    expect(ALLOWED_ORIGIN_REGEX.test("https://eviltrustvc.io")).toBe(false);
  });
});
