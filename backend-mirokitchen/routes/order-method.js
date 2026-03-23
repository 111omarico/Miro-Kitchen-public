import express from "express";
import database from "../database/connect-database.js";
import { requireLogin } from "../middleware/auth.js";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: "./backend-mirokitchen/.env" });

const router = express.Router();

async function getETAFromGoogle(address) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const origin = encodeURIComponent(process.env.KITCHEN_ADDRESS);
    const destination = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.rows?.[0]?.elements?.[0]?.duration || !data.rows[0].elements[0].distance) return null;

    return {
        seconds: data.rows[0].elements[0].duration.value,
        distanceMeters: data.rows[0].elements[0].distance.value
    };
}

router.get("/:orderId/delivery", requireLogin, async (req, res) => {
    try {
        const result = await database.query(
            `SELECT delivery_address FROM delivery_information WHERE order_id = $1`,
            [req.params.orderId]
        );

        if (result.rows.length === 0) return res.json({ success: false });

        res.json({ success: true, delivery_address: result.rows[0].delivery_address });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get("/:orderId/eta", requireLogin, async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const result = await database.query(
            `SELECT 
                p.timer_endtimestamp,
                p.order_state,
                d.delivery_address,
                d.eta_initial_seconds,
                d.eta_travel_seconds,
                d.eta_prep_seconds,
                d.eta_total_seconds,
                d.eta_distance_meters,
                d.eta_last_updated
             FROM purchase p
             JOIN delivery_information d ON p.order_id = d.order_id
             WHERE p.order_id = $1`,
            [orderId]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false });

        const row = result.rows[0];
        const now = Date.now();

        let prepSeconds = 0;
        if (row.timer_endtimestamp && row.order_state === "preparing") {
            const end = new Date(row.timer_endtimestamp).getTime();
            prepSeconds = Math.max(0, Math.floor((end - now) / 1000));
        }

        let etaInitialSeconds = row.eta_initial_seconds;
        let etaTravelSeconds = row.eta_travel_seconds;
        let etaLastUpdated = row.eta_last_updated;
        let distanceMeters = row.eta_distance_meters;

        let remainingTravelSeconds = 0;
        if (etaTravelSeconds && etaLastUpdated) {
            const last = new Date(etaLastUpdated).getTime();
            const elapsed = Math.floor((now - last) / 1000);
            remainingTravelSeconds = Math.max(0, etaTravelSeconds - elapsed);
        }

        let shouldRefreshETA = false;

        if (row.order_state === "out_for_delivery") {
            const last = etaLastUpdated ? new Date(etaLastUpdated).getTime() : 0;
            const diffMs = now - last;
            const isEarly =
                etaInitialSeconds &&
                remainingTravelSeconds > etaInitialSeconds * 0.9;

            if (!etaInitialSeconds) {
                shouldRefreshETA = true;
            } else if (diffMs > 5 * 60 * 1000 && isEarly) {
                shouldRefreshETA = true;
            }
        }

        if (shouldRefreshETA) {
            const etaTravel = await getETAFromGoogle(row.delivery_address);
            if (!etaTravel) return res.json({ success: false });

            const newFullEta = etaTravel.seconds;

            if (!etaInitialSeconds || etaInitialSeconds <= 0) {
                etaInitialSeconds = newFullEta;
            }

            let elapsed = 0;
            if (etaLastUpdated) {
                const last = new Date(etaLastUpdated).getTime();
                elapsed = Math.floor((now - last) / 1000);
            }

            const remaining = Math.max(0, newFullEta - elapsed);

            etaTravelSeconds = remaining;
            distanceMeters = etaTravel.distanceMeters;

            const totalSeconds = prepSeconds + remaining;

            const update = await database.query(
                `UPDATE delivery_information
                 SET 
                    eta_initial_seconds = $1,
                    eta_travel_seconds = $2,
                    eta_prep_seconds = $3,
                    eta_total_seconds = $4,
                    eta_distance_meters = $5,
                    eta_last_updated = NOW()
                 WHERE order_id = $6
                 RETURNING eta_last_updated`,
                [etaInitialSeconds, remaining, prepSeconds, totalSeconds, distanceMeters, orderId]
            );

            etaLastUpdated = update.rows[0].eta_last_updated;
            remainingTravelSeconds = etaTravelSeconds;
        }

        const totalSeconds = prepSeconds + remainingTravelSeconds;

        return res.json({
            success: true,
            prepSeconds,
            travelSeconds: remainingTravelSeconds,
            totalSeconds,
            distanceMeters
        });

    } catch {
        res.status(500).json({ success: false });
    }
});

router.put("/:orderId/complete", requireLogin, async (req, res) => {
    try {
        const result = await database.query(
            `UPDATE purchase SET order_state = 'completed' WHERE order_id = $1 RETURNING *`,
            [req.params.orderId]
        );
        res.json({ success: true, order: result.rows[0] });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.get("/", requireLogin, async (req, res) => {
    const user = req.session.user;

    try {
        await database.query(
            `DELETE FROM delivery_information WHERE created_at < NOW() - INTERVAL '30 days'`
        );

        let result;

        if (user.is_admin) {
            result = await database.query(`
                SELECT 
                    p.*, 
                    u.full_name, 
                    i.item_name,
                    (p.order_timestamp < NOW() - INTERVAL '30 days') AS is_expired
                FROM purchase p
                JOIN user_information u ON p.user_id = u.user_id
                JOIN item_information i ON p.item_id = i.item_id
                WHERE p.order_state NOT IN ('completed', 'rejected')
                ORDER BY p.order_timestamp DESC
            `);
        } else {
            result = await database.query(
                `
                SELECT 
                    p.*, 
                    i.item_name,
                    (p.order_timestamp < NOW() - INTERVAL '30 days') AS is_expired
                FROM purchase p
                JOIN item_information i ON p.item_id = i.item_id
                WHERE p.user_id = $1
                ORDER BY p.order_timestamp DESC
            `,
                [user.user_id]
            );
        }

        res.json({ success: true, orders: result.rows });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put("/:orderId/accept", requireLogin, async (req, res) => {
    if (!req.session.user.is_admin) return res.status(403).json({ success: false });

    try {
        const result = await database.query(
            "UPDATE purchase SET order_state = 'accepted' WHERE order_id = $1 RETURNING *",
            [req.params.orderId]
        );
        res.json({ success: true, order: result.rows[0] });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put("/:orderId/reject", requireLogin, async (req, res) => {
    if (!req.session.user.is_admin) return res.status(403).json({ success: false });

    try {
        const result = await database.query(
            "UPDATE purchase SET order_state = 'rejected' WHERE order_id = $1 RETURNING *",
            [req.params.orderId]
        );
        res.json({ success: true, order: result.rows[0] });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put("/:orderId/start-timer", requireLogin, async (req, res) => {
    if (!req.session.user.is_admin) return res.status(403).json({ success: false });

    const { seconds } = req.body;

    try {
        const result = await database.query(
            `UPDATE purchase
             SET 
                 timer_starttimestamp = NOW(),
                 timer_endtimestamp = NOW() + (CAST($1 AS INTEGER) * INTERVAL '1 second'),
                 order_state = 'preparing'
             WHERE order_id = $2
             RETURNING *`,
            [seconds, req.params.orderId]
        );

        res.json({ success: true, order: result.rows[0] });
    } catch {
        res.status(500).json({ success: false });
    }
});

router.put("/:orderId/mark-out-for-delivery", requireLogin, async (req, res) => {
    try {
        const result = await database.query(
            `UPDATE purchase
             SET order_state = 'out_for_delivery'
             WHERE order_id = $1
             RETURNING *`,
            [req.params.orderId]
        );

        await database.query(
            `UPDATE delivery_information
             SET delivery_state = 'out_for_delivery'
             WHERE order_id = $1`,
            [req.params.orderId]
        );

        res.json({ success: true, order: result.rows[0] });
    } catch {
        res.status(500).json({ success: false });
    }
});

export default router;
