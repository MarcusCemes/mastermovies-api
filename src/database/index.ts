import Knex from "knex";
import { Model } from "objection";

import { ServerConfig } from "../config/server";
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
  logger.debug("[DATABASE] Performing first time initialisation...");

  // Create the knex instance
  let databaseEnvironment: "production" | "development";
  if (ServerConfig.get("env") === "production") {
    databaseEnvironment = "production";
    logger.info("[DATABASE] Connected to PRODUCTION database");
  } else {
    databaseEnvironment = "development";
  }

  const newKnex = Knex(getKnexOptions()[databaseEnvironment]);

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
