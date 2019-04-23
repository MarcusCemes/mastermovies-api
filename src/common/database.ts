// Create and manage a database pool
import { Pool, PoolClient, QueryResult } from "pg";

import { error } from "../common/logger";

/**
 * Create and test the database pool asynchronously
 *
 * Immediately terminates the application if a correct
 * database connection cannot be established.
 */
export async function createPool(): Promise<Pool> {
  const pool = new Pool().on("error", err => {
    error("Database: Unexpected error on idle client (pool)", () => {
      throw err;
    });
  });

  // Test the database connection
  let client: PoolClient;
  let result: QueryResult;
  try {
    client = await pool.connect();
    result = await client.query("SELECT NOW();");
    if (result.rows.length !== 1) {
      throw new Error("Invalid response from database query");
    }
    client.release();
  } catch (err) {
    error("Database connection error:");
    error(err.message || err, () => process.exit(1));
  }

  return pool;
}
