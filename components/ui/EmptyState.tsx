import type { ReactNode } from "react";

function SparkMark() {
  return (
    <svg
      className="mx-auto mb-5 h-9 w-9 text-g opacity-90"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <path
        d="M20 4l2.2 8.2L30 14l-7 5.4L25 28l-5-6.2L15 28l2-8.6L10 14l7.8-1.8L20 4z"
        fill="currentColor"
        fillOpacity={0.35}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Phase 5 — consistent empty / zero-result surfaces (admin and public).
 * Phase 10 — spark mark + accent bar (`sparkki-empty-state`).
 */
export function EmptyState({
  title,
  description,
  className = "",
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className={`sparkki-empty-state rounded-xl border border-dashed border-em bg-sunken/25 px-6 py-10 text-center ${className}`}
    >
      <SparkMark />
      <p className="text-lg font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-2 text-base leading-relaxed text-fog">{description}</p>
      ) : null}
      {children ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
      ) : null}
    </div>
  );
}
