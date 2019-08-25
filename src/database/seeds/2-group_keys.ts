import Knex from "knex";

import { Group } from "../../models/group";

const data = [{ group_id: 1, key_id: 2 }, { group_id: 2, key_id: 3 }];

export async function seed(knex: Knex) {
  await knex.raw(`TRUNCATE ${Group.schemaName}.group_keys RESTART IDENTITY CASCADE;`);
  await knex("group_keys")
    .withSchema(Group.schemaName)
    .insert(data);
}
