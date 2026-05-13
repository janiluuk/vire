"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { OrderStatus } from "@prisma/client";
import { recordAdminAudit } from "@/lib/admin/admin-audit";
import { authOptions } from "@/lib/auth/auth-options";
import { sendOrderDoneEmail } from "@/lib/email/email";
import { prisma } from "@/lib/db/prisma";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  return session;
}

function actorEmail(session: Awaited<ReturnType<typeof requireAdminSession>>) {
  return session.user?.email ?? "unknown";
}

export async function updateOrderStatus(formData: FormData) {
  const session = await requireAdminSession();
  const orderId = formData.get("orderId");
  const status = formData.get("status");
  if (typeof orderId !== "string" || typeof status !== "string") {
    return;
  }
  const allowed: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "IN_PROGRESS",
    "DONE",
    "CANCELLED",
  ];
  if (!allowed.includes(status as OrderStatus)) {
    return;
  }
  const prev = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: status as OrderStatus,
        completedAt: status === "DONE" ? new Date() : null,
      },
    }),
    prisma.adminAuditLog.create({
      data: {
        actorEmail: actorEmail(session),
        action: "order.status",
        entity: "Order",
        entityId: orderId,
        metadata: { from: prev?.status ?? null, to: status },
      },
    }),
  ]);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderNotes(formData: FormData) {
  const session = await requireAdminSession();
  const orderId = formData.get("orderId");
  const notes = formData.get("adminNotes");
  if (typeof orderId !== "string") return;
  const text = typeof notes === "string" ? notes : "";
  const prev = await prisma.order.findUnique({
    where: { id: orderId },
    select: { adminNotes: true },
  });
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { adminNotes: text },
    }),
    prisma.adminAuditLog.create({
      data: {
        actorEmail: actorEmail(session),
        action: "order.admin_notes",
        entity: "Order",
        entityId: orderId,
        metadata: {
          prevLen: prev?.adminNotes?.length ?? 0,
          newLen: text.length,
        },
      },
    }),
  ]);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateDataMigrationNotes(formData: FormData) {
  const session = await requireAdminSession();
  const orderId = formData.get("orderId");
  const notes = formData.get("dataMigrationNotes");
  if (typeof orderId !== "string") return;
  const text = typeof notes === "string" ? notes : "";
  const trimmed = text.trim().slice(0, 4000);
  const prev = await prisma.order.findUnique({
    where: { id: orderId },
    select: { dataMigrationNotes: true },
  });
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { dataMigrationNotes: trimmed.length > 0 ? trimmed : null },
    }),
    prisma.adminAuditLog.create({
      data: {
        actorEmail: actorEmail(session),
        action: "order.data_migration_notes",
        entity: "Order",
        entityId: orderId,
        metadata: {
          prevLen: prev?.dataMigrationNotes?.length ?? 0,
          newLen: trimmed.length,
        },
      },
    }),
  ]);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function sendOrderDone(formData: FormData) {
  const session = await requireAdminSession();
  const orderId = formData.get("orderId");
  if (typeof orderId !== "string") return;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  if (!order.customerEmail?.trim()) {
    await recordAdminAudit({
      actorEmail: actorEmail(session),
      action: "order.done_email_skipped_no_recipient",
      entity: "Order",
      entityId: orderId,
      metadata: {},
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    redirect(`/admin/orders/${orderId}?email=failed`);
  }
  const result = await sendOrderDoneEmail({
    to: order.customerEmail,
    orderId: order.id,
    customerName: order.customerName ?? "",
    locale: order.locale,
  });
  await recordAdminAudit({
    actorEmail: actorEmail(session),
    action: result.ok ? "order.done_email_sent" : "order.done_email_failed",
    entity: "Order",
    entityId: orderId,
    metadata: { ok: result.ok },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(
    `/admin/orders/${orderId}?email=${result.ok ? "sent" : "failed"}`,
  );
}
