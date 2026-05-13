import { Resend } from "resend";
import type { PortableVmHandoff } from "@prisma/client";
import {
  APP_BUNDLE_CONFIRM_LABEL,
  type AppBundleId,
  normalizeAppBundleIds,
} from "@/lib/billing/app-bundles";
import {
  PORTABLE_VM_HANDOFF_LABEL,
  isPortableVmHandoff,
} from "@/lib/billing/portable-vm";
import { getSiteUrl } from "@/lib/site/site-url";

export type MailLocale = "fi" | "en";

function normalizeMailLocale(v: string | null | undefined): MailLocale {
  return v === "en" ? "en" : "fi";
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function orderConfirmedMigrationBlock(
  loc: MailLocale,
  size: "standard" | "large",
): string {
  if (loc === "en") {
    const scope =
      size === "large"
        ? "You chose the <strong>large data</strong> transfer option."
        : "You chose the <strong>standard</strong> data transfer option.";
    return `<p>${scope}</p><p><strong>Before you hand in the machine</strong></p><ul><li>Back up important files to an external drive or cloud you control.</li><li>Have passwords or recovery options ready for accounts you want moved (we do not store sensitive credentials in email).</li><li>Tell us if you rely on specific apps (e.g. Outlook, Adobe) so we can plan the transfer.</li></ul>`;
  }
  const scope =
    size === "large"
      ? "Valitsit <strong>suuren tiedonsiirron</strong> (arvio &gt;100 GB dataa)."
      : "Valitsit <strong>tavallisen tiedonsiirron</strong>.";
  return `<p>${scope}</p><p><strong>Ennen koneen luovutusta</strong></p><ul><li>Varmuuskopioi tärkeät tiedostot ulkoiselle levylle tai pilveen, jota hallitset itse.</li><li>Pidä salasanat tai palautusvaihtoehdot käden ulottuvilla tileille, jotka haluat siirrettäväksi (emme tallenna arkaluontoisia tunnuksia sähköpostissa).</li><li>Kerro, jos käytät tiettyjä ohjelmia (esim. Outlook, Adobe), jotta siirto voidaan suunnitella.</li></ul>`;
}

function orderConfirmedBundlesBlock(
  loc: MailLocale,
  ids: AppBundleId[],
): string {
  if (!ids.length) return "";
  const items = ids
    .map((id) => {
      const label = APP_BUNDLE_CONFIRM_LABEL[id][loc];
      return `<li>${escapeHtml(label)}</li>`;
    })
    .join("");
  if (loc === "en") {
    return `<p><strong>Optional app packs</strong> included in your order:</p><ul>${items}</ul>`;
  }
  return `<p><strong>Valitut ohjelmapaketit</strong> tilauksessasi:</p><ul>${items}</ul>`;
}

function orderConfirmedPortableVmBlock(
  loc: MailLocale,
  handoff: "CUSTOMER_STORAGE" | "SHIPPED_MEDIA",
): string {
  const label = PORTABLE_VM_HANDOFF_LABEL[handoff][loc];
  if (loc === "en") {
    return `<p><strong>Portable VM / disk image add-on</strong> (${escapeHtml(label)}).</p><p>We will agree the exact image format and verification steps during intake. You remain responsible for any operating-system licensing if you run a commercial OS inside a VM.</p>`;
  }
  return `<p><strong>Kannettava virtuaalikone / levykuva -lisä</strong> (${escapeHtml(label)}).</p><p>Tarkan kuvaformaatin ja tarkistusaskeleet sovimme käynnistyksessä. Kaupallisen käyttöjärjestelmän lisensointi mahdollisessa VM:ssä on asiakkaan vastuulla.</p>`;
}

export async function sendOrderConfirmedEmail(params: {
  to: string;
  orderId: string;
  /** Empty when the customer did not give a name at checkout. */
  customerName: string;
  locale?: string | null;
  dataMigration?: boolean;
  dataMigrationSize?: "standard" | "large" | null;
  /** Raw slugs from `Order.appBundleIds`; invalid entries are ignored. */
  appBundleIds?: string[] | null;
  portableVmAddon?: boolean;
  portableVmHandoff?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const loc = normalizeMailLocale(params.locale);
  const from = process.env.RESEND_FROM ?? "Vire <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Order confirmed — Vire"
      : "Tilaus vahvistettu — Vire";
  const migrationExtra =
    params.dataMigration &&
    (params.dataMigrationSize === "standard" || params.dataMigrationSize === "large")
      ? orderConfirmedMigrationBlock(loc, params.dataMigrationSize)
      : "";
  const bundleIds = normalizeAppBundleIds(params.appBundleIds ?? []);
  const bundlesExtra =
    bundleIds.length > 0 ? orderConfirmedBundlesBlock(loc, bundleIds) : "";
  let vmHandoff: PortableVmHandoff | null = null;
  if (
    params.portableVmAddon &&
    params.portableVmHandoff != null &&
    isPortableVmHandoff(params.portableVmHandoff)
  ) {
    vmHandoff = params.portableVmHandoff;
  }
  const vmExtra =
    vmHandoff != null ? orderConfirmedPortableVmBlock(loc, vmHandoff) : "";
  const greetEn =
    params.customerName.trim().length > 0
      ? `Hello ${escapeHtml(params.customerName)},`
      : "Hello,";
  const greetFi =
    params.customerName.trim().length > 0
      ? `Hei ${escapeHtml(params.customerName)},`
      : "Hei,";
  const html =
    loc === "en"
      ? `<p>${greetEn}</p><p>Your order <strong>${escapeHtml(params.orderId)}</strong> has been confirmed and we have received your payment.</p>${migrationExtra}${bundlesExtra}${vmExtra}`
      : `<p>${greetFi}</p><p>Tilauksesi <strong>${escapeHtml(params.orderId)}</strong> on vahvistettu ja maksu vastaanotettu.</p>${migrationExtra}${bundlesExtra}${vmExtra}`;
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendUsbConfirmedEmail(params: {
  to: string;
  orderId: string;
  customerName: string;
  locale?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const loc = normalizeMailLocale(params.locale);
  const from = process.env.RESEND_FROM ?? "Vire <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "USB order confirmed — Vire"
      : "USB-tilaus vahvistettu — Vire";
  const html =
    loc === "en"
      ? `<p>Hello ${escapeHtml(params.customerName)},</p><p>Your Linux USB stick order <strong>${escapeHtml(params.orderId)}</strong> is paid. We will ship it to the address you provided.</p>`
      : `<p>Hei ${escapeHtml(params.customerName)},</p><p>Linux-USB-tilauksesi <strong>${escapeHtml(params.orderId)}</strong> on maksettu. Toimitamme tilauksen osoitteeseesi.</p>`;
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendOrderDoneEmail(params: {
  to: string;
  orderId: string;
  customerName: string;
  locale?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!params.to.trim()) {
    return { ok: false, error: "missing_recipient" };
  }
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const loc = normalizeMailLocale(params.locale);
  const from = process.env.RESEND_FROM ?? "Vire <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Your service is complete — Vire"
      : "Palvelu valmis — Vire";
  const greetEn =
    params.customerName.trim().length > 0
      ? `Hello ${escapeHtml(params.customerName)},`
      : "Hello,";
  const greetFi =
    params.customerName.trim().length > 0
      ? `Hei ${escapeHtml(params.customerName)},`
      : "Hei,";
  const html =
    loc === "en"
      ? `<p>${greetEn}</p><p>Your order <strong>${escapeHtml(params.orderId)}</strong> is marked complete. Thank you for choosing Vire!</p>`
      : `<p>${greetFi}</p><p>Tilauksesi <strong>${escapeHtml(params.orderId)}</strong> on merkitty valmiiksi. Kiitos kun käytit Vireä!</p>`;
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendB2bQuoteRequestEmail(params: {
  notifyTo: string;
  details: string;
  contactRaw: string;
  contactEmail: string | null;
  contactPhone: string | null;
  locale: "fi" | "en";
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const from = process.env.RESEND_FROM ?? "Vire <onboarding@resend.dev>";
  const subject =
    params.locale === "en"
      ? "New B2B quote request — Vire"
      : "Uusi B2B-tarjouspyyntö — Vire";
  const rows = [
    ["Details", params.details],
    ["Contact (as entered)", params.contactRaw],
    ["Parsed email", params.contactEmail ?? "—"],
    ["Parsed phone", params.contactPhone ?? "—"],
    ["Locale", params.locale],
  ] as const;
  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;padding:6px 12px 6px 0;vertical-align:top">${escapeHtml(k)}</th><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const { error } = await resend.emails.send({
    from,
    to: params.notifyTo,
    subject,
    html: `<p>${params.locale === "en" ? "Quote request from the website." : "Tarjouspyyntö verkkosivulta."}</p><table style="border-collapse:collapse">${htmlRows}</table>`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendSupportContactEmail(params: {
  notifyTo: string;
  message: string;
  contactRaw: string;
  contactEmail: string | null;
  contactPhone: string | null;
  locale: "fi" | "en";
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const from = process.env.RESEND_FROM ?? "Vire <onboarding@resend.dev>";
  const subject =
    params.locale === "en"
      ? "Support message from vire.fi — /tuki"
      : "Tukipyyntö verkkosivulta — /tuki";
  const who =
    params.contactEmail != null
      ? `${escapeHtml(params.contactRaw)} <${escapeHtml(params.contactEmail)}>`
      : escapeHtml(params.contactRaw);
  const { error } = await resend.emails.send({
    from,
    to: params.notifyTo,
    replyTo: params.contactEmail ?? undefined,
    subject,
    html: `<p>${params.locale === "en" ? "From:" : "Lähettäjä:"} ${who}</p><p>${escapeHtml(params.message)}</p>`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendVireForGoodApplicationEmail(params: {
  notifyTo: string;
  reason: string;
  contactRaw: string;
  contactEmail: string | null;
  contactPhone: string | null;
  locale: "fi" | "en";
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const from = process.env.RESEND_FROM ?? "Vire <onboarding@resend.dev>";
  const subject =
    params.locale === "en"
      ? "Vire for Good — application"
      : "Vire for Good — hakemus";
  const rows = [
    ["Reason", params.reason],
    ["Contact (as entered)", params.contactRaw],
    ["Parsed email", params.contactEmail ?? "—"],
    ["Parsed phone", params.contactPhone ?? "—"],
    ["Locale", params.locale],
  ] as const;
  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;padding:6px 12px 6px 0;vertical-align:top">${escapeHtml(k)}</th><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const { error } = await resend.emails.send({
    from,
    to: params.notifyTo,
    replyTo: params.contactEmail ?? undefined,
    subject,
    html: `<p>${params.locale === "en" ? "Application from vire.fi" : "Hakemus verkkosivulta"}</p><table style="border-collapse:collapse">${htmlRows}</table>`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendCareSubscriptionWelcomeEmail(params: {
  to: string;
  customerName: string;
  locale?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const loc = normalizeMailLocale(params.locale);
  const from = process.env.RESEND_FROM ?? "Vire <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Welcome to Vire Care"
      : "Tervetuloa Vire Careen";
  const greet =
    params.customerName.trim().length > 0
      ? loc === "en"
        ? `Hi ${escapeHtml(params.customerName)},`
        : `Hei ${escapeHtml(params.customerName)},`
      : loc === "en"
        ? "Hello,"
        : "Hei,";
  const base = getSiteUrl();
  const html =
    loc === "en"
      ? `<p>${greet}</p><p>Your <strong>Vire Care</strong> subscription is active. You get ongoing remote help, Discord priority, and tips while subscribed.</p><p>Questions? Reply to this email or use our <a href="${base}/en/tuki">support page</a>.</p>`
      : `<p>${greet}</p><p><strong>Vire Care</strong> -tilauksesi on nyt voimassa. Saat jatkuvaa etäapua, Discord-prioriteetin ja kuukausivinkkejä tilauksen ollessa aktiivinen.</p><p>Kysyttävää? Vastaa tähän viestiin tai käytä <a href="${base}/fi/tuki">tukisivua</a>.</p>`;
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendCarePaymentFailedEmail(params: {
  to: string;
  customerName: string;
  locale?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const loc = normalizeMailLocale(params.locale);
  const from = process.env.RESEND_FROM ?? "Vire <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Vire Care — payment issue"
      : "Vire Care — maksuongelma";
  const greet =
    params.customerName.trim().length > 0
      ? loc === "en"
        ? `Hi ${escapeHtml(params.customerName)},`
        : `Hei ${escapeHtml(params.customerName)},`
      : loc === "en"
        ? "Hello,"
        : "Hei,";
  const html =
    loc === "en"
      ? `<p>${greet}</p><p>We could not charge your card for <strong>Vire Care</strong>. Please update your payment method in the Stripe billing portal (link in your last receipt) or contact us at tuki@vire.fi.</p>`
      : `<p>${greet}</p><p>Emme voineet veloittaa <strong>Vire Care</strong> -tilauksesta. Päivitä maksutapa Stripen laskutusportaalissa (linkki edellisessä kuittissa) tai ota yhteyttä: tuki@vire.fi.</p>`;
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
