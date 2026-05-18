import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  sendCareUpsellEmail,
  type CareUpsellKind,
} from "@/lib/email/email";

const MS_PER_DAY = 86_400_000;

function daysSinceCompleted(completedAt: Date, days: number): Date {
  return new Date(completedAt.getTime() + days * MS_PER_DAY);
}

async function hasActiveCare(customerEmail: string): Promise<boolean> {
  const sub = await prisma.careSubscription.findUnique({
    where: { customerEmail: customerEmail.toLowerCase() },
    select: { status: true },
  });
  return sub?.status === "ACTIVE";
}

export type CareLifecycleRunResult = {
  kind: CareUpsellKind;
  scanned: number;
  sent: number;
  skipped: number;
  errors: number;
};

async function runUpsellBatch(kind: CareUpsellKind): Promise<CareLifecycleRunResult> {
  const dayTarget = kind === "day75" ? 75 : 88;
  const sentField = kind === "day75" ? "careUpsell75SentAt" : "careUpsell88SentAt";
  const now = new Date();

  const orders = await prisma.order.findMany({
    where: {
      status: OrderStatus.DONE,
      completedAt: { not: null },
      customerEmail: { not: null },
      [sentField]: null,
    },
    select: {
      id: true,
      completedAt: true,
      customerEmail: true,
      customerName: true,
      locale: true,
      carePackageInterest: true,
    },
    take: 200,
  });

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const order of orders) {
    const completedAt = order.completedAt;
    const email = order.customerEmail?.trim().toLowerCase();
    if (!completedAt || !email) {
      skipped++;
      continue;
    }

    if (now < daysSinceCompleted(completedAt, dayTarget)) {
      skipped++;
      continue;
    }

    if (order.carePackageInterest === "CARE_PLUS" || order.carePackageInterest === "CARE_PRO") {
      skipped++;
      continue;
    }

    if (await hasActiveCare(email)) {
      skipped++;
      continue;
    }

    const result = await sendCareUpsellEmail({
      kind,
      to: email,
      customerName: order.customerName ?? "",
      locale: order.locale,
      orderId: order.id,
    });

    if (!result.ok) {
      errors++;
      continue;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { [sentField]: new Date() },
    });
    sent++;
  }

  return {
    kind,
    scanned: orders.length,
    sent,
    skipped,
    errors,
  };
}

export async function runCareLifecycleEmails(): Promise<CareLifecycleRunResult[]> {
  return Promise.all([runUpsellBatch("day75"), runUpsellBatch("day88")]);
}
