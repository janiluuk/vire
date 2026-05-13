const SIMPLE_EMAIL =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Single-field "phone or email" from public forms. Prefer plain email
 * or a phone-like string; avoid inferring both from one ambiguous token.
 */
export function parseCustomerContact(raw: string): {
  email: string | null;
  phone: string | null;
} {
  const s = raw.trim();
  if (!s) return { email: null, phone: null };
  if (SIMPLE_EMAIL.test(s)) {
    return { email: s.toLowerCase(), phone: null };
  }
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 7) {
    return { email: null, phone: s };
  }
  if (s.includes("@")) {
    return { email: s.toLowerCase(), phone: null };
  }
  return { email: null, phone: s };
}

export function hasUsableCustomerContact(parsed: {
  email: string | null;
  phone: string | null;
}): boolean {
  return Boolean(parsed.email ?? parsed.phone);
}
