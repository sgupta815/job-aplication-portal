import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { JSONFilePreset } from "lowdb/node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "..", "data", "db.json");

// Ensure the data directory exists before lowdb tries to write to it.
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

/** @type {import('lowdb').Low<{jobs: any[], applicants: any[], applications: any[]}>} */
let db;

export async function connectDB() {
  db = await JSONFilePreset(DB_PATH, { jobs: [], applicants: [], applications: [] });
  console.log("File-based DB ready at", DB_PATH);
}

export function getDB() {
  if (!db) throw new Error("DB not initialised — call connectDB() first.");
  return db;
}
