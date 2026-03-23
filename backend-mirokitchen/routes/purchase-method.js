import dotenv from "dotenv";
dotenv.config({ path: "./backend-mirokitchen/.env" });
import express from "express";
import Stripe from "stripe";
import database from "../database/connect-database.js";

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
    try {
        const { order_id, item_id, quantity } = req.body;

        const itemResult = await database.query(
            "SELECT item_price, discount, item_name FROM item_information WHERE item_id = $1",
            [item_id]
        );

        const price = Number(itemResult.rows[0].item_price);
        const discount = Number(itemResult.rows[0].discount);
        const item_name = itemResult.rows[0].item_name;

        const discounted_unit_price = price * (1 - discount);

        const priceObject = await stripe.prices.create({
            currency: "gbp",
            unit_amount: Math.round(discounted_unit_price * 100),
            product_data: { name: item_name }
        });

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceObject.id,
                    quantity,
                    tax_rates: [process.env.STRIPE_UK_VAT_TAX_RATE]
                }
            ],
            success_url: "http://localhost:5173/order",
            cancel_url: "http://localhost:5173/cancel",
            shipping_address_collection: {
                allowed_countries: ["GB"]
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: { amount: 0, currency: "gbp" },
                        display_name: "Standard Delivery"
                    }
                }
            ],
            metadata: {
                order_id,
                item_id,
                quantity,
                discounted_unit_price
            }
        });

        res.json({ url: session.url });

    } catch (err) {
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

export default router;
