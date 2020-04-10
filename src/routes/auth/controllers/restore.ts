import { createHash } from "crypto";

import { Config } from "../../../config";
import { verifyJwt } from "../../../lib/jsonWebToken";
import { IApiContext } from "../../../types/App";

const HASH_ALGORITHM = "blake2b512";
const JTI_HASH_BYTES = 12;
const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/** Retrieve the session from a archival cookie */
export async function restore(ctx: IApiContext) {
  const { secret, archiveCookie, jtiCookie } = Config.get("auth").jwt;

  const archivedSession = ctx.cookies.get(archiveCookie);
  const jtiSecret = ctx.cookies.get(jtiCookie);
  const jtiHash =
    jtiSecret &&
    BASE64_REGEX.test(jtiSecret) &&
    createHash(HASH_ALGORITHM).update(Buffer.from(jtiSecret, "base64")).digest().toString("base64", 0, JTI_HASH_BYTES);

  const validSession = jtiSecret && verifyJwt(archivedSession, secret, jtiHash);

  ctx.body = {
    token: validSession ? archivedSession : null,
  };
}
