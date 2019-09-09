import Knex from "knex";
import { Film, IFilm } from "../../models/film";

const data: IFilm[] = [
  { id: 1, name: "A Day By The Sea", public: true, release: new Date(Date.now()), description: "A fabulous day by the sea" },
  { id: 2, name: "Great Adventures", public: false, release: new Date(Date.now()), description: "Just another travel video" },
  { id: 3, name: "Violent Storms", public: true, release: new Date(Date.now()), description: "Wow! So storm!" }
];

export async function seed(knex: Knex) {
  await knex.raw(`TRUNCATE ${Film.tableName} RESTART IDENTITY CASCADE;`);
  await Film.bindKnex(knex)
    .query()
    .insert(data);
}
