import { Schema } from "convict";

export interface IDatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  productionDb: string;
  developmentDb: string;
  poolMax: number;
}

export const DatabaseConfig: Schema<IDatabaseConfig> = {
  host: {
    doc: "The hostname of the Postgres server",
    format: String,
    default: "127.0.0.1",
    env: "DATABASE_HOST",
  },
  port: {
    doc: "THe port of the Postgres server",
    format: "port",
    default: 5432,
    env: "DATABASE_PORT",
  },
  user: {
    doc: "The username to use when connecting to Postgres",
    format: String,
    default: "node",
    env: "DATABASE_USER",
  },
  password: {
    doc: "The password to use when connecting to Postgres",
    format: String,
    default: "",
    env: "DATABASE_PASSWORD",
    sensitive: true,
  },
  productionDb: {
    doc: "The production database to use when connecting to Postgres",
    format: String,
    default: "mastermovies",
    env: "DATABASE_PRODUCTION_DB",
  },
  developmentDb: {
    doc: "The development database to use when connecting to Postgres",
    format: String,
    default: "mastermovies_dev",
    env: "DATABASE_DEVELOPMENT_DB",
  },
  poolMax: {
    doc: "The maximum connection pool size",
    format: Number,
    default: 16,
    env: "DATABASE_POOL_MAX",
  },
};
