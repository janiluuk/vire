"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ModelCheckStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  return session;
}

export async function createComputerModel(formData: FormData) {
  await requireAdminSession();
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yf = String(formData.get("yearFrom") ?? "").trim();
  const yt = String(formData.get("yearTo") ?? "").trim();
  if (!make || !model) {
    redirect("/admin/models?error=missing");
  }
  const yearFrom = yf ? parseInt(yf, 10) : null;
  const yearTo = yt ? parseInt(yt, 10) : null;
  if ((yf && Number.isNaN(yearFrom)) || (yt && Number.isNaN(yearTo))) {
    redirect("/admin/models?error=year");
  }
  try {
    const row = await prisma.computerModel.create({
      data: {
        make,
        model,
        yearFrom,
        yearTo,
        status: "UNCHECKED",
      },
    });
    revalidatePath("/admin/models");
    redirect(`/admin/models/${row.id}`);
  } catch {
    redirect("/admin/models?error=duplicate");
  }
}

export async function updateComputerModel(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/models?error=id");

  const compatibleRaw = String(formData.get("compatible") ?? "");
  const compatible =
    compatibleRaw === "true" ? true : compatibleRaw === "false" ? false : null;
  if (compatible === null) {
    redirect(`/admin/models/${id}?error=compatible`);
  }

  const verdict = String(formData.get("verdict") ?? "").trim();
  if (!verdict) {
    redirect(`/admin/models/${id}?error=verdict`);
  }

  const ssdSlot = String(formData.get("ssdSlot") ?? "").trim() || null;
  const maxRamRaw = String(formData.get("maxRamGb") ?? "").trim();
  const maxRamGb = maxRamRaw ? parseInt(maxRamRaw, 10) : null;
  if (maxRamRaw && Number.isNaN(maxRamGb)) {
    redirect(`/admin/models/${id}?error=ram`);
  }
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const status: ModelCheckStatus = compatible ? "APPROVED" : "REJECTED";

  await prisma.computerModel.update({
    where: { id },
    data: {
      compatible,
      verdict,
      ssdSlot,
      maxRamGb,
      notes,
      status,
      checkedAt: new Date(),
      checkedBy: session.user?.email ?? session.user?.id ?? "admin",
    },
  });
  revalidatePath("/admin/models");
  revalidatePath(`/admin/models/${id}`);
  redirect(`/admin/models/${id}?saved=1`);
}
