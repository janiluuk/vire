/**
 * Optional vision step: identify laptop make/model from a customer photo via Ollama.
 */
import { extractJsonObject } from "@/lib/specs/laptop-specs";
import { getSpecsAiConfig, isSpecsLookupEnabled } from "@/lib/specs/specs-env";

export type LaptopPhotoHint = {
  description: string | null;
  make: string | null;
  model: string | null;
  notes: string | null;
};

const VISION_SYSTEM = `You identify laptops from customer photos (stickers, chassis, keyboard, screen bezel).
Reply with ONLY JSON:
{"description":"make and model as one line for a search box","make":"brand or null","model":"model line or null","notes":"visible specs/stickers in Finnish or English, or null"}
If not a laptop or unreadable, set all fields to null except notes with a short explanation in Finnish.`;

function parsePhotoHint(o: Record<string, unknown> | null): LaptopPhotoHint {
  if (!o) {
    return { description: null, make: null, model: null, notes: null };
  }
  const pick = (keys: string[]) => {
    for (const k of keys) {
      const v = o[k];
      if (typeof v === "string") {
        const t = v.trim();
        if (t && t.toLowerCase() !== "null") return t;
      }
    }
    return null;
  };
  return {
    description: pick(["description", "device", "laptop", "text"]),
    make: pick(["make", "brand", "manufacturer"]),
    model: pick(["model", "modelName", "series"]),
    notes: pick(["notes", "hint", "observations"]),
  };
}

export function getSpecsVisionModel(): string | null {
  const explicit = process.env.SPECS_VISION_MODEL?.trim();
  if (explicit) return explicit;
  const { model } = getSpecsAiConfig();
  if (/llava|vision|vl|moondream|bakllava/i.test(model)) return model;
  return process.env.SPECS_VISION_MODEL_FALLBACK?.trim() || "llava";
}

export function isPhotoVisionEnabled(): boolean {
  if (!isSpecsLookupEnabled()) return false;
  if (process.env.SPECS_PHOTO_ENABLED === "false") return false;
  return Boolean(getSpecsAiConfig().base);
}

async function ollamaVision(
  base: string,
  model: string,
  imageBase64: string,
  locale: "fi" | "en",
): Promise<string | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 55_000);
  try {
    const userText =
      locale === "en"
        ? "What laptop is in this photo? Read any model stickers or type labels."
        : "Mikä kannettava tässä kuvassa on? Lue tarralaput ja mallitekstit.";
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: "system", content: VISION_SYSTEM },
          {
            role: "user",
            content: userText,
            images: [imageBase64],
          },
        ],
      }),
      signal: ac.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      message?: { content?: string };
    };
    const text = data.message?.content;
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Analyze a JPEG/PNG/WebP image and return a search-friendly laptop description.
 */
export async function analyzeLaptopPhoto(
  imageBase64: string,
  locale: "fi" | "en" = "fi",
): Promise<LaptopPhotoHint | null> {
  if (!isPhotoVisionEnabled()) return null;

  const { base } = getSpecsAiConfig();
  const model = getSpecsVisionModel();
  if (!base || !model) return null;

  const raw = await ollamaVision(base, model, imageBase64, locale);
  if (!raw) return null;

  const hint = parsePhotoHint(extractJsonObject(raw));
  if (!hint.description && hint.make && hint.model) {
    hint.description = `${hint.make} ${hint.model}`.trim();
  }
  if (!hint.description && !hint.make && !hint.model) {
    return hint.notes ? hint : null;
  }
  return hint;
}
