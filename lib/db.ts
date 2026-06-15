import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = process.env.DB_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "survey.db");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    created_at TEXT NOT NULL,
    anonymous INTEGER NOT NULL,
    name TEXT,
    email TEXT,
    extra_field TEXT,
    answers TEXT NOT NULL
  )
`);

export default db;
