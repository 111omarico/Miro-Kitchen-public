import database from "./connect-database.js";

const dropDatabase = async () => {
  const client = await database.connect();
  try {
    await client.query(`
      DROP TRIGGER IF EXISTS user_information_generate_id ON user_information;
      DROP TRIGGER IF EXISTS purchase_generate_id ON purchase;
      DROP TRIGGER IF EXISTS delivery_information_generate_id ON delivery_information;

      DROP TABLE IF EXISTS session CASCADE;
      DROP TABLE IF EXISTS delivery_information CASCADE;
      DROP TABLE IF EXISTS purchase CASCADE;
      DROP TABLE IF EXISTS user_information CASCADE;

      DROP SEQUENCE IF EXISTS user_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS order_id_seq CASCADE;
      DROP SEQUENCE IF EXISTS delivery_id_seq CASCADE;
    `);

    console.log(" Database dropped ");
  } catch (err) {
    console.error(" Error dropping database:", err);
  } finally {
    client.release();
  }
};

dropDatabase();
