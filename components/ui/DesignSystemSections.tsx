import type { ReactNode } from "react";

type Accent = "accent" | "amber" | "neutral";

function accentClass(accent: Accent = "neutral") {
  if (accent === "accent") {
    return "border-g/35 bg-g/[0.06]";
  }

  if (accent === "amber") {
    return "border-amber/30 bg-amber/[0.06]";
  }

  return "border-edge bg-card/70";
}

export function InfoBlock({
  eyebrow,
  title,
  intro,
  align = "start",
  className = "",
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "start" | "center";
  className?: string;
  children?: ReactNode;
}) {
  const alignment = align === "center" ? "text-center items-center" : "text-left";

  return (
    <section className={`space-y-6 ${className}`.trim()}>
      <header className={`flex flex-col gap-4 ${alignment}`.trim()}>
        {eyebrow ? <p className="sparkki-eyebrow">{eyebrow}</p> : null}
        <div className="space-y-4">
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-section text-ink md:text-4xl">
            {title}
          </h2>
          {intro ? (
            <p className="max-w-3xl text-lg leading-relaxed text-fog">{intro}</p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function BenefitGrid({
  items,
  columns = 2,
}: {
  items: Array<{
    icon?: string;
    title: string;
    body: string;
    accent?: Accent;
  }>;
  columns?: 2 | 3 | 4;
}) {
  const gridClass =
    columns === 4
      ? "md:grid-cols-2 xl:grid-cols-4"
      : columns === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2";

  return (
    <div className={`grid gap-4 ${gridClass}`.trim()}>
      {items.map((item) => (
        <article
          key={`${item.title}-${item.body}`}
          className={`sparkki-card-hover flex flex-col gap-3 p-6 sm:p-7 ${accentClass(
            item.accent,
          )}`.trim()}
        >
          {item.icon ? (
            <span
              className="flex size-11 items-center justify-center rounded-xl bg-canvas/65 text-xl text-g"
              aria-hidden
            >
              {item.icon}
            </span>
          ) : null}
          <h3 className="font-display text-xl font-bold text-ink">{item.title}</h3>
          <p className="text-base leading-relaxed text-fog">{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export function FAQAccordion({
  items,
}: {
  items: Array<{
    question: string;
    answer: string;
  }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="overflow-hidden rounded-spark-lg border border-edge bg-card/45 transition-colors duration-base open:border-g/30 open:bg-g/[0.05]"
        >
          <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-start gap-3">
              <span className="mt-1 text-g" aria-hidden>
                +
              </span>
              <span>{item.question}</span>
            </span>
          </summary>
          <div className="border-t border-edge/80 px-5 pb-5 pt-4 text-base leading-relaxed text-fog">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

export function TimelineSection({
  items,
}: {
  items: Array<{
    eyebrow?: string;
    title?: string;
    body: string;
    accent?: Accent;
  }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={`${item.eyebrow ?? ""}-${item.title ?? ""}-${item.body}`}
          className={`sparkki-card p-5 sm:p-6 ${accentClass(item.accent)}`.trim()}
        >
          {item.eyebrow ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dust">
              {item.eyebrow}
            </p>
          ) : null}
          {item.title ? (
            <h3 className="mt-2 font-display text-lg font-bold text-ink">{item.title}</h3>
          ) : null}
          <p className={`${item.title || item.eyebrow ? "mt-3" : ""} text-base leading-relaxed text-fog`}>
            {item.body}
          </p>
        </article>
      ))}
    </div>
  );
}

export function ComparisonCard({
  title,
  intro,
  beforeLabel,
  afterLabel,
  beforeItems,
  afterItems,
}: {
  title: string;
  intro?: string;
  beforeLabel: string;
  afterLabel: string;
  beforeItems: string[];
  afterItems: string[];
}) {
  return (
    <article className="sparkki-card p-6 sm:p-8">
      <header className="space-y-3">
        <h3 className="font-display text-2xl font-bold text-ink">{title}</h3>
        {intro ? <p className="max-w-2xl text-lg leading-relaxed text-fog">{intro}</p> : null}
      </header>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-spark-lg border border-edge bg-canvas/35 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-dust">
            {beforeLabel}
          </p>
          <ul className="mt-4 space-y-3 text-base leading-relaxed text-fog">
            {beforeItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-danger" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-spark-lg border border-g/30 bg-g/[0.06] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-g">
            {afterLabel}
          </p>
          <ul className="mt-4 space-y-3 text-base leading-relaxed text-ink">
            {afterItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-g" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function TransformationCard(props: {
  title: string;
  intro?: string;
  beforeLabel: string;
  afterLabel: string;
  beforeItems: string[];
  afterItems: string[];
}) {
  return <ComparisonCard {...props} />;
}

export function VisualExplainer({
  eyebrow,
  title,
  body,
  points,
  accent = "accent",
}: {
  eyebrow?: string;
  title: string;
  body: string;
  points: string[];
  accent?: Accent;
}) {
  return (
    <article className={`sparkki-card p-6 sm:p-8 ${accentClass(accent)}`.trim()}>
      {eyebrow ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-dust">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-2 font-display text-2xl font-bold text-ink">{title}</h3>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fog">{body}</p>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {points.map((point) => (
          <li
            key={point}
            className="rounded-spark-md border border-edge/80 bg-canvas/35 px-4 py-3 text-base leading-relaxed text-ink"
          >
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function InteractiveDiagram({
  items,
}: {
  items: Array<{
    step: string;
    title: string;
    body: string;
  }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <article key={item.step} className="sparkki-card relative p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <p className="font-display text-[2.75rem] font-extrabold leading-none tracking-hero text-g/30">
              {item.step}
            </p>
            {index < items.length - 1 ? (
              <span className="hidden text-g/45 xl:block" aria-hidden>
                →
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 font-display text-xl font-bold text-ink">{item.title}</h3>
          <p className="mt-3 text-base leading-relaxed text-fog">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
