import express from "express";
import database from "../database/connect-database.js";
import { requireLogin } from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blacklist = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../blacklist.json"), "utf8")
);

const router = express.Router();

function containsBlacklistedWords(text) {
    const leetMap = {
        "0": "o", "1": "i", "3": "e", "4": "i", "5": "s", "7": "t",
        "@": "a", "$": "s", "!": "i", "€": "e", "£": "l", "¥": "y",
        "§": "s", "¢": "c", "∂": "d", "µ": "u", "ʊ": "u", "v": "u"
    };

    const normalize = str =>
        str
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, m => leetMap[m] || "")
            .replace(/(.)\1+/g, "$1")
            .replace(/\s+/g, " ")
            .trim();

    const normalizedText = normalize(text);

    // Check whitelist first - if match, allow it
    for (const whitelistedWord of blacklist.whitelistedWords) {
        const normalized = normalize(whitelistedWord);
        if (normalizedText.includes(normalized)) {
            return false;
        }
    }

    // Then check blacklist
    for (const raw of blacklist.blockedWords) {
        const word = normalize(raw);

        // direct substring match
        if (normalizedText.includes(word)) return true;

        // repeated word match: shitshitshit → collapse to single
        const repeatedPattern = new RegExp(`(${word}){2,}`, "i");
        if (repeatedPattern.test(normalizedText)) return true;

        // spaced-out letters
        const spacedPattern = word.split("").join("\\s+");
        if (new RegExp(`\\b${spacedPattern}\\b`, "i").test(normalizedText)) return true;

        // loose pattern
        const loosePattern = word.split("").join("\\s*");
        if (new RegExp(`\\b${loosePattern}\\b`, "i").test(normalizedText)) return true;
    }

    return false;
}

router.get("/can-review/:itemId", requireLogin, async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const itemId = req.params.itemId.toString().padStart(12, "0");

        const result = await database.query(
            `SELECT 1
             FROM purchase
             WHERE user_id = $1
               AND item_id = $2
               AND order_state = 'completed'
             LIMIT 1`,
            [userId, itemId]
        );

        res.json({ success: true, canReview: result.rows.length > 0 });
    } catch {
        res.json({ success: false });
    }
});

router.get("/:itemId", async (req, res) => {
    try {
        const itemId = req.params.itemId.toString().padStart(12, "0");

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const sort = req.query.sort || "newest";

        let orderBy = "r.review_id DESC";
        if (sort === "oldest") orderBy = "r.review_id ASC";
        if (sort === "longest") orderBy = "LENGTH(r.review_description) DESC";
        if (sort === "shortest") orderBy = "LENGTH(r.review_description) ASC";

        // Fetch paginated reviews
        const reviews = await database.query(
            `SELECT r.review_id,
                    r.review_description,
                    r.user_id,
                    u.full_name
             FROM reviews r
             JOIN user_information u ON r.user_id = u.user_id
             WHERE r.item_id = $1
             ORDER BY ${orderBy}
             LIMIT $2 OFFSET $3`,
            [itemId, limit, offset]
        );

        // Fetch total count
        const total = await database.query(
            `SELECT COUNT(*) AS total
             FROM reviews
             WHERE item_id = $1`,
            [itemId]
        );

        res.json({
            success: true,
            reviews: reviews.rows,
            total: parseInt(total.rows[0].total),
            page,
            limit
        });

    } catch (err) {
        console.error("Item review fetch error:", err);
        res.json({ success: false });
    }
});


router.post("/create", requireLogin, async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const itemId = req.body.itemId.toString().padStart(12, "0");
        const review = req.body.review;

        if (!review || review.length < 20 || review.length > 372) {
            return res.json({ success: false });
        }

        if (containsBlacklistedWords(review)) {
            return res.json({ success: false, error: "Review contains inappropriate language." });
        }

        const existingReview = await database.query(
            `SELECT review_id
             FROM reviews
             WHERE user_id = $1 AND item_id = $2
             LIMIT 1`,
            [userId, itemId]
        );

        if (existingReview.rows.length > 0) {
            return res.json({ success: false, error: "Review already exists" });
        }

        const purchaseCheck = await database.query(
            `SELECT order_id
             FROM purchase
             WHERE user_id = $1
               AND item_id = $2
               AND order_state = 'completed'
             LIMIT 1`,
            [userId, itemId]
        );

        if (purchaseCheck.rows.length === 0) {
            return res.json({ success: false });
        }

        const orderId = purchaseCheck.rows[0].order_id;

        const result = await database.query(
            `INSERT INTO reviews (review_description, item_id, user_id, order_id)
             VALUES ($1, $2, $3, $4)
             RETURNING review_id, review_description, user_id`,
            [review, itemId, userId, orderId]
        );

        const userInfo = await database.query(
            `SELECT full_name FROM user_information WHERE user_id = $1`,
            [userId]
        );

        res.json({
            success: true,
            review: {
                review_id: result.rows[0].review_id,
                review_description: result.rows[0].review_description,
                user_id: result.rows[0].user_id,
                full_name: userInfo.rows[0].full_name
            }
        });
    } catch {
        res.json({ success: false });
    }
});

router.patch("/:reviewId", requireLogin, async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const reviewId = req.params.reviewId.toString().padStart(12, "0");
        const { review } = req.body;

        if (!review || review.length < 20 || review.length > 372) {
            return res.json({ success: false });
        }

        if (containsBlacklistedWords(review)) {
            return res.json({ success: false, error: "Review contains inappropriate language." });
        }

        const result = await database.query(
            `UPDATE reviews
             SET review_description = $1
             WHERE review_id = $2 AND user_id = $3
             RETURNING review_id, review_description, user_id`,
            [review, reviewId, userId]
        );

        if (result.rows.length === 0) {
            return res.json({ success: false });
        }

        const userInfo = await database.query(
            `SELECT full_name FROM user_information WHERE user_id = $1`,
            [userId]
        );

        res.json({
            success: true,
            review: {
                review_id: result.rows[0].review_id,
                review_description: result.rows[0].review_description,
                user_id: result.rows[0].user_id,
                full_name: userInfo.rows[0].full_name
            }
        });
    } catch {
        res.json({ success: false });
    }
});

router.post("/moderate", (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.json({ allowed: true, error: "" });
    }

    const containsBadWords = containsBlacklistedWords(text);

    res.json({
        allowed: !containsBadWords,
        error: containsBadWords ? "Review contains inappropriate language." : ""
    });
});

router.delete("/:reviewId", requireLogin, async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const reviewId = req.params.reviewId.toString().padStart(12, "0");

        const result = await database.query(
            `DELETE FROM reviews
             WHERE review_id = $1 AND user_id = $2`,
            [reviewId, userId]
        );

        res.json({ success: result.rowCount > 0 });
    } catch {
        res.json({ success: false });
    }
});

export default router;
