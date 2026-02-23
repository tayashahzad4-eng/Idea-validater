import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "validate-secret-key-123";
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Database Setup
const db = new Database("database.sqlite");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    plan TEXT DEFAULT 'free',
    validations_this_month INTEGER DEFAULT 0,
    last_reset_date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    idea_name TEXT,
    idea_description TEXT,
    target_audience TEXT,
    product_format TEXT,
    expected_price TEXT,
    target_country TEXT,
    ai_output TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

app.use(express.json());
app.use(cookieParser());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Auth
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const info = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hashedPassword);
    const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ id: info.lastInsertRowid, email, plan: "free" });
  } catch (e: any) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
  res.json({ id: user.id, email: user.email, plan: user.plan });
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT id, email, plan, validations_this_month FROM users WHERE id = ?").get(req.user.id) as any;
  res.json(user);
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// Validations
app.post("/api/validations", authenticateToken, async (req: any, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;
  
  // Check limits for free users
  if (user.plan === "free" && user.validations_this_month >= 2) {
    return res.status(403).json({ error: "Free limit reached. Upgrade to Pro for unlimited validations." });
  }

  const { ideaName, ideaDescription, targetAudience, productFormat, expectedPrice, targetCountry } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const model = "gemini-3-flash-preview";
    
    const systemPrompt = `You are a professional startup validation analyst.
Analyze digital product ideas realistically and provide structured scoring.
Respond ONLY in JSON format with the following fields:
{
  "demand_score": number (1-10),
  "demand_reason": string,
  "competition_intensity": number (1-10),
  "competition_reason": string,
  "differentiation_potential": number (1-10),
  "monetization_difficulty": number (1-10),
  "scalability_score": number (1-10),
  "verdict": "BUILD" | "BUILD WITH REFINEMENT" | "DO NOT BUILD",
  "niche_narrowing": string,
  "unique_positioning_angles": string[],
  "first_100_customer_strategy": string,
  "suggested_price_range": string
}
Be realistic. Avoid generic motivational advice.`;

    const userPrompt = `Idea Details:
Name: ${ideaName}
Description: ${ideaDescription}
Target Audience: ${targetAudience}
Product Format: ${productFormat}
Expected Price: ${expectedPrice}
Target Country: ${targetCountry || "Global"}`;

    const result = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const aiOutput = result.text;

    const info = db.prepare(`
      INSERT INTO validations (user_id, idea_name, idea_description, target_audience, product_format, expected_price, target_country, ai_output)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, ideaName, ideaDescription, targetAudience, productFormat, expectedPrice, targetCountry, aiOutput);

    // Increment usage
    db.prepare("UPDATE users SET validations_this_month = validations_this_month + 1 WHERE id = ?").run(req.user.id);

    res.json({ id: info.lastInsertRowid, ai_output: JSON.parse(aiOutput!) });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "AI Analysis failed" });
  }
});

app.get("/api/validations", authenticateToken, (req: any, res) => {
  const validations = db.prepare("SELECT * FROM validations WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  res.json(validations.map((v: any) => ({ ...v, ai_output: JSON.parse(v.ai_output) })));
});

app.get("/api/validations/:id", authenticateToken, (req: any, res) => {
  const validation = db.prepare("SELECT * FROM validations WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id) as any;
  if (!validation) return res.status(404).json({ error: "Not found" });
  res.json({ ...validation, ai_output: JSON.parse(validation.ai_output) });
});

// Stripe
app.post("/api/stripe/create-checkout", authenticateToken, async (req: any, res) => {
  if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Validate Before You Build - Pro Plan",
            description: "Unlimited validations and full access to all features.",
          },
          unit_amount: 2900, // $29.00
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.APP_URL}/dashboard?canceled=true`,
    client_reference_id: req.user.id.toString(),
  });

  res.json({ url: session.url });
});

// Stripe Webhook (Simplified for demo, in real apps use stripe.webhooks.constructEvent)
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  // In a real app, verify the signature here.
  const event = JSON.parse(req.body.toString());

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    db.prepare("UPDATE users SET plan = 'pro' WHERE id = ?").run(userId);
  }

  res.json({ received: true });
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
