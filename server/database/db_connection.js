require("dotenv").config();
const { createdb } = require("pgtools");
const { Pool } = require("pg");

if (process.env.NODE_ENV === "test") {
  process.env.POSTGRES_DB = process.env.POSTGRES_DB + "_test";
}

const config = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
};

const createDatabase = async () => {
  try {
    await createdb(config, config.database);
    console.log(`Database ${config.database} created`);
  } catch (error) {
    // ignore
  }
};

const dbPool = new Pool({
  ...config,
});

dbPool.connect((err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log(`Connected to database ${config.database}`);
  }
});

const databaseExists = async () => {
  const { rows } = await dbPool.query(
    `SELECT 1 FROM pg_database WHERE datname = '${config.database}'`,
  );
  return rows.length > 0;
};

const emptyDatabase = async () => {
  await dbPool.query(`
  DO
  $func$
    BEGIN
        EXECUTE
          (SELECT 'TRUNCATE TABLE ' || string_agg(oid::regclass::text, ', ') || ' CASCADE'
          FROM pg_class
          WHERE relkind = 'r' -- only tables
            AND relnamespace = 'public'::regnamespace);
    END
  $func$;
  `);
};

module.exports = { dbPool, databaseExists, createDatabase, emptyDatabase };
