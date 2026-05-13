import {
  checkCompatibility,
  type DbVerdictInput,
} from "../../../lib/specs/compatibility";

const form = document.querySelector<HTMLFormElement>("#check-form");
const out = document.querySelector<HTMLPreElement>("#out");
const copyBtn = document.querySelector<HTMLButtonElement>("#copy");
const fetchSpecsBtn = document.querySelector<HTMLButtonElement>("#fetch-specs");

const SITE_API_BASE = (
  (import.meta.env.VITE_SPARKKI_API_BASE as string | undefined)?.trim() ||
  (import.meta.env.VITE_VIRE_API_BASE as string | undefined)?.trim()
)?.replace(/\/$/, "");

function diskValue(v: string): "hdd" | "ssd" | "unknown" | null | undefined {
  if (v === "") return undefined;
  if (v === "hdd" || v === "ssd" || v === "unknown") return v;
  return undefined;
}

function parseDb(raw: string): DbVerdictInput {
  const t = raw.trim();
  if (!t) return null;
  try {
    const o = JSON.parse(t) as Record<string, unknown>;
    const compatible =
      typeof o.compatible === "boolean" ? o.compatible : null;
    const verdict = typeof o.verdict === "string" ? o.verdict : null;
    return { compatible, verdict };
  } catch {
    throw new Error("db_json_invalid");
  }
}

function run() {
  const make = document.querySelector<HTMLInputElement>("#make")!.value;
  const model = document.querySelector<HTMLInputElement>("#model")!.value;
  const ramRaw = document.querySelector<HTMLInputElement>("#ram")!.value.trim();
  const ramGb =
    ramRaw === "" ? null : Number.parseInt(ramRaw, 10);
  const disk = diskValue(
    document.querySelector<HTMLSelectElement>("#disk")!.value,
  );
  const dbRaw = document.querySelector<HTMLTextAreaElement>("#db")!.value;

  let dbVerdict: DbVerdictInput = null;
  try {
    dbVerdict = parseDb(dbRaw);
  } catch {
    if (out) {
      out.textContent = JSON.stringify(
        { error: "invalid_db_json", hint: "Korjaa DB-verdict JSON tai tyhjennä kenttä." },
        null,
        2,
      );
    }
    return;
  }

  if (ramGb !== null && (Number.isNaN(ramGb) || ramGb < 0)) {
    if (out) {
      out.textContent = JSON.stringify(
        { error: "invalid_ram", hint: "RAM täytyy olla ei-negatiivinen kokonaisluku." },
        null,
        2,
      );
    }
    return;
  }

  const result = checkCompatibility(
    make,
    model,
    ramGb,
    disk ?? null,
    dbVerdict,
  );

  const payload = {
    input: {
      make: make.trim(),
      model: model.trim(),
      ramGb: ramGb ?? null,
      diskType: disk ?? null,
      dbVerdict,
    },
    output: result,
  };

  if (out) out.textContent = JSON.stringify(payload, null, 2);
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  run();
});

copyBtn?.addEventListener("click", async () => {
  const text = out?.textContent ?? "";
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Kopioitu!";
    setTimeout(() => {
      copyBtn.textContent = "Kopioi JSON";
    }, 1500);
  } catch {
    copyBtn.textContent = "Ei onnistunut";
    setTimeout(() => {
      copyBtn.textContent = "Kopioi JSON";
    }, 1500);
  }
});

if (SITE_API_BASE && fetchSpecsBtn) {
  fetchSpecsBtn.hidden = false;
  fetchSpecsBtn.addEventListener("click", async () => {
    const make = document.querySelector<HTMLInputElement>("#make")!.value.trim();
    const model = document.querySelector<HTMLInputElement>("#model")!.value.trim();
    if (!make || !model) {
      if (out) {
        out.textContent = JSON.stringify(
          {
            error: "make_model_required",
            hint: "Täytä valmistaja ja malli ennen verkkohakua.",
          },
          null,
          2,
        );
      }
      return;
    }
    fetchSpecsBtn.disabled = true;
    try {
      const res = await fetch(`${SITE_API_BASE}/api/public/laptop-specs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model }),
      });
      const json: unknown = await res.json().catch(() => ({}));
      if (out) {
        out.textContent = JSON.stringify(
          { httpStatus: res.status, body: json },
          null,
          2,
        );
      }
    } catch (e) {
      if (out) {
        out.textContent = JSON.stringify(
          { error: "fetch_failed", detail: String(e) },
          null,
          2,
        );
      }
    } finally {
      fetchSpecsBtn.disabled = false;
    }
  });
}

run();
