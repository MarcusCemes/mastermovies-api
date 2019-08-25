import Knex from "knex";

import { IKey, Key } from "../../models/key";

const data: IKey[] = [{ value: "Sea" }, { value: "Storm" }, { value: "Boats", expiry: new Date("2000-01-01") }];

export async function seed(knex: Knex) {
  await knex.raw(`TRUNCATE ${Key.tableName} RESTART IDENTITY CASCADE;`);
  await Key.bindKnex(knex)
    .query()
    .insert(data);
}
