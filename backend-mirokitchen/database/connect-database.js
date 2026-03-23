
import pkg from "pg";
const { Pool } = pkg;

const database = new Pool({
  user: "postgres",
  host: "localhost",
  database: "miro-kitchen-database",
  password: "miro-kitchen",
  port: 5432,
});

export default database;
