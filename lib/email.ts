import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendOrderConfirmedEmail(params: {
  to: string;
  orderId: string;
  customerName: string;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }
  const from = process.env.RESEND_FROM ?? "Verso <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: "Tilaus vahvistettu — Verso",
    html: `<p>Hei ${params.customerName},</p><p>Tilauksesi ${params.orderId} on vahvistettu.</p>`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
