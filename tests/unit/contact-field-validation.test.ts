import { describe, expect, it } from "vitest";
import { getContactFieldIssue } from "@/lib/contact/contact-field-validation";
import {
  hasUsableCustomerContact,
  parseCustomerContact,
} from "@/lib/contact/parse-customer-contact";

describe("parseCustomerContact", () => {
  it("accepts a simple email", () => {
    expect(parseCustomerContact("maija@example.com")).toEqual({
      email: "maija@example.com",
      phone: null,
    });
  });

  it("accepts phone numbers with at least 7 digits", () => {
    expect(parseCustomerContact("+358 40 123 4567")).toEqual({
      email: null,
      phone: "+358 40 123 4567",
    });
  });

  it("rejects garbage without @ or enough digits", () => {
    expect(parseCustomerContact("not-an-email")).toEqual({
      email: null,
      phone: null,
    });
    expect(hasUsableCustomerContact(parseCustomerContact("not-an-email"))).toBe(
      false,
    );
  });

  it("rejects malformed email with @", () => {
    expect(parseCustomerContact("foo@")).toEqual({
      email: null,
      phone: null,
    });
    expect(parseCustomerContact("user@nodot")).toEqual({
      email: null,
      phone: null,
    });
  });
});

describe("getContactFieldIssue", () => {
  it("returns empty for whitespace-only", () => {
    expect(getContactFieldIssue("   ")).toBe("empty");
  });

  it("returns invalid for non-contact strings", () => {
    expect(getContactFieldIssue("not-an-email")).toBe("invalid");
    expect(getContactFieldIssue("abc")).toBe("invalid");
  });

  it("returns null for valid email or phone", () => {
    expect(getContactFieldIssue("e2e@example.com")).toBeNull();
    expect(getContactFieldIssue("+358401234567")).toBeNull();
  });
});
