import express from "express";
import bcrypt from "bcryptjs";
import database from "../database/connect-database.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email_address, password } = req.body;

  if (!email_address || !password) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const normalizedEmail = email_address.toLowerCase();

    const result = await database.query(
      `SELECT user_id, email_address, full_name, password_hash, is_admin
       FROM user_information
       WHERE email_address = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Create session
    req.session.user = {
      user_id: user.user_id,
      email_address: user.email_address,
      full_name: user.full_name,
      is_admin: user.is_admin,
    };

    // Send only ONE success response
    return res.json({ success: true, user: req.session.user });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: "Login failed" });
  }
});

export default router;
