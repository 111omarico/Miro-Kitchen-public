import database from "./connect-database.js";

const createDatabase = async () => {
  const client = await database.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS user_id_seq START 1 INCREMENT 1 MINVALUE 0 MAXVALUE 999999999999;
      CREATE SEQUENCE IF NOT EXISTS item_id_seq START 1 INCREMENT 1 MINVALUE 0 MAXVALUE 999999999999;
      CREATE SEQUENCE IF NOT EXISTS review_id_seq START 1 INCREMENT 1 MINVALUE 0 MAXVALUE 999999999999;
      CREATE SEQUENCE IF NOT EXISTS order_id_seq START 1 INCREMENT 1 MINVALUE 0 MAXVALUE 999999999999;
      CREATE SEQUENCE IF NOT EXISTS delivery_id_seq START 1 INCREMENT 1 MINVALUE 0 MAXVALUE 999999999999;

      CREATE OR REPLACE FUNCTION generate_user_id() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.user_id IS NULL OR trim(NEW.user_id) = '' THEN
          NEW.user_id := lpad(nextval('user_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION generate_item_id() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.item_id IS NULL OR trim(NEW.item_id) = '' THEN
          NEW.item_id := lpad(nextval('item_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION generate_order_id() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.order_id IS NULL OR trim(NEW.order_id) = '' THEN
          NEW.order_id := lpad(nextval('order_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION generate_review_id() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.review_id IS NULL OR trim(NEW.review_id) = '' THEN
          NEW.review_id := lpad(nextval('review_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION generate_delivery_id() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.delivery_id IS NULL OR trim(NEW.delivery_id) = '' THEN
          NEW.delivery_id := lpad(nextval('delivery_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TABLE IF NOT EXISTS user_information (
        user_id VARCHAR(12) PRIMARY KEY,
        email_address VARCHAR(47) NOT NULL CHECK (char_length(email_address) > 12),
        full_name VARCHAR(30) NOT NULL CHECK (char_length(full_name) > 3),
        password_hash VARCHAR(350) NOT NULL CHECK (char_length(password_hash) > 5),
        is_admin BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS item_information (
        item_id VARCHAR(12) PRIMARY KEY,
        item_price NUMERIC(7,2) NOT NULL CHECK (item_price > 0 AND item_price <= 99999.99),
        item_name TEXT NOT NULL,
        discount NUMERIC(4,2) NOT NULL CHECK (discount >= 0 AND discount <= 1),
        restriction INTEGER NOT NULL CHECK (restriction >= 0 AND restriction <= 99999),
        item_description TEXT NOT NULL,
        allergen_description TEXT NOT NULL CHECK (char_length(allergen_description) >= 12),
        image TEXT,
        category TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS purchase (
        order_id VARCHAR(12) PRIMARY KEY,
        item_id VARCHAR(12) NOT NULL,
        user_id VARCHAR(12) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 99999),
        total_transaction NUMERIC(7,2) NOT NULL CHECK (total_transaction >= 0 AND total_transaction <= 99999.99),
        order_state TEXT NOT NULL DEFAULT 'pending' CHECK (order_state IN (
          'pending',
          'accepted',
          'paid',
          'preparing',
          'out_for_delivery',
          'completed',
          'rejected'
        )),
        timer_starttimestamp TIMESTAMP DEFAULT NULL,
        timer_endtimestamp TIMESTAMP DEFAULT NULL,
        order_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (item_id) REFERENCES item_information(item_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES user_information(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS delivery_information (
        delivery_id VARCHAR(12) PRIMARY KEY,
        order_id VARCHAR(12) NOT NULL UNIQUE,
        delivery_address TEXT NOT NULL,
        eta_initial_seconds INTEGER,
        eta_travel_seconds INTEGER,
        eta_prep_seconds INTEGER,
        eta_total_seconds INTEGER,
        eta_distance_meters INTEGER,
        eta_last_updated TIMESTAMP DEFAULT NOW(),
        delivery_state TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_state IN (
          'pending',
          'preparing',
          'out_for_delivery',
          'completed'
        )),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (order_id) REFERENCES purchase(order_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reviews (
        review_id VARCHAR(12) PRIMARY KEY,
        review_description VARCHAR(372) NOT NULL CHECK (char_length(review_description) >= 20 AND char_length(review_description) <= 372),
        item_id VARCHAR(12) NOT NULL,
        user_id VARCHAR(12) NOT NULL,
        order_id VARCHAR(12) NOT NULL,
        FOREIGN KEY (item_id) REFERENCES item_information(item_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES user_information(user_id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES purchase(order_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );

      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'user_information_generate_id') THEN
              CREATE TRIGGER user_information_generate_id
              BEFORE INSERT ON user_information
              FOR EACH ROW EXECUTE FUNCTION generate_user_id();
          END IF;

          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'item_information_generate_id') THEN
              CREATE TRIGGER item_information_generate_id
              BEFORE INSERT ON item_information
              FOR EACH ROW EXECUTE FUNCTION generate_item_id();
          END IF;

          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'purchase_generate_id') THEN
              CREATE TRIGGER purchase_generate_id
              BEFORE INSERT ON purchase
              FOR EACH ROW EXECUTE FUNCTION generate_order_id();
          END IF;

          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'reviews_generate_id') THEN
              CREATE TRIGGER reviews_generate_id
              BEFORE INSERT ON reviews
              FOR EACH ROW EXECUTE FUNCTION generate_review_id();
          END IF;

          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'delivery_information_generate_id') THEN
              CREATE TRIGGER delivery_information_generate_id
              BEFORE INSERT ON delivery_information
              FOR EACH ROW EXECUTE FUNCTION generate_delivery_id();
          END IF;
      END $$;
    `);

    await client.query("COMMIT");
    console.log(" Database created ");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(" Error creating Database:", err);
  } finally {
    client.release();
  }
};

export default createDatabase();
