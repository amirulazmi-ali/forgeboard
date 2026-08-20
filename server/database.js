import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsPath = path.join(projectRoot, "database", "migrations");

export function createDatabase() {
  const databasePath = process.env.DB_PATH || path.join(projectRoot, "data", "forgeboard.sqlite");
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}

export function runMigrations(db) {
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
  const applied = new Set(db.prepare("SELECT id FROM schema_migrations").all().map((row) => row.id));
  const migrations = fs.readdirSync(migrationsPath).filter((file) => file.endsWith(".sql")).sort();
  const insertMigration = db.prepare("INSERT INTO schema_migrations (id) VALUES (?)");

  for (const migration of migrations) {
    if (applied.has(migration)) continue;
    const applyMigration = db.transaction(() => {
      db.exec(fs.readFileSync(path.join(migrationsPath, migration), "utf8"));
      insertMigration.run(migration);
    });
    applyMigration();
  }
}
