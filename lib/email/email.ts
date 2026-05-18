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
import { careDashboardUrl } from "@/lib/care/care-access-token";
import { getSiteUrl } from "@/lib/site/site-url";
import { getServiceComponents } from "@/lib/data/service-components";

export type MailLocale = "fi" | "en";

function normalizeMailLocale(v: string | null | undefined): MailLocale {
  return v === "en" ? "en" : "fi";
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function orderConfirmedComponentsBlock(loc: MailLocale): string {
  const base = getSiteUrl();
  const items = getServiceComponents();
  const list = items
    .map(
      (c) =>
        `${escapeHtml(c.brand)} ${escapeHtml(c.model)} (${escapeHtml(c.capacity)})`,
    )
    .join(", ");
  const href = loc === "en" ? `${base}/en#komponentit` : `${base}/fi#komponentit`;
  if (loc === "en") {
    return `<p><strong>Parts</strong></p><p>We install new, warranted components such as: ${list}. Detailed specs and retailer links: <a href="${href}">service page — parts</a>.</p><p>Exact SKUs are confirmed for your machine on intake; components are new and covered by manufacturer warranty.</p>`;
  }
  return `<p><strong>Komponentit</strong></p><p>Asennamme uusia, takuullisia osia kuten: ${list}. Tarkemmat mitat ja ostolinkit: <a href="${href}">palvelusivu — komponentit</a>.</p><p>Tarkka malli vahvistetaan koneen mukaan käynnistyksessä; osat ovat uusia ja valmistajatakuun piirissä.</p>`;
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
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Order confirmed — Sparkki"
      : "Tilaus vahvistettu — Sparkki";
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
  const componentsExtra = orderConfirmedComponentsBlock(loc);
  const html =
    loc === "en"
      ? `<p>${greetEn}</p><p>Your order <strong>${escapeHtml(params.orderId)}</strong> has been confirmed and we have received your payment.</p>${componentsExtra}${migrationExtra}${bundlesExtra}${vmExtra}`
      : `<p>${greetFi}</p><p>Tilauksesi <strong>${escapeHtml(params.orderId)}</strong> on vahvistettu ja maksu vastaanotettu.</p>${componentsExtra}${migrationExtra}${bundlesExtra}${vmExtra}`;
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
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "USB order confirmed — Sparkki"
      : "USB-tilaus vahvistettu — Sparkki";
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

export async function sendStarterKitConfirmedEmail(params: {
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
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Starter Kit order confirmed — Sparkki"
      : "Starter Kit -tilaus vahvistettu — Sparkki";
  const html =
    loc === "en"
      ? `<p>Hello ${escapeHtml(params.customerName)},</p><p>Your Sparkki Starter Kit order <strong>${escapeHtml(params.orderId)}</strong> is paid. We ship within 3–5 business days to the address you provided.</p>`
      : `<p>Hei ${escapeHtml(params.customerName)},</p><p>Starter Kit -tilauksesi <strong>${escapeHtml(params.orderId)}</strong> on maksettu. Toimitamme 3–5 arkipäivässä antamaasi osoitteeseen.</p>`;
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendCareAccessLinkEmail(params: {
  to: string;
  customerName: string;
  locale?: string | null;
  dashboardUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const loc = normalizeMailLocale(params.locale);
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Your Sparkki Care dashboard link"
      : "Sparkki Care -hallintalinkkisi";
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
      ? `<p>${greet}</p><p>Open your <strong>Sparkki Care</strong> dashboard to see billing dates, Discord, and cancellation options:</p><p><a href="${escapeHtml(params.dashboardUrl)}">${escapeHtml(params.dashboardUrl)}</a></p><p>This link expires in 7 days. You can request a new link anytime from the same page.</p>`
      : `<p>${greet}</p><p>Avaa <strong>Sparkki Care</strong> -hallintasivu nähdäksesi laskutusajat, Discord-linkin ja peruutusvaihtoehdot:</p><p><a href="${escapeHtml(params.dashboardUrl)}">${escapeHtml(params.dashboardUrl)}</a></p><p>Linkki vanhenee 7 päivässä. Voit pyytää uuden linkin milloin tahansa samalta sivulta.</p>`;
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
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Your service is complete — Sparkki"
      : "Palvelu valmis — Sparkki";
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
      ? `<p>${greetEn}</p><p>Your order <strong>${escapeHtml(params.orderId)}</strong> is marked complete. Thank you for choosing Sparkki!</p>`
      : `<p>${greetFi}</p><p>Tilauksesi <strong>${escapeHtml(params.orderId)}</strong> on merkitty valmiiksi. Kiitos kun käytit Sparkkiä!</p>`;
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
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    params.locale === "en"
      ? "New B2B quote request — Sparkki"
      : "Uusi B2B-tarjouspyyntö — Sparkki";
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
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    params.locale === "en"
      ? "Support message from sparkki.fi — /tuki"
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

export async function sendSparkkiForGoodApplicationEmail(params: {
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
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    params.locale === "en"
      ? "Sparkki for Good — application"
      : "Sparkki for Good — hakemus";
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
    html: `<p>${params.locale === "en" ? "Application from sparkki.fi" : "Hakemus verkkosivulta (sparkki.fi)"}</p><table style="border-collapse:collapse">${htmlRows}</table>`,
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
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Welcome to Sparkki Care"
      : "Tervetuloa Sparkki Careen";
  const greet =
    params.customerName.trim().length > 0
      ? loc === "en"
        ? `Hi ${escapeHtml(params.customerName)},`
        : `Hei ${escapeHtml(params.customerName)},`
      : loc === "en"
        ? "Hello,"
        : "Hei,";
  const base = getSiteUrl();
  const dashUrl = careDashboardUrl(loc, params.to);
  const dashBlock = dashUrl
    ? loc === "en"
      ? `<p><a href="${escapeHtml(dashUrl)}">Open your Care dashboard</a> (subscription status, Discord, cancel anytime).</p>`
      : `<p><a href="${escapeHtml(dashUrl)}">Avaa Care-hallintasivu</a> (tilauksen tila, Discord, peruutus milloin tahansa).</p>`
    : "";
  const html =
    loc === "en"
      ? `<p>${greet}</p><p>Your <strong>Sparkki Care</strong> subscription is active. You get ongoing remote help, Discord priority, and tips while subscribed.</p>${dashBlock}<p>Questions? Reply to this email or use our <a href="${base}/en/tuki">support page</a>.</p>`
      : `<p>${greet}</p><p><strong>Sparkki Care</strong> -tilauksesi on nyt voimassa. Saat jatkuvaa etäapua, Discord-prioriteetin ja kuukausivinkkejä tilauksen ollessa aktiivinen.</p>${dashBlock}<p>Kysyttävää? Vastaa tähän viestiin tai käytä <a href="${base}/fi/tuki">tukisivua</a>.</p>`;
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
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const subject =
    loc === "en"
      ? "Sparkki Care — payment issue"
      : "Sparkki Care — maksuongelma";
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
      ? `<p>${greet}</p><p>We could not charge your card for <strong>Sparkki Care</strong>. Please update your payment method in the Stripe billing portal (link in your last receipt) or contact us at tuki@sparkki.fi.</p>`
      : `<p>${greet}</p><p>Emme voineet veloittaa <strong>Sparkki Care</strong> -tilauksesta. Päivitä maksutapa Stripen laskutusportaalissa (linkki edellisessä kuittissa) tai ota yhteyttä: tuki@sparkki.fi.</p>`;
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type CareUpsellKind = "day75" | "day88";

export async function sendCareUpsellEmail(params: {
  kind: CareUpsellKind;
  to: string;
  customerName: string;
  locale?: string | null;
  orderId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const loc = normalizeMailLocale(params.locale);
  const from = process.env.RESEND_FROM ?? "Sparkki <onboarding@resend.dev>";
  const base = getSiteUrl();
  const careUrl = `${base}/${loc}/care`;
  const daysLeft = params.kind === "day75" ? 15 : 2;
  const subject =
    loc === "en"
      ? params.kind === "day75"
        ? "Your Sparkki support continues — consider Care"
        : "Support ends soon — Sparkki Care"
      : params.kind === "day75"
        ? "Sparkki-tukesi jatkuu — tutustu Careen"
        : "Tuki päättyy pian — Sparkki Care";
  const greet =
    params.customerName.trim().length > 0
      ? loc === "en"
        ? `Hi ${escapeHtml(params.customerName)},`
        : `Hei ${escapeHtml(params.customerName)},`
      : loc === "en"
        ? "Hello,"
        : "Hei,";
  const bodyEn =
    params.kind === "day75"
      ? `<p>${greet}</p><p>About 75 days have passed since we completed your Sparkki service (order <strong>${escapeHtml(params.orderId)}</strong>). Your included email support runs for 90 days after delivery — about <strong>${daysLeft} days</strong> remain.</p><p><strong>Sparkki Care</strong> continues remote help, Discord priority, and practical tips for a small monthly fee. Cancel anytime.</p><p><a href="${careUrl}">Learn about Sparkki Care →</a></p>`
      : `<p>${greet}</p><p>Your included Sparkki support for order <strong>${escapeHtml(params.orderId)}</strong> ends in about <strong>${daysLeft} days</strong>.</p><p>With <strong>Sparkki Care</strong> you keep calm, ongoing help after the free period — subscribe before support ends.</p><p><a href="${careUrl}">Subscribe to Sparkki Care →</a></p>`;
  const bodyFi =
    params.kind === "day75"
      ? `<p>${greet}</p><p>Noin 75 päivää on kulunut Sparkki-palvelun valmistumisesta (tilaus <strong>${escapeHtml(params.orderId)}</strong>). Mukana tullut sähköpostituki kestää 90 päivää toimituksesta — noin <strong>${daysLeft} päivää</strong> jäljellä.</p><p><strong>Sparkki Care</strong> jatkaa etäapua, Discord-prioriteettia ja käytännön vinkkejä pienellä kuukausimaksulla. Voit lopettaa milloin tahansa.</p><p><a href="${careUrl}">Tutustu Sparkki Careen →</a></p>`
      : `<p>${greet}</p><p>Tilauksen <strong>${escapeHtml(params.orderId)}</strong> mukainen Sparkki-tuki päättyy noin <strong>${daysLeft} päivän</strong> kuluttua.</p><p><strong>Sparkki Care</strong> -tilauksella saat rauhallisen jatkotuen maksuttoman jakson jälkeen — tilaa ennen tuen päättymistä.</p><p><a href="${careUrl}">Tilaa Sparkki Care →</a></p>`;
  const html = loc === "en" ? bodyEn : bodyFi;
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
