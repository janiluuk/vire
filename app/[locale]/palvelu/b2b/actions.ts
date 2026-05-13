"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sendB2bQuoteRequestEmail } from "@/lib/email/email";
import {
  hasUsableCustomerContact,
  parseCustomerContact,
} from "@/lib/contact/parse-customer-contact";

const formSchema = z.object({
  details: z.string().trim().min(1).max(4000),
  contact: z.string().trim().min(5).max(320),
  locale: z.enum(["fi", "en"]),
});

export async function submitB2bQuote(formData: FormData) {
  const raw = {
    details: formData.get("details"),
    contact: formData.get("contact"),
    locale: formData.get("locale"),
  };

  const parsed = formSchema.safeParse({
    details: typeof raw.details === "string" ? raw.details : "",
    contact: typeof raw.contact === "string" ? raw.contact : "",
    locale: raw.locale === "en" ? "en" : "fi",
  });

  const locale = parsed.success ? parsed.data.locale : "fi";

  if (!parsed.success) {
    redirect(`/${locale}/palvelu/b2b?err=validation`);
  }

  const contact = parseCustomerContact(parsed.data.contact);
  if (!hasUsableCustomerContact(contact)) {
    redirect(`/${locale}/palvelu/b2b?err=validation`);
  }

  const data = parsed.data;
  const notifyTo = process.env.B2B_QUOTE_NOTIFY_EMAIL?.trim();
  if (!notifyTo) {
    redirect(`/${locale}/palvelu/b2b?err=config`);
  }

  const result = await sendB2bQuoteRequestEmail({
    notifyTo,
    details: data.details,
    contactRaw: data.contact.trim(),
    contactEmail: contact.email,
    contactPhone: contact.phone,
    locale: data.locale,
  });

  if (!result.ok) {
    redirect(`/${locale}/palvelu/b2b?err=send`);
  }

  redirect(`/${locale}/palvelu/b2b?sent=1`);
}
