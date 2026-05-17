# Reference laptop dataset (`reference-laptops.json`)

This file is a **JSON export** of the public **`laptops.csv`** listing from  
[37Degrees/DataSets](https://github.com/37Degrees/DataSets/blob/master/laptops.csv)  
(commonly used in ML / pricing exercises). It contains **retail-style** rows: manufacturer, model name, CPU, RAM, storage, GPU, screen, weight, OS, price (euros), etc.

## How Sparkki uses it

- Imported into PostgreSQL as **`LaptopReferenceSpec`** (see Prisma schema).
- **`lookupLaptopReference`** / **`computer-lookup`** use it for CPU/RAM/storage rows on the home checker and wizard (database only).
- **`resolveLaptopSpecs`** also attaches a **`referenceSummary`** string alongside SearXNG/LLM results (`POST /api/public/laptop-specs`).
- This is **not** a Sparkki compatibility verdict and **not** manufacturer-official; it is a **hint** when the customer’s wording matches a catalog row.

Setup for DB + SearXNG + Ollama: **[`docs/model-search.md`](../docs/model-search.md)**.

## Refreshing the data

1. Replace `data/reference-laptops.json` (same column names as the source CSV, UTF-8).
2. Clear and re-seed reference rows, e.g. run Prisma seed after temporarily clearing `LaptopReferenceSpec`, or add an operator script if you outgrow seed-time imports.

## License

Confirm licensing with the upstream repository before redistribution beyond internal/product use. This README does not grant rights; it documents provenance only.
