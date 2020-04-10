import Knex from "knex";

import { Film } from "../../models/film";

const data = [
  { film_id: 1, key_id: 1 },
  { film_id: 3, key_id: 3 },
];

export async function seed(knex: Knex) {
  await knex.raw(`TRUNCATE ${Film.schemaName}.film_keys RESTART IDENTITY CASCADE;`);
  await knex("film_keys").withSchema(Film.schemaName).insert(data);
}
