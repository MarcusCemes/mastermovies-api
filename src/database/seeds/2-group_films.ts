import Knex from "knex";

import { Group } from "../../models/group";

const data = [{ group_id: 1, film_id: 2 }];

export async function seed(knex: Knex) {
  await knex.raw(`TRUNCATE ${Group.schemaName}.group_films RESTART IDENTITY CASCADE;`);
  await knex("group_films")
    .withSchema(Group.schemaName)
    .insert(data);
}
