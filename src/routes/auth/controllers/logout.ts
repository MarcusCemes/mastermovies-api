import { HTTP_CODES } from "../../../middleware/respond";
import { ApiContext } from "../../../typings/App";

/** Retrieve the session from a local cookie */
export async function logout(ctx: ApiContext) {
  ctx.setSession(null);
  ctx.standard(HTTP_CODES.OK);
}
