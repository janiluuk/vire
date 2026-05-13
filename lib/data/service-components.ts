import components from "@/data/components.json";

export type ServiceComponentId = "ssdSata" | "ssdNvme" | "ram8gb";

export type ServiceComponent = {
  id: ServiceComponentId;
  brand: string;
  model: string;
  capacity: string;
  interface: string;
  readSpeed: string;
  /** Optional; empty for RAM row where clock is shown in readSpeed */
  writeSpeed: string;
  shopUrl: string;
};

const IDS: Set<string> = new Set(["ssdSata", "ssdNvme", "ram8gb"]);

function isServiceComponent(x: unknown): x is ServiceComponent {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const id = o.id;
  return (
    typeof id === "string" &&
    IDS.has(id) &&
    typeof o.brand === "string" &&
    typeof o.model === "string" &&
    typeof o.capacity === "string" &&
    typeof o.interface === "string" &&
    typeof o.readSpeed === "string" &&
    typeof o.writeSpeed === "string" &&
    typeof o.shopUrl === "string"
  );
}

/** Default SSD/RAM lines we install or recommend — edit `data/components.json` to update storefront links. */
export function getServiceComponents(): ServiceComponent[] {
  const raw = components as { items: unknown[] };
  const out: ServiceComponent[] = [];
  for (const item of raw.items ?? []) {
    if (isServiceComponent(item)) out.push(item);
  }
  return out;
}
