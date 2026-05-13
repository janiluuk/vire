import { hasUsableCustomerContact, parseCustomerContact } from "./parse-customer-contact";

export type ContactFieldIssue = "empty" | "invalid";

/** Support form / wizard: email or phone-like string (reuses checkout parser rules). */
export function getContactFieldIssue(raw: string): ContactFieldIssue | null {
  const t = raw.trim();
  if (!t) return "empty";
  if (!hasUsableCustomerContact(parseCustomerContact(t))) return "invalid";
  return null;
}

/** Support message body — matches existing minimum before submit. */
export function getSupportMessageIssue(msg: string): "short" | null {
  return msg.trim().length < 4 ? "short" : null;
}

/** Wizard step 0 — optional hint when user typed something but not enough. */
export function getComputerDescriptionIssue(
  raw: string,
  minLen: number,
): "short" | null {
  const t = raw.trim();
  if (t.length === 0) return null;
  if (t.length < minLen) return "short";
  return null;
}
