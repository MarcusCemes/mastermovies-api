import { HTTP_CODES } from "../../../middleware/respond";
import { Thumbnail } from "../../../models/thumbnail";
import { ApiContext } from "../../../typings/App";

export async function getThumbnail(ctx: ApiContext) {
  ctx.cache = 600;

  // Validate parameters
  if (isNaN(ctx.params.id)) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, "id must be a number");
    return;
  }

  // Load the thumbnail from the database
  const query = Thumbnail.query().findById(ctx.params.id);

  // Attach relations
  if (typeof ctx.query.film !== "undefined") {
    query.eager("film");
  }

  const thumb = await query;
  if (thumb) {
    ctx.body = { data: thumb };
  } else {
    ctx.standard(HTTP_CODES.NOT_FOUND);
  }
}
