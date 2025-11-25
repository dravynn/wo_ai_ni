import fs from "fs";
import path from "path";
// Use require + any to avoid missing declaration issues for sql.js in ts-node
const initSqlJs: any = require("sql.js");


const DATA_DIR = path.resolve(process.env.DB_DIR || path.join(__dirname, "..", "data"));
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "quotes.db");

let SQL: any | null = null;
let db: any | null = null;

export async function initDb() {
  if (db) return;
  SQL = await initSqlJs({ locateFile: (file: string) => require.resolve(`sql.js/dist/${file}`) });

  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH);
    db = new SQL.Database(new Uint8Array(data));
  } else {
    db = new SQL.Database();
  }

  // ensure table
  db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      quoteId TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      principal REAL NOT NULL,
      leverage REAL NOT NULL,
      durationHours INTEGER NOT NULL,
      risk REAL NOT NULL,
      payoutCap REAL NOT NULL,
      premium REAL NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  persist();
}

export function persist() {
  if (!db) return;
  const data = db.export();
  const arr = Buffer.from(data);
  fs.writeFileSync(DB_PATH, arr);
}

export function run(sql: string, params?: any[]) {
  if (!db) throw new Error("DB not initialized");
  const stmt = db.prepare(sql);
  try {
    if (params && params.length) stmt.bind(params);
    const result = stmt.step();
    return result;
  } finally {
    stmt.free();
  }
}

export function exec(sql: string) {
  if (!db) throw new Error("DB not initialized");
  return db.exec(sql);
}

export function prepare(sql: string) {
  if (!db) throw new Error("DB not initialized");
  return db.prepare(sql);
}

export function query(sql: string, params?: any[]) {
  if (!db) throw new Error("DB not initialized");
  const stmt = db.prepare(sql);
  try {
    if (params && params.length) stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    return results;
  } finally {
    stmt.free();
  }
}

export function closeDb() {
  if (!db) return;
  db.close();
  db = null;
}

