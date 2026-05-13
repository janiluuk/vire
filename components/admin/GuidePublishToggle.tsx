"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { setGuidePublishedToggle } from "@/app/admin/guides/actions";

export function GuidePublishToggle({
  slug,
  published,
}: {
  slug: string;
  published: boolean;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [on, setOn] = useState(published);

  useEffect(() => {
    setOn(published);
  }, [published]);

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      try {
        await setGuidePublishedToggle(slug, next);
        router.refresh();
      } catch {
        setOn(published);
      }
    });
  }

  return (
    <div className="inline-flex items-center gap-3 font-medium text-ink">
      <span className="sr-only">{t("guidesPublishedLabel")}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-busy={pending}
        disabled={pending}
        onClick={() => void toggle()}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vire-green ${
          on ? "bg-vire-green" : "bg-dust"
        } ${pending ? "opacity-60" : ""}`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full border border-em bg-card transition-[left] ${
            on ? "left-7" : "left-1"
          }`}
        />
      </button>
      <span aria-hidden>{on ? t("guidePublishedYes") : t("guidePublishedNo")}</span>
    </div>
  );
}
