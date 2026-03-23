import express from "express";
import bcrypt from "bcryptjs";
import database from "../database/connect-database.js";

const router = express.Router();




router.put("/password", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({
            success: false,
            error: "Password must be at least 6 characters",
        });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);

        await database.query(
            `UPDATE user_information
       SET password_hash = $1
       WHERE user_id = $2`,
            [hashed, req.session.user.user_id]
        );

        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Failed to update password" });
    }
});
router.delete("/account", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    try {
        await database.query(
            `DELETE FROM user_information WHERE user_id = $1`,
            [req.session.user.user_id]
        );

        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            return res.json({ success: true });
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Failed to delete account" });
    }
});

export default router;
