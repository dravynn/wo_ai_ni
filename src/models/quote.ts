import { query, run, persist, initDb } from "../db";

export interface Quote {
  quoteId: string;
  userId: string;
  principal: number;
  leverage: number;
  durationHours: number;
  risk: number;
  payoutCap: number;
  premium: number;
  createdAt: string;
}

export async function insertQuote(q: Quote) {
  await initDb();
  const sql = `INSERT INTO quotes (quoteId, userId, principal, leverage, durationHours, risk, payoutCap, premium, createdAt)
  VALUES (?,?,?,?,?,?,?,?,?)`;
  run(sql, [q.quoteId, q.userId, q.principal, q.leverage, q.durationHours, q.risk, q.payoutCap, q.premium, q.createdAt]);
  persist();
}

export async function getQuotesByUser(userId: string): Promise<Quote[]> {
  await initDb();
  // SQL.js lacks datetime() so createdAt stored as ISO and sorted lexicographically
  const rows = query(`SELECT quoteId, userId, principal, leverage, durationHours, risk, payoutCap, premium, createdAt FROM quotes WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
  return rows as Quote[];
}
