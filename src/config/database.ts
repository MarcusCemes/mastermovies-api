import { createConfig } from "./utils";

export const DatabaseConfig = createConfig("DatabaseConfig", {
  host: {
    doc: "The hostname of the Postgres server",
    format: String,
    default: "127.0.0.1",
    env: "PGHOST"
  },
  port: {
    doc: "THe port of the Postgres server",
    format: "port",
    default: 5432,
    env: "PGPORT"
  },
  user: {
    doc: "The username to use when connecting to Postgres",
    format: String,
    default: "node",
    env: "PGUSERNAME"
  },
  password: {
    doc: "The password to use when connecting to Postgres",
    format: String,
    default: "",
    env: "PGPASSWORD"
  },
  database: {
    doc: "The database to use when connecting to Postgres",
    format: String,
    default: "mastermovies",
    env: "PGDATABASE"
  },
  devDatabase: {
    doc: "The database to use when connecting to Postgres (non-production environment)",
    format: String,
    default: "mastermovies_dev",
    env: "PGDATABASE_DEV"
  },
  poolMax: {
    doc: "The maximum connection pool size",
    format: Number,
    default: 16,
    env: "DATABASE_POOL_MAX"
  }
});
