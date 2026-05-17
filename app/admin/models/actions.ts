"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ModelCheckStatus } from "@prisma/client";
import { recordAdminAudit } from "@/lib/admin/admin-audit";
import { parseComputerModelCsv } from "@/lib/admin/parse-computer-model-csv";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  return session;
}

export async function createComputerModel(formData: FormData) {
  const session = await requireAdminSession();
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
    await recordAdminAudit({
      actorEmail: session.user?.email ?? "unknown",
      action: "model.create",
      entity: "ComputerModel",
      entityId: row.id,
      metadata: { make, model },
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

  const prev = await prisma.computerModel.findUnique({
    where: { id },
    select: {
      compatible: true,
      verdict: true,
      status: true,
    },
  });

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
  await recordAdminAudit({
    actorEmail: session.user?.email ?? "unknown",
    action: "model.verdict",
    entity: "ComputerModel",
    entityId: id,
    metadata: {
      from: prev
        ? {
            compatible: prev.compatible,
            verdict: prev.verdict,
            status: prev.status,
          }
        : null,
      to: { compatible, verdict, status },
    },
  });
  revalidatePath("/admin/models");
  revalidatePath(`/admin/models/${id}`);
  redirect(`/admin/models/${id}?saved=1`);
}

export async function importComputerModelsCsv(formData: FormData) {
  const session = await requireAdminSession();
  const csv = String(formData.get("csv") ?? "").trim();
  if (!csv) {
    redirect("/admin/models?error=csv_empty");
  }

  const { rows, errors } = parseComputerModelCsv(csv);
  if (rows.length === 0) {
    redirect(
      `/admin/models?error=csv_parse&detail=${errors[0]?.message ?? "empty"}`,
    );
  }

  let created = 0;
  let skipped = 0;
  for (const row of rows) {
    const status =
      row.compatible === true
        ? "APPROVED"
        : row.compatible === false
          ? "REJECTED"
          : "UNCHECKED";
    try {
      await prisma.computerModel.create({
        data: {
          make: row.make,
          model: row.model,
          yearFrom: row.yearFrom,
          yearTo: row.yearTo,
          compatible: row.compatible,
          verdict: row.verdict,
          ssdSlot: row.ssdSlot,
          maxRamGb: row.maxRamGb,
          status,
          ...(row.compatible != null
            ? {
                checkedAt: new Date(),
                checkedBy: session.user?.email ?? session.user?.id ?? "admin",
              }
            : {}),
        },
      });
      created++;
    } catch {
      skipped++;
    }
  }

  await recordAdminAudit({
    actorEmail: session.user?.email ?? "unknown",
    action: "model.csv_import",
    entity: "ComputerModel",
    entityId: "bulk",
    metadata: { created, skipped, parseErrors: errors.length },
  });

  revalidatePath("/admin/models");
  redirect(
    `/admin/models?imported=${created}&skipped=${skipped}&parseErrors=${errors.length}`,
  );
}
