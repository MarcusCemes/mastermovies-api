import { Film } from "../../../models/film";
import { ApiContext } from "../../../typings/App";

export async function listFilms(ctx: ApiContext) {
  ctx.cache = 600;

  const query = Film.query().columns(["id", "name", "release"]);
  if (typeof ctx.request.query.public !== "undefined") query.where("public", true);

  ctx.body.data = await query;
}
