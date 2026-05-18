# Reference laptop dataset (`reference-laptops.json`)

Merged export of open retail-style listings used for **spec hints** (CPU, RAM, storage, GPU, screen, weight). **Not** Sparkki compatibility verdicts.

## Sources

Built from `data/sources/` — see [`data/sources/README.md`](sources/README.md) for provenance, licenses, and research notes.

| Source | Role |
|--------|------|
| `laptops-37degrees.csv` | Primary bulk catalog (~1.3k SKUs, 19 manufacturers) |
| `laptops-modern-2025.csv` | Recent 2025–2026 models |
| `office-desktops.csv` | Common office desktops (OptiPlex, ProDesk, ThinkCentre, …) |

## How Sparkki uses it

- Imported into PostgreSQL as **`LaptopReferenceSpec`**.
- **`findLaptopReferenceRow`** / **`computer-lookup`** attach CPU/RAM/storage on the home checker and wizard.
- When the matched row has **CPU + (RAM or storage)**, **SearXNG/LLM is skipped** (web is last resort).
- **`resolveLaptopSpecs`** returns catalog specs immediately when the row is “strong”; otherwise falls back to cached or live web lookup.

Setup: **[`docs/model-search.md`](../docs/model-search.md)**.

## Refreshing the data

```bash
npm run reference:build    # merge sources → data/reference-laptops.json
npm run reference:import   # load into Postgres (replaces existing rows)
```

On first `prisma db seed` only, import runs if the table is empty (`--only-if-empty` behaviour in seed).

## License

Confirm licensing with each upstream repository before redistribution beyond internal/product use. This README does not grant rights.
