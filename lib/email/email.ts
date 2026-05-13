import { Resend } from "resend";

export type MailLocale = "fi" | "en";

function normalizeMailLocale(v: string | null | undefined): MailLocale {
  return v === "en" ? "en" : "fi";
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function orderConfirmedExtrasBlock(
  loc: MailLocale,
  params: {
    bundleIds: string[];
    portableVm: boolean;
  },
): string {
  if (params.bundleIds.length === 0 && !params.portableVm) return "";
  const bundleLabelsFi: Record<string, string> = {
    local_ai: "Paikallinen AI -paketti",
    media_creator: "Media-paketti",
    music_production: "Musiikintuotanto-paketti",
    dev_essentials: "Kehittäjäpaketti",
  };
  const bundleLabelsEn: Record<string, string> = {
    local_ai: "Local AI pack",
    media_creator: "Media creator pack",
    music_production: "Music production pack",
    dev_essentials: "Developer essentials pack",
  };
  const labels = loc === "en" ? bundleLabelsEn : bundleLabelsFi;
  const bundlePart =
    params.bundleIds.length === 0
      ? ""
      : loc === "en"
        ? `<p><strong>Software packs</strong></p><ul>${params.bundleIds.map((id) => `<li>${escapeHtml(labels[id] ?? id)}</li>`).join("")}</ul>`
        : `<p><strong>Ohjelmistopaketit</strong></p><ul>${params.bundleIds.map((id) => `<li>${escapeHtml(labels[id] ?? id)}</li>`).join("")}</ul>`;
  const vmPart = params.portableVm
    ? loc === "en"
      ? "<p><strong>Portable VM / disk image</strong> is included. We will agree format and medium separately; you are responsible for OS licensing if you run Windows (or similar) in a VM.</p>"
      : "<p><strong>VM-/levykuvalisä</strong> on tilauksella. Formaatti ja väline sovitaan erikseen; vastaat käyttöjärjestelmän lisensseistä, jos käytät esim. Windowsia virtuaalikoneessa.</p>"
    : "";
  return `${bundlePart}${vmPart}`;
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

export async function sendOrderConfirmedEmail(params: {
  to: string;
  orderId: string;
  /** Empty when the customer did not give a name at checkout. */
  customerName: string;
  locale?: string | null;
  dataMigration?: boolean;
  dataMigrationSize?: "standard" | "large" | null;
  appBundleIds?: string[] | null;
  portableVmAddon?: boolean;
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
  const bundleIds = params.appBundleIds?.filter(Boolean) ?? [];
  const extrasExtra = orderConfirmedExtrasBlock(loc, {
    bundleIds,
    portableVm: Boolean(params.portableVmAddon),
  });
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
      ? `<p>${greetEn}</p><p>Your order <strong>${escapeHtml(params.orderId)}</strong> has been confirmed and we have received your payment.</p>${migrationExtra}${extrasExtra}`
      : `<p>${greetFi}</p><p>Tilauksesi <strong>${escapeHtml(params.orderId)}</strong> on vahvistettu ja maksu vastaanotettu.</p>${migrationExtra}${extrasExtra}`;
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
