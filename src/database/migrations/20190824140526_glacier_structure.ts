import Knex from "knex";

export const up = (knex: Knex) =>
  Promise.all([
    // Create model tables
    knex.schema.withSchema("glacier").createTable("film", table => {
      table.increments("id").primary();
      table
        .string("name")
        .unique()
        .notNullable();
      table.boolean("public").notNullable();
      table.string("description");
      table.dateTime("release");
      table.string("location");
      table.string("copyright");
      table.json("crew");
    }),
    knex.schema.withSchema("glacier").createTable("group", table => {
      table.increments("id").primary();
      table
        .string("name")
        .unique()
        .notNullable();
      table.string("description");
    }),
    knex.schema.withSchema("glacier").createTable("key", table => {
      table.increments("id").primary();
      table.string("value").notNullable();
      table.dateTime("expiry");
    }),
    knex.schema.withSchema("glacier").createTable("thumbnail", table => {
      table.increments("id").primary();
      table
        .integer("film_id")
        .notNullable()
        .unsigned()
        .references("id")
        .inTable("glacier.film");
      table.integer("width").unsigned();
      table.integer("height").unsigned();
      table.string("mime");
    }),
    knex.schema.withSchema("glacier").createTable("export", table => {
      table.increments("id").primary();
      table
        .integer("film_id")
        .notNullable()
        .unsigned()
        .references("id")
        .inTable("glacier.film");
      table.string("filename").notNullable();
      table.integer("width").unsigned();
      table.integer("height").unsigned();
      table.string("mime");
      table.bigInteger("size").unsigned();
      table.string("video_codec");
      table.string("audio_codec");
      table.json("checksum");
    }),

    // Create Many-To-Many relationship tables
    knex.schema.withSchema("glacier").createTable("group_films", table => {
      table
        .integer("group_id")
        .notNullable()
        .unsigned()
        .references("id")
        .inTable("glacier.group");
      table
        .integer("film_id")
        .notNullable()
        .unsigned()
        .references("id")
        .inTable("glacier.film");
      table.primary(["group_id", "film_id"]);
    }),
    knex.schema.withSchema("glacier").createTable("group_keys", table => {
      table
        .integer("group_id")
        .notNullable()
        .unsigned()
        .references("id")
        .inTable("glacier.group");
      table
        .integer("key_id")
        .notNullable()
        .unsigned()
        .references("id")
        .inTable("glacier.key");
      table.primary(["group_id", "key_id"]);
    }),
    knex.schema.withSchema("glacier").createTable("film_keys", table => {
      table
        .integer("film_id")
        .notNullable()
        .unsigned()
        .references("id")
        .inTable("glacier.film");
      table
        .integer("key_id")
        .notNullable()
        .unsigned()
        .references("id")
        .inTable("glacier.key");
      table.primary(["film_id", "key_id"]);
    })
  ]);

export const down = (knex: Knex) =>
  Promise.all(
    ["film", "group", "key", "thumbnail", "export", "group_films", "group_keys", "film_keys"].map(v =>
      knex.schema.raw(`DROP TABLE glacier.${v} CASCADE;`)
    )
  );
