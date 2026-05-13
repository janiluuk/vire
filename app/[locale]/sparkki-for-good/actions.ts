"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sendVireForGoodApplicationEmail } from "@/lib/email/email";
import {
  hasUsableCustomerContact,
  parseCustomerContact,
} from "@/lib/contact/parse-customer-contact";

const FOR_GOOD_PATH = "/sparkki-for-good";

const schema = z.object({
  reason: z.string().trim().min(1).max(2000),
  contact: z.string().trim().min(5).max(320),
  locale: z.enum(["fi", "en"]),
});

export async function submitVireForGood(formData: FormData) {
  const raw = {
    reason: formData.get("reason"),
    contact: formData.get("contact"),
    locale: formData.get("locale"),
  };

  const parsed = schema.safeParse({
    reason: typeof raw.reason === "string" ? raw.reason : "",
    contact: typeof raw.contact === "string" ? raw.contact : "",
    locale: raw.locale === "en" ? "en" : "fi",
  });

  const locale = parsed.success ? parsed.data.locale : "fi";
  if (!parsed.success) {
    redirect(`/${locale}${FOR_GOOD_PATH}?err=validation`);
  }

  const p = parseCustomerContact(parsed.data.contact);
  if (!hasUsableCustomerContact(p)) {
    redirect(`/${locale}${FOR_GOOD_PATH}?err=validation`);
  }

  const notifyTo =
    process.env.VIRE_FOR_GOOD_NOTIFY_EMAIL?.trim() ||
    process.env.B2B_QUOTE_NOTIFY_EMAIL?.trim();
  if (!notifyTo) {
    redirect(`/${locale}${FOR_GOOD_PATH}?err=config`);
  }

  const ok = await sendVireForGoodApplicationEmail({
    notifyTo,
    reason: parsed.data.reason,
    contactRaw: parsed.data.contact.trim(),
    contactEmail: p.email,
    contactPhone: p.phone,
    locale: parsed.data.locale,
  });

  if (!ok.ok) {
    redirect(`/${locale}${FOR_GOOD_PATH}?err=send`);
  }

  redirect(`/${locale}${FOR_GOOD_PATH}?sent=1`);
}
