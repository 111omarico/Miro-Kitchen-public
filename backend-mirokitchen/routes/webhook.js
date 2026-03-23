import Stripe from "stripe";
import database from "../database/connect-database.js";
import dotenv from "dotenv";
dotenv.config({ path: "./backend-mirokitchen/.env" });

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export default async function webhookHandler(req, res) {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const address =
            session.shipping_details?.address ||
            session.customer_details?.address;

        const formattedAddress = address
            ? [
                address.line1,
                address.line2,
                address.city,
                address.postal_code,
                address.country
            ].filter(Boolean).join(", ")
            : null;

        const order_id = session.metadata.order_id;
        const final_total = session.amount_total / 100;

        try {
            await database.query(
                `UPDATE purchase
                 SET order_state = 'paid',
                     total_transaction = $1
                 WHERE order_id = $2`,
                [final_total, order_id]
            );

            await database.query(
                `INSERT INTO delivery_information (order_id, delivery_address)
                 VALUES ($1, $2)
                 ON CONFLICT (order_id) DO UPDATE SET delivery_address = $2`,
                [order_id, formattedAddress]
            );

        } catch (err) {
            return res.status(500).json({ error: "Database update failed" });
        }
    }

    return res.json({ received: true });
}
