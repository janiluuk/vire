"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { recordAdminAudit } from "@/lib/admin/admin-audit";
import { prisma } from "@/lib/db/prisma";
import { guideMdxPath } from "@/lib/content/guide-content";
import { stringifyGuideMdx } from "@/lib/content/guide-mdx";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  return session;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function guideFail(editorSlug: string | null, code: string): never {
  const target =
    editorSlug && editorSlug.length > 0
      ? `/admin/guides/${editorSlug}`
      : "/admin/guides/new";
  redirect(`${target}?error=${code}`);
}

function assertValidSlug(slug: string, editorSlug: string | null) {
  if (!SLUG_RE.test(slug)) guideFail(editorSlug, "slug");
}

function assertDifficulty(
  d: string,
  editorSlug: string | null,
): "easy" | "medium" | "hard" {
  if (d === "easy" || d === "medium" || d === "hard") return d;
  guideFail(editorSlug, "difficulty");
}

export async function saveGuide(formData: FormData) {
  const session = await requireAdminSession();
  const editorSlug = String(formData.get("editorSlug") ?? "").trim() || null;

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  assertValidSlug(slug, editorSlug);

  const titleFi = String(formData.get("titleFi") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim() || null;
  const descFi = String(formData.get("descFi") ?? "").trim();
  const descEn = String(formData.get("descEn") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || "install";
  const difficulty = assertDifficulty(
    String(formData.get("difficulty") ?? "easy"),
    editorSlug,
  );
  const minutesFi = parseInt(String(formData.get("minutesFi") ?? "5"), 10);
  if (Number.isNaN(minutesFi) || minutesFi < 1) {
    guideFail(editorSlug, "minutes");
  }
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;
  const orderRaw = String(formData.get("order") ?? "0").trim();
  const order = orderRaw ? parseInt(orderRaw, 10) : 0;
  if (Number.isNaN(order)) {
    guideFail(editorSlug, "order");
  }
  const published = String(formData.get("published") ?? "false") === "true";

  const mdxBody = String(formData.get("mdxBody") ?? "");

  const fm: Record<string, string | number | undefined> = {
    slug,
    titleFi,
    difficulty,
    minutes: minutesFi,
  };
  if (videoUrl) fm.videoUrl = videoUrl;

  const fileContent = stringifyGuideMdx(mdxBody, fm);
  const dir = path.join(process.cwd(), "content", "guides");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(guideMdxPath(slug), fileContent, "utf8");

  await prisma.guide.upsert({
    where: { slug },
    create: {
      slug,
      titleFi,
      titleEn,
      descFi,
      descEn,
      category,
      difficulty,
      minutesFi,
      published,
      order,
      videoUrl,
    },
    update: {
      titleFi,
      titleEn,
      descFi,
      descEn,
      category,
      difficulty,
      minutesFi,
      published,
      order,
      videoUrl,
    },
  });

  await recordAdminAudit({
    actorEmail: session.user?.email ?? "unknown",
    action: "guide.save",
    entity: "Guide",
    entityId: slug,
    metadata: { published },
  });

  revalidatePath("/admin/guides");
  revalidatePath(`/admin/guides/${slug}`);
  revalidatePath("/fi/itse");
  revalidatePath("/en/itse");
  revalidatePath(`/fi/itse/${slug}`);
  revalidatePath(`/en/itse/${slug}`);
  redirect(`/admin/guides/${slug}?saved=1`);
}

export async function setGuidePublishedToggle(slug: string, published: boolean) {
  const session = await requireAdminSession();
  await prisma.guide.update({
    where: { slug },
    data: { published },
  });
  await recordAdminAudit({
    actorEmail: session.user?.email ?? "unknown",
    action: "guide.published",
    entity: "Guide",
    entityId: slug,
    metadata: { published },
  });
  revalidatePath("/admin/guides");
  revalidatePath("/fi/itse");
  revalidatePath("/en/itse");
  revalidatePath(`/fi/itse/${slug}`);
  revalidatePath(`/en/itse/${slug}`);
}
