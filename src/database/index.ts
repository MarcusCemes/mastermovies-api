import Knex from "knex";
import { Model } from "objection";

import { Config } from "../config";
import { logger } from "../lib/logger";
import { getKnexOptions } from "./config";

let db: Knex = null;

/** Return an an instance of the database connection */
export function getDatabase(): Knex {
  if (!db) db = initDatabase();
  return db;
}

/** Initialise and test the database connection */
function initDatabase(): Knex {
  logger.debug("[DATABASE] Initialising database connection...");

  const databaseEnvironment = Config.get("env") === "production" ? "production" : "development";
  const options: Knex.Config = getKnexOptions()[databaseEnvironment];

  // @ts-ignore
  logger.info(`[DATABASE] Connected to database "${options.connection.database}"`);

  const newKnex = Knex(options);

  // Pass knex to Objection
  Model.knex(newKnex);

  return newKnex;
}

/**
 * Test the database connection
 * @throws {Error} A database based error on connection error
 */
export async function testDatabase() {
  logger.debug("[DATABASE] Testing database connection...");
  const connection = getDatabase();
  await connection.raw("SELECT 1;");
}
