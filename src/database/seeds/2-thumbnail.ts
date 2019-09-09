import Knex from "knex";

import { IThumbnail, Thumbnail } from "../../models/thumbnail";

const data: IThumbnail[] = [
  { id: 1, film_id: 1, width: 1280, height: 720, mime: "image/jpeg" },
  { id: 2, film_id: 1, width: 1920, height: 1080, mime: "image/webp" },
  { id: 3, film_id: 1, width: 1280, height: 720, mime: "image/svg+xml" },
  { id: 4, film_id: 2, width: 1280, height: 720, mime: "image/webp" },
  { id: 5, film_id: 3, width: 1280, height: 720, mime: "image/webp" }
];

export async function seed(knex: Knex) {
  await knex.raw(`TRUNCATE ${Thumbnail.tableName} RESTART IDENTITY CASCADE;`);
  await Thumbnail.bindKnex(knex)
    .query()
    .insert(data);
}
