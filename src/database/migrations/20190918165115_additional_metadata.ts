import Knex from "knex";

export const up = (knex: Knex) =>
  knex.transaction(transaction =>
    Promise.all([
      // Create model tables
      transaction.schema.withSchema("glacier").table("film", table => {
        table
          .integer("views")
          .notNullable()
          .unsigned()
          .defaultTo(0);
        table.integer("runtime").unsigned();
      }),
      transaction.schema.withSchema("glacier").table("export", table => {
        table.integer("bitrate").unsigned();
      }),
      transaction.schema.withSchema("glacier").createTable("log_auth", table => {
        table.bigIncrements("id").primary();
        table
          .timestamp("timestamp", { useTz: true })
          .notNullable()
          .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        table
          .integer("film_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("glacier.film");
        table
          .integer("key_id")
          .unsigned()
          .references("id")
          .inTable("glacier.key");
        table.specificType("ip", "CIDR").notNullable();
        table.boolean("success").notNullable();
      })
    ])
  );

export const down = (knex: Knex) =>
  knex.transaction(transaction =>
    Promise.all([
      transaction.schema.withSchema("glacier").table("film", table => {
        table.dropColumns("views", "runtime");
      }),
      transaction.schema.withSchema("glacier").table("export", table => {
        table.dropColumns("bitrate");
      }),
      transaction.schema.withSchema("glacier").dropTableIfExists("log_auth")
    ])
  );
