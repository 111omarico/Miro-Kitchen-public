import express from "express";
import fs from "fs";
import path from "path";
import database from "../database/connect-database.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

router.patch("/:id", requireLogin, async (req, res) => {
  if (!req.session.user.is_admin) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }

  const { id } = req.params;

  const allowedFields = [
    "item_name",
    "item_description",
    "allergen_description",
    "discount",
    "item_price",
    "restriction",
    "image"
  ];

  const updates = Object.entries(req.body).filter(([key]) =>
    allowedFields.includes(key)
  );

  if (updates.length === 0) {
    return res.status(400).json({ success: false, error: "No valid fields provided" });
  }

  try {
    for (let [field, value] of updates) {

      if (field === "discount") {
        const numeric = Number(value);

        if (isNaN(numeric) || numeric < 0 || numeric > 100) {
          return res.json({ success: false, error: "Discount must be between 0 and 100" });
        }

        value = numeric / 100; // convert to decimal
      }

    
      if (field === "image" && value.startsWith("data:image")) {
        const base64Data = value.replace(/^data:image\/\w+;base64,/, "");
        const filename = Date.now() + ".png";
        const filepath = path.join("public/images", filename);

        fs.writeFileSync(filepath, base64Data, "base64");

        const url = `/images/${filename}`;

        await database.query(
          "UPDATE item_information SET image = $1 WHERE item_id = $2",
          [url, id]
        );

        return res.json({ success: true, url });
      }


      await database.query(
        `UPDATE item_information SET ${field} = $1 WHERE item_id = $2`,
        [value, id]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Item update error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
