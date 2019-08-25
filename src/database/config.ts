import { Config } from "knex";

import { DatabaseConfig } from "../config/database";

/** Returns various Knex environments */
export function getKnexOptions(): { development: Config; production: Config } {
  const { host, database, devDatabase, user, password, poolMax } = DatabaseConfig.getProperties();

  const baseOptions: Config = {
    client: "pg",
    useNullAsDefault: true,
    connection: {
      host,
      user,
      password
    },
    pool: {
      min: 2,
      max: poolMax
    },
    migrations: {
      directory: "build/database/migrations",
      tableName: "knex_migrations",
      loadExtensions: [".js"]
    },
    seeds: {
      directory: "build/database/seeds",
      // @ts-ignore
      loadExtensions: [".js"]
    }
  };

  return {
    development: {
      ...baseOptions,
      connection: {
        ...(baseOptions.connection as object),
        database: devDatabase
      }
    },

    production: {
      ...baseOptions,
      connection: {
        ...(baseOptions.connection as object),
        database
      }
    }
  };
}
