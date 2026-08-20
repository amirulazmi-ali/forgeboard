import { createDatabase } from "../server/database.js";

const db = createDatabase();
console.log("SQLite migrations applied successfully.");
db.close();
