import { getTranslations } from "next-intl/server";
import type { ServiceComponent, ServiceComponentId } from "@/lib/data/service-components";
import { getServiceComponents } from "@/lib/data/service-components";

function isComponentId(id: string): id is ServiceComponentId {
  return id === "ssdSata" || id === "ssdNvme" || id === "ram8gb";
}

export async function ComponentSourcingSection() {
  const t = await getTranslations("palvelu.components");
  const items = getServiceComponents();

  return (
    <section
      id="komponentit"
      aria-labelledby="components-sourcing-title"
      className="scroll-mt-24 space-y-6"
    >
      <div>
        <h2
          id="components-sourcing-title"
          className="text-2xl font-bold text-ink md:text-3xl"
        >
          {t("title")}
        </h2>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-fog">
          {t("intro")}
        </p>
      </div>
      <ul className="grid gap-5 md:grid-cols-1 lg:grid-cols-3" role="list">
        {items.map((c) => (
          <ComponentCard key={c.id} c={c} t={t} />
        ))}
      </ul>
      <p className="max-w-3xl text-base leading-relaxed text-fog">{t("reassurance")}</p>
    </section>
  );
}

function ComponentCard({
  c,
  t,
}: {
  c: ServiceComponent;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const id = isComponentId(c.id) ? c.id : "ssdSata";
  const lead = t(`items.${id}.lead`);
  const warranty = t(`items.${id}.warranty`);
  const specReadLabel =
    id === "ram8gb" ? t("specClock") : t("specRead");
  const specWriteLabel = t("specWrite");
  const showWrite = c.writeSpeed.trim().length > 0;

  return (
    <li className="sparkki-card-hover flex flex-col border border-edge p-6 sm:p-7">
      <p className="font-mono text-[10px] font-normal uppercase tracking-wider text-g">
        {t(`items.${id}.eyebrow`)}
      </p>
      <h3 className="mt-2 font-display text-lg font-bold text-ink">
        {c.brand} {c.model}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fog">{lead}</p>
      <dl className="mt-4 space-y-2 text-sm text-ink">
        <div className="flex justify-between gap-3 border-b border-edge/60 py-1.5">
          <dt className="text-fog">{t("specCapacity")}</dt>
          <dd className="text-right font-medium">{c.capacity}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-edge/60 py-1.5">
          <dt className="text-fog">{t("specInterface")}</dt>
          <dd className="text-right font-medium">{c.interface}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-edge/60 py-1.5">
          <dt className="text-fog">{specReadLabel}</dt>
          <dd className="text-right font-medium">{c.readSpeed}</dd>
        </div>
        {showWrite ? (
          <div className="flex justify-between gap-3 border-b border-edge/60 py-1.5">
            <dt className="text-fog">{specWriteLabel}</dt>
            <dd className="text-right font-medium">{c.writeSpeed}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3 py-1.5">
          <dt className="text-fog">{t("specWarranty")}</dt>
          <dd className="text-right font-medium">{warranty}</dd>
        </div>
      </dl>
      <a
        href={c.shopUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-tap items-center font-semibold text-g underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
      >
        {t("shopCta")}
      </a>
    </li>
  );
}
