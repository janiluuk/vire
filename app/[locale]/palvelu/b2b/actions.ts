"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sendB2bQuoteRequestEmail } from "@/lib/email/email";

const formSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  contactName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional().transform((s) => s || null),
  estimatedUnits: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((s) => s || null),
  message: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((s) => s || null),
  locale: z.enum(["fi", "en"]),
});

export async function submitB2bQuote(formData: FormData) {
  const raw = {
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    estimatedUnits: formData.get("estimatedUnits"),
    message: formData.get("message"),
    locale: formData.get("locale"),
  };

  const parsed = formSchema.safeParse({
    companyName: typeof raw.companyName === "string" ? raw.companyName : "",
    contactName: typeof raw.contactName === "string" ? raw.contactName : "",
    email: typeof raw.email === "string" ? raw.email : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    estimatedUnits:
      typeof raw.estimatedUnits === "string" ? raw.estimatedUnits : "",
    message: typeof raw.message === "string" ? raw.message : "",
    locale: raw.locale === "en" ? "en" : "fi",
  });

  const locale = parsed.success ? parsed.data.locale : "fi";

  if (!parsed.success) {
    redirect(`/${locale}/palvelu/b2b?err=validation`);
  }

  const data = parsed.data;
  const notifyTo = process.env.B2B_QUOTE_NOTIFY_EMAIL?.trim();
  if (!notifyTo) {
    redirect(`/${locale}/palvelu/b2b?err=config`);
  }

  const result = await sendB2bQuoteRequestEmail({
    notifyTo,
    companyName: data.companyName,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    estimatedUnits: data.estimatedUnits,
    message: data.message,
    locale: data.locale,
  });

  if (!result.ok) {
    redirect(`/${locale}/palvelu/b2b?err=send`);
  }

  redirect(`/${locale}/palvelu/b2b?sent=1`);
}
