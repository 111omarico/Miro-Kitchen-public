import express from "express";
import database from "../database/connect-database.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

// GET all reviews with pagination, search, sorting
router.get("/all", requireLogin, async (req, res) => {
    if (!req.session.user?.is_admin) {
        return res.json({ success: false, error: "Unauthorized" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search?.trim() || "";
    const sort = req.query.sort || "newest";

    // Sorting
    let orderBy = "r.review_id DESC";
    if (sort === "oldest") orderBy = "r.review_id ASC";
    if (sort === "az") orderBy = "u.full_name ASC";
    if (sort === "za") orderBy = "u.full_name DESC";
    if (sort === "longest") orderBy = "LENGTH(r.review_description) DESC";
    if (sort === "shortest") orderBy = "LENGTH(r.review_description) ASC";

    try {
        let reviews;
        let total;

        if (search) {
            // WITH SEARCH
            const searchParam = `%${search}%`;

            reviews = await database.query(
                `SELECT r.review_id, r.review_description, r.user_id,
                        u.full_name, r.item_id, i.item_name
                 FROM reviews r
                 JOIN user_information u ON r.user_id = u.user_id
                 JOIN item_information i ON r.item_id = i.item_id
                 WHERE 
                    u.full_name ILIKE $1 OR 
                    i.item_name ILIKE $1 OR 
                    r.review_description ILIKE $1
                 ORDER BY ${orderBy}
                 LIMIT $2 OFFSET $3`,
                [searchParam, limit, offset]
            );

            total = await database.query(
                `SELECT COUNT(*) AS total
                 FROM reviews r
                 JOIN user_information u ON r.user_id = u.user_id
                 JOIN item_information i ON r.item_id = i.item_id
                 WHERE 
                    u.full_name ILIKE $1 OR 
                    i.item_name ILIKE $1 OR 
                    r.review_description ILIKE $1`,
                [searchParam]
            );
        } else {
            // WITHOUT SEARCH
            reviews = await database.query(
                `SELECT r.review_id, r.review_description, r.user_id,
                        u.full_name, r.item_id, i.item_name
                 FROM reviews r
                 JOIN user_information u ON r.user_id = u.user_id
                 JOIN item_information i ON r.item_id = i.item_id
                 ORDER BY ${orderBy}
                 LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            total = await database.query(
                `SELECT COUNT(*) AS total
                 FROM reviews r
                 JOIN user_information u ON r.user_id = u.user_id
                 JOIN item_information i ON r.item_id = i.item_id`,
                []
            );
        }

        res.json({
            success: true,
            reviews: reviews.rows,
            total: parseInt(total.rows[0].total),
            page,
            limit
        });

    } catch (err) {
        console.error("Admin review fetch error:", err);
        res.json({ success: false });
    }
});

// DELETE review
router.delete("/:reviewId", requireLogin, async (req, res) => {
    if (!req.session.user?.is_admin) {
        return res.json({ success: false, error: "Unauthorized" });
    }

    try {
        const reviewId = req.params.reviewId.toString().padStart(12, "0");

        const result = await database.query(
            `DELETE FROM reviews WHERE review_id = $1`,
            [reviewId]
        );

        res.json({ success: result.rowCount > 0 });
    } catch (err) {
        console.error("Admin review delete error:", err);
        res.json({ success: false });
    }
});

export default router;
