import express from "express";
import bcrypt from "bcryptjs";
import database from "../database/connect-database.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email_address, full_name, password } = req.body;
  function hasTwoNames(name) {
    if (!name) return false;
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 && parts.every(p => p.length >= 2);
  }
  if (!hasTwoNames(full_name)) {
    return res.status(400).json({
      success: false,
      error: "Full name must include first and last name (each at least 2 letters)"
    });
  }

  if (!email_address || email_address.trim().length <= 12) {
    return res.status(400).json({
      success: false,
      error: "Email must be at least 13 characters"
    });
  }

  if (!full_name || full_name.trim().length <= 3) {
    return res.status(400).json({
      success: false,
      error: "Full name must be at least 4 characters"
    });
  }

  if (!password || password.length <= 5) {
    return res.status(400).json({
      success: false,
      error: "Password must be at least 6 characters"
    });
  }

  try {

    const emailCheck = await database.query(
      "SELECT 1 FROM user_information WHERE email_address = $1",
      [email_address]
    );
    if (emailCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        error: "Email already in use"
      });
    }

    const fullNameCheck = await database.query(
      "SELECT 1 FROM user_information WHERE full_name = $1",
      [full_name]
    );
    if (fullNameCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        error: "Full name has already been taken"
      });
    }


    const password_hash = await bcrypt.hash(password, 12);

   
    const result = await database.query(
      `INSERT INTO user_information (email_address, full_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, email_address, full_name, is_admin`,
      [email_address, full_name, password_hash]
    );

    res.json({ success: true, user: result.rows[0] });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, error: "Signup failed" });
  }
});

export default router;

