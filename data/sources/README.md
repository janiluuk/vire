# Reference laptop / desktop sources

Sparkki merges these files into `data/reference-laptops.json` (`npm run reference:build`).

| File | Rows (approx.) | Coverage | License / notes |
|------|----------------|----------|-----------------|
| `laptops-37degrees.csv` | ~1 300 SKUs | Retail listings, ~19 brands (Dell, Lenovo, HP, Asus, Acer, …) | [37Degrees/DataSets](https://github.com/37Degrees/DataSets) `laptops.csv` — confirm upstream license before redistribution |
| `laptops-modern-2025.csv` | ~30 | 2025–2026 consumer SKUs (Core Ultra, M4, RTX 50-series, …) | [sohaibdevv/laptop-prices-assignment](https://github.com/sohaibdevv/laptop-prices-assignment) |
| `office-desktops.csv` | ~35 | Common office desktops (OptiPlex, ProDesk, ThinkCentre, …) | Curated by Sparkki for Finnish B2B/consumer flows |

## What we evaluated but did not bulk-import

| Source | Why not used as primary |
|--------|-------------------------|
| **Kaggle “Latest Laptop March 2024”** | Same schema family as 37Degrees; requires Kaggle login for download; no clear license for production DB |
| **Notebookcheck / PSREF / manufacturer sites** | No open bulk export; best for one-off verification via SearXNG |
| **ThinkWiki DMI list** | Model names without consistent CPU/RAM/storage — useful for names, weak for spec hints |
| **Lenovo MTM scrape (~550k rows, 2014)** | Massive but dated, SKU-level, heavy cleanup; MTM ≠ what customers type |
| **YBIFoundation ComputerPrice.csv** | No make/model columns (only speed/RAM/screen aggregates) |

There is **no single open database** with official specs for every laptop sold in the EU in the last 15 years. The practical approach:

1. **Imported catalog** (`LaptopReferenceSpec`) — largest open retail-style CSVs we can merge.
2. **Sparkki-verified models** (`ComputerModel`) — staff-approved compatibility; grow via admin + CSV import.
3. **Web search last** — SearXNG + optional LLM only when the catalog row is missing or lacks CPU + (RAM or storage).

## Refresh workflow

```bash
# After editing files in data/sources/
npm run reference:build
npm run reference:import          # replaces all LaptopReferenceSpec rows
# or on first deploy only:
npm run reference:import -- --only-if-empty
```

See also [`../README-reference-laptops.md`](../README-reference-laptops.md) and [`docs/model-search.md`](../../docs/model-search.md).
