import { isAllowedBrowserOrigin } from "../../src/constants";
import { isTrustedOrigin } from "../../src/utils";

describe("isAllowedBrowserOrigin", () => {
  it.each([
    "https://trustvc.io",
    "https://www.trustvc.io",
    "https://creator.trustvc.io",
    "https://dev.trustvc.io",
    "https://a.b.trustvc.io",
  ])("allows %s", (origin) => {
    expect(isAllowedBrowserOrigin(origin)).toBe(true);
  });

  it.each([
    "http://trustvc.io",
    "https://trustvc.io.evil.com",
    "https://eviltrustvc.io",
    "https://nottrustvc.io",
    "https://foo.trustvc.io.evil.com",
    "https://trustvc.io.attacker.com",
    "https://trustvc.io%2eevil.com",
    "https://trustvc.io%2Eevil.com",
    "https://user:pass@trustvc.io",
    "https://evil.com@trustvc.io",
    "https://trustvc.io/foo",
    "https://trustvc.io?x=1",
    "https://trustvc.io#evil",
    "https://TRUSTVC.io",
    "https://trustvc.io:443",
    "https://trustvc.io:8443",
    "https://trustvc.io.",
    "https://.trustvc.io",
    "https://sub-.trustvc.io",
    "https://evil.com",
    "null",
  ])("rejects %s", (origin) => {
    expect(isAllowedBrowserOrigin(origin)).toBe(false);
  });
});

describe("isTrustedOrigin", () => {
  it("accepts a page on a trusted host", () => {
    expect(isTrustedOrigin("https://creator.trustvc.io/documents/1")).toBe(
      true
    );
  });

  it("rejects a host that only starts with the trusted name", () => {
    expect(isTrustedOrigin("https://trustvc.io.evil.com/documents/1")).toBe(
      false
    );
  });
});
