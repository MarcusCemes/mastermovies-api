import Knex from "knex";

import { Group, IGroup } from "../../models/group";

const data: IGroup[] = [
  { id: 1, name: "Friends" },
  { id: 2, name: "Family" },
];

export async function seed(knex: Knex) {
  await knex.raw(`TRUNCATE ${Group.tableName} RESTART IDENTITY CASCADE;`);
  await Group.bindKnex(knex).query().insert(data);
}
