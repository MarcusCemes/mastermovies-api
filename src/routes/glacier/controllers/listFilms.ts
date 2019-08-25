import { Film } from "../../../models/film";
import { ApiContext } from "../../../typings/App";

export async function listFilms(ctx: ApiContext) {
  ctx.cache = "1 hour";
  ctx.body.data = await Film.query().columns(["id", "name", "release"]);
}
