// Create and manage a database pool
import { Application } from "express";
import { Pool } from "pg";

import { error } from "../common/logger";

/** Create a database connection pool */
export default async function initialize(app: Application): Promise<void> {

  const pool = new Pool().on("error", err => {
    error("Database: Unexpected error on idle client (pool)", () => {
      throw err;
    });
  });

  await test(pool);

  // Attach the database to the app
  app.db = pool;

}

/** Test the database connection */
async function test(pool: Pool): Promise<void> {
  const client = await pool.connect();
  const result = await client.query("SELECT NOW();");
  if (result.rows.length !== 1) {
    throw new Error("Invalid response from database query");
  } else {
    client.release();
  }
}