import { HTTP_CODES } from "../../../middleware/respond";
import { Export } from "../../../models/export";
import { ApiContext } from "../../../typings/App";

export async function getExport(ctx: ApiContext) {
  ctx.cache = 600;

  // Validate parameters
  if (isNaN(ctx.params.id)) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, "id must be a number");
    return;
  }

  // Load the export from the database
  const query = Export.query().findById(ctx.params.id);

  // Attach relations
  if (typeof ctx.query.film !== "undefined") {
    query.eager("film");
  }

  const exp = await query;
  if (exp) {
    ctx.body.data = exp;
  } else {
    ctx.standard(HTTP_CODES.NOT_FOUND);
  }
}
