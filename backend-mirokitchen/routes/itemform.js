import express from "express";
import database from "../database/connect-database.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireLogin, async (req, res) => {
    const { itemId, quantity } = req.body;
    const userId = req.session.user?.user_id;

    if (!itemId || !quantity || !userId) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
        const itemResult = await database.query(
            "SELECT item_price, discount FROM item_information WHERE item_id = $1",
            [itemId]
        );

        if (itemResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: "Item not found" });
        }

        const { item_price, discount } = itemResult.rows[0];
        const finalPrice = item_price * (1 - discount);
        const total = finalPrice * quantity;
        const insertResult = await database.query(
            `INSERT INTO purchase (item_id, user_id, quantity, total_transaction)
   VALUES ($1, $2, $3, $4)
   RETURNING order_id`,
            [itemId, userId, quantity, total.toFixed(2)]
        );

        res.json({ success: true, orderId: insertResult.rows[0].order_id });


    } catch (err) {
        console.error("Error creating purchase:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;
