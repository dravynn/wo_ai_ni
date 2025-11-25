import fs from "fs";
import path from "path";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const TEST_DB = path.join(DATA_DIR, "test-quotes.db");
if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
process.env.DB_PATH = TEST_DB;

import { initDb } from "../src/db";
import app from "../src/app";

describe("Mini LiqPass Quote API", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    await initDb();
    server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    const addr: any = server.address();
    const port = addr.port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it("creates a valid quote", async () => {
    const res = await fetch(`${baseUrl}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "alice", principal: 1000, leverage: 10, durationHours: 24 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("quoteId");
    expect(body.userId).toBe("alice");
    expect(body.principal).toBe(1000);
    expect(typeof body.risk).toBe("number");
    expect(typeof body.premium).toBe("number");
  });

  it("rejects invalid quote request", async () => {
    const res = await fetch(`${baseUrl}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "bob", principal: -10, leverage: 200, durationHours: 3 }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("returns quotes for a user ordered newest-first", async () => {
    const p1 = await fetch(`${baseUrl}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "charlie", principal: 500, leverage: 5, durationHours: 8 }),
    });
    const p2 = await fetch(`${baseUrl}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "charlie", principal: 800, leverage: 20, durationHours: 24 }),
    });

    expect(p1.status).toBe(200);
    expect(p2.status).toBe(200);

    const res = await fetch(`${baseUrl}/quotes/charlie`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("charlie");
    expect(Array.isArray(body.quotes)).toBe(true);
    expect(body.quotes.length).toBeGreaterThanOrEqual(2);
    expect(body.quotes[0].principal).toBe(800);
  });
});
