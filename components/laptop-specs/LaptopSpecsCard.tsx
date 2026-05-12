import type { LaptopSpecsInsight } from "@/lib/specs/laptop-specs";

type Labels = {
  title: string;
  loading: string;
  empty: string;
  link: string;
};

export function LaptopSpecsCard(props: {
  insight: LaptopSpecsInsight | null;
  loading?: boolean;
  labels: Labels;
  className?: string;
}) {
  const { insight, loading, labels, className = "" } = props;

  if (loading) {
    return (
      <section
        className={`rounded-xl border border-edge bg-card/80 p-4 text-lg text-fog ${className}`}
        aria-busy="true"
        aria-live="polite"
      >
        <h3 className="text-lg font-semibold text-ink">{labels.title}</h3>
        <p className="mt-2">{labels.loading}</p>
      </section>
    );
  }

  if (!insight || (!insight.summary && !insight.specUrl)) {
    return (
      <section
        className={`rounded-xl border border-edge bg-card/80 p-4 text-lg ${className}`}
        aria-live="polite"
      >
        <h3 className="text-lg font-semibold text-ink">{labels.title}</h3>
        <p className="mt-2 text-fog">{labels.empty}</p>
      </section>
    );
  }

  return (
    <section
      className={`rounded-xl border border-g/25 bg-vire-green/5 p-4 sm:p-5 ${className}`}
      aria-labelledby="laptop-specs-heading"
    >
      <h3 id="laptop-specs-heading" className="text-lg font-semibold text-ink">
        {labels.title}
      </h3>
      {insight.summary ? (
        <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed text-ink">
          {insight.summary}
        </p>
      ) : null}
      {insight.specUrl ? (
        <p className="mt-4">
          <a
            href={insight.specUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-tap items-center text-lg font-semibold text-vire-green underline underline-offset-2 hover:opacity-90"
          >
            {labels.link}
          </a>
        </p>
      ) : null}
    </section>
  );
}
