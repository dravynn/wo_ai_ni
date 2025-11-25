import express from "express";
import { v4 as uuidv4 } from "uuid";
import { QuoteRequestSchema } from "./validation";
import { insertQuote, getQuotesByUser } from "./models/quote";

const app = express();
app.use(express.json());

function computeRisk(leverage: number) {
  return Math.min(0.99, leverage / 120);
}

function computePayoutCap(principal: number) {
  return principal * 0.5;
}

function computePremium(principal: number, risk: number) {
  return principal * risk * 0.3;
}

app.post("/quote", async (req, res) => {
  const parse = QuoteRequestSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.errors.map((e) => e.message).join(", ") });
  }

  const { userId, principal, leverage, durationHours } = parse.data;

  const risk = computeRisk(leverage);
  const payoutCap = computePayoutCap(principal);
  const premium = computePremium(principal, risk);

  const quote = {
    quoteId: uuidv4(),
    userId,
    principal,
    leverage,
    durationHours,
    risk,
    payoutCap,
    premium,
    createdAt: new Date().toISOString(),
  };

  try {
    await insertQuote(quote as any);
  } catch (err) {
    console.error("DB insert error:", err);
    return res.status(500).json({ error: "failed to store quote" });
  }

  return res.json(quote);
});

app.get("/quotes/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "userId required" });

  try {
    const quotes = await getQuotesByUser(userId);
    return res.json({ userId, quotes });
  } catch (err) {
    console.error("DB read error:", err);
    return res.status(500).json({ error: "failed to read quotes" });
  }
});

export default app;
