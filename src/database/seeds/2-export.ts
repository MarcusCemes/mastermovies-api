import Knex from "knex";

import { Export, IExport } from "../../models/export";

const data: IExport[] = [
  { id: 1, film_id: 1, filename: "Another holiday.mp4", width: 1920, height: 1080, mime: "video/mp4" },
  { id: 2, film_id: 2, filename: "Another holiday.webm", width: 3840, height: 2160, mime: "video/webm" },
];

export async function seed(knex: Knex) {
  await knex.raw(`TRUNCATE ${Export.tableName} RESTART IDENTITY CASCADE;`);
  await Export.bindKnex(knex).query().insert(data);
}
