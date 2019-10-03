import { Film } from "../../../models/film";
import { IApiContext } from "../../../types/App";

export async function listFilms(ctx: IApiContext) {
  ctx.cache = 600;

  const query = Film.query().columns(["id", "name", "release"]);
  if (typeof ctx.request.query.public !== "undefined") query.where("public", true);

  // Handle sorting/ordering
  const { sort_by } = ctx.request.query;
  const order_by = ctx.request.query.order_by === "desc" ? "desc" : "asc";
  if (typeof sort_by !== "undefined") {
    switch (sort_by) {
      case "release":
        query.orderBy("release", order_by);
        break;

      case "name":
        query.orderBy("name", order_by);
        break;
      case "views":
        query.orderBy("views", order_by);
        break;
    }
  }

  ctx.body = { data: await query };
}
