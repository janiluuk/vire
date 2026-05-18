"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { recordAdminAudit } from "@/lib/admin/admin-audit";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/admin/login");
  return session;
}

export async function updateStarterKitOrder(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/starter-kit");

  const status = String(formData.get("status") ?? "").trim();
  const tracking = String(formData.get("trackingNumber") ?? "").trim() || null;
  const markShipped = formData.get("markShipped") === "1";

  const data: {
    status?: string;
    trackingNumber?: string | null;
    shippedAt?: Date | null;
  } = {};

  if (["pending", "paid", "shipped", "cancelled"].includes(status)) {
    data.status = status;
  }
  if (tracking !== null) data.trackingNumber = tracking;
  if (markShipped) {
    data.status = "shipped";
    data.shippedAt = new Date();
  }

  await prisma.starterKitOrder.update({
    where: { id },
    data,
  });

  await recordAdminAudit({
    actorEmail: session.user?.email ?? "unknown",
    action: "starter_kit.update",
    entity: "StarterKitOrder",
    entityId: id,
    metadata: data,
  });

  revalidatePath("/admin/starter-kit");
  revalidatePath(`/admin/starter-kit/${id}`);
  redirect(`/admin/starter-kit/${id}?saved=1`);
}
