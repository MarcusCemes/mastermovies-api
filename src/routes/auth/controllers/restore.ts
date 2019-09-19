import { AuthConfig } from "../../../config/auth";
import { verifyJwt } from "../../../lib/jsonWebToken";
import { ApiContext } from "../../../typings/App";

/** Retrieve the session from a archival cookie */
export async function restore(ctx: ApiContext) {
  const oldSession = ctx.cookies.get(AuthConfig.get("cookie"));
  const nonce = ctx.cookies.get(AuthConfig.get("nonceCookie"));

  ctx.body = {
    token: oldSession && nonce && (await verifyJwt(oldSession, AuthConfig.get("jwtSecret"), nonce)) ? oldSession : null
  }
}
