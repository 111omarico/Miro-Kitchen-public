

import dotenv from "dotenv";
dotenv.config({ path: "./backend-mirokitchen/.env" });


import express from "express";
import cors from "cors";
import session from "express-session";
import database from "./database/connect-database.js";
import { requireLogin } from "./middleware/auth.js";
import itemform from "./routes/itemform.js";


import purchaseRoutes from "./routes/purchase-method.js";

import connectPgSimple from "connect-pg-simple";



import webhookHandler from "./routes/webhook.js";

const app = express();

// MUST be first — nothing before this
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);




app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: database,
      tableName: "session"
    }),
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use("/api/purchase", purchaseRoutes);

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  res.json({ success: true, user: req.session.user });
});

const clients = [];

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

database.connect((err, client) => {
  if (err) throw err;

  client.on("notification", (msg) => {
    clients.forEach((res) => res.write(`data: ${msg.payload}\n\n`));
  });

  client.query("LISTEN item_updates");
});

let lastSnapshot = [];

async function pollDatabase() {
  try {
    const result = await database.query(
      "SELECT * FROM item_information ORDER BY item_id"
    );
    const current = result.rows;

    if (JSON.stringify(lastSnapshot) !== JSON.stringify(current)) {
      const payload = JSON.stringify({
        op: "POLL_UPDATE",
        rows: current
      });

      clients.forEach((res) => res.write(`data: ${payload}\n\n`));
      lastSnapshot = current;
    }
  } catch (err) {
    console.error("Polling error:", err);
  }
}

setInterval(pollDatabase, 10000);

app.get("/api/items", async (req, res) => {
  try {
    const result = await database.query(
      "SELECT * FROM item_information ORDER BY item_id"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.get("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await database.query(
      "SELECT * FROM item_information WHERE item_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Item not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

import signupMethod from "./routes/signup-method.js";
app.use("/api/signup", signupMethod);

import loginMethod from "./routes/login-method.js";
app.use("/api/login", loginMethod);

import settingsRoutes from "./routes/settings-method.js";
app.use("/api/settings", settingsRoutes);

import editItemRoutes from "./routes/edit-item-method.js";
app.use("/api/edit-item", editItemRoutes);

import orderRoutes from "./routes/order-method.js";
app.use("/api/order", orderRoutes);
import reviewRoutes from "./routes/reviewRoutes.js";
app.use("/api/reviews", reviewRoutes);
import adminReviewRoutes from "./routes/admin-reviewRoutes.js";

app.use("/api/admin/reviews", adminReviewRoutes);

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

app.use("/api/itemform", itemform);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
