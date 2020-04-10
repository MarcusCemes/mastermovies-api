import { Config } from "knex";

import * as AppConfig from "../config";

/** Returns various Knex environments */
export function getKnexOptions(): { development: Config; production: Config } {
  const { host, productionDb, developmentDb, user, password, poolMax } = AppConfig.Config.get("database");

  const baseOptions: Config = {
    client: "pg",
    useNullAsDefault: true,
    connection: {
      host,
      user,
      password,
    },
    pool: {
      min: 2,
      max: poolMax,
    },
    migrations: {
      directory: "build/database/migrations",
      tableName: "glacier_knex_migrations",
      loadExtensions: [".js"],
    },
    seeds: {
      directory: "build/database/seeds",
      // @ts-ignore
      loadExtensions: [".js"],
    },
  };

  return {
    development: {
      ...baseOptions,
      connection: {
        ...(baseOptions.connection as object),
        database: developmentDb,
      },
    },

    production: {
      ...baseOptions,
      connection: {
        ...(baseOptions.connection as object),
        database: productionDb,
      },
    },
  };
}
