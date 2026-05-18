import { requireMigratedDatabase } from "./db-guard";

export default async function globalSetup() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.warn(
      "[functional] DATABASE_URL unset — DB tests may fail at runtime.",
    );
    return;
  }
  await requireMigratedDatabase();
}
