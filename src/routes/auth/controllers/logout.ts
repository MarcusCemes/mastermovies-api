import { HTTP_CODES } from "../../../middleware/respond";
import { IApiContext } from "../../../types/App";

/** Retrieve the session from a local cookie */
export async function logout(ctx: IApiContext) {
  ctx.session.set(null);
  ctx.standard(HTTP_CODES.OK);
}
