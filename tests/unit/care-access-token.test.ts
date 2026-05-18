import { afterEach, describe, expect, it } from "vitest";
import {
  createCareAccessToken,
  verifyCareAccessToken,
} from "@/lib/care/care-access-token";

describe("care-access-token", () => {
  const prev = process.env.NEXTAUTH_SECRET;

  afterEach(() => {
    if (prev !== undefined) process.env.NEXTAUTH_SECRET = prev;
    else delete process.env.NEXTAUTH_SECRET;
  });

  it("round-trips a valid token", () => {
    process.env.NEXTAUTH_SECRET = "test-secret-for-care-tokens";
    const token = createCareAccessToken("user@example.com");
    expect(token).toBeTruthy();
    const verified = verifyCareAccessToken(token!);
    expect(verified?.email).toBe("user@example.com");
  });

  it("rejects tampered tokens", () => {
    process.env.NEXTAUTH_SECRET = "test-secret-for-care-tokens";
    const token = createCareAccessToken("user@example.com")!;
    const bad = token.slice(0, -2) + "xx";
    expect(verifyCareAccessToken(bad)).toBeNull();
  });
});
