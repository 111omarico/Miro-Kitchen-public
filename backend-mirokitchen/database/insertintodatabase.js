import database from "./connect-database.js";


const insertData = async () => {
  const client = await database.connect();

  try {
    console.log("Inserting sample data...");

    // Insert users
    const users = [
      [
        "exampleadmin@gmail.com",
        "cool admin",
        "$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy", // useriscool
        true
      ],
      [
        "exampleuser@gmail.com",
        "cool user",
        "$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy", // useriscool
        false
      ],
      [
        "exampleuser1@gmail.com",
        "cool1 user",
        "$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy", // useriscool
        false
      ],
      [
        "exampleuser2@gmail.com",
        "cool2 user",
        "$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy", // useriscool
        false
      ],
      [
        "exampleuser3@gmail.com",
        "cool3 user",
        "$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy", // useriscool
        false
      ],
    ];

    for (const user of users) {
      await client.query(
        `
      INSERT INTO user_information 
        (email_address, full_name, password_hash, is_admin)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING;
    `,
        user
      );
    }



    //const items = [
      /*[
        10.0, "Chicken Wings with BBQ Sauce", 0.0, 3,
        "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
        "There are no allergens in this item",
        "/public/Chips.png",
        "sides"
      ]
  [
    10.0, "Slowly Cooked Roast Beef with Gravy", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Slowly-Cooked-Roast-Beef-with-Gravy.png",
    "main-dishes"
  ],
  [
    10.0, "Slowly Cooked roast Brisket with BBQ sauce", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Slowly-Cooked-roast-Brisket-with-BBQ-sauce.png",
    "main-dishes"
  ],
  [
    10.0, "Chichen Shawarma", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Chichen-Shawarma.png",
    "main-dishes"
  ],
  [
    10.0, "Chips", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Chips.png",
    "sides"
  ],
  [
    10.0, "sour cream and chives", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/sour-cream-and-chives.png",
    "sides"
  ],
  [
    10.0, "Special garlic sauce", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Special-garlic-sauce.png",
    "sides"
  ],
  [
    10.0, "Onion rings 10 pieces", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Onion-rings-10-pieces.png",
    "sides"
  ],
  [
    10.0, "French fries", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/French-fries.png",
    "sides"
  ],
  [
    10.0, "5 Cheesy garlic bread", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/5-Cheesy-garlic-bread.png",
    "sides"
  ],
  [
    10.0, "5 garlic bread", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/5-garlic-bread.png",
    "sides"
  ],*/
  /*[
    10.0, "Fresh and healthy Greek salad and", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Fresh-and-healthy-Greek-salad-and.png",
    "salad"
  ],
  [
    10.0, "Large bowl Caesar salad with grilled chicken", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Large-bowl-Caesar-salad-with-grilled-chicken.png",
    "salad"
  ],/*
  [
    10.0, "Lasagna", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Lasagna.png",
    "pasta"
  ],
  [
    10.0, "Pasta Chicken Parmesan", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Pasta-Chicken-Parmesan.png",
    "pasta"
  ],
  [
    10.0, "Penne all'arrabiata(spicy)", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Penne-all'arrabiata(spicy).png",
    "pasta"
  ],
  [
    10.0, "Penne all'arrabiata", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Penne-all'arrabiata.png",
    "pasta"
  ]
  ,
  [
    10.0, "Philly cheesesteak sandwich(RIBEYE STEAK)", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Penne-all'arrabiata.png",
    "sandwiches"
  ]
  ,
  [
    10.0, "Chicken shawarama with garlic sauce", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Penne-all'arrabiata.png",
    "sandwiches"
  ]
  ,
  [
    10.0, "Slowly cooked roast Brisket with BBQ sauce sandwich", 0.0, 3,
    "Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.",
    "There are no allergens in this item",
    "/public/Penne-all'arrabiata.png",
    "sandwiches"
  ]*/
/*];

    

    for (const item of items) {
      await client.query(
        `INSERT INTO item_information 
          (item_price, item_name, discount, restriction,
           item_description, allergen_description, image, category)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT DO NOTHING;`,
        item
      );
    }


  */   

    // Insert purchases
 /*   await client.query(`
      INSERT INTO purchase (
        purchase_id, item_id, user_id, quantity,
        delivery_address, total_transaction, payment_confirmation
      )
        Values();
    `);
    */

    // Insert reviews
   /* await client.query(`
      INSERT INTO reviews (review_description, item_id, user_id, order_id)
       Values();
    `);*/

    console.log(" Insert complete");
  } catch (err) {
    console.error(" Error inserting data:", err);
  } finally {
    client.release();
  }
};

insertData();
