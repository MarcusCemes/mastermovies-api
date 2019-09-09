import { HTTP_CODES } from "../../../middleware/respond";
import { Film } from "../../../models/film";
import { ApiContext } from "../../../typings/App";

export async function getFilm(ctx: ApiContext) {
  ctx.cache = 600;

  // Validate parameters
  if (isNaN(ctx.params.id)) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, "id must be a number");
    return;
  }

  // Load the film from the database
  const film = await Film.query()
    .findById(ctx.params.id)
    .eager("[thumbnails, exports]");
  if (film) {
    ctx.body.data = film;
  } else {
    ctx.standard(HTTP_CODES.NOT_FOUND);
  }
}
