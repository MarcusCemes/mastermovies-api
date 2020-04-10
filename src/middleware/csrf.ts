import { createHash, randomBytes } from "crypto";
import { Context } from "koa";
import { promisify } from "util";

import { logger } from "../lib/logger";
import { IApiContext } from "../types/App";

const ALLOWED_METHODS = ["GET", "HEAD", "OPTIONS"];

const HASH_ALGORITHM = "blake2b512";
const SECRET_BYTES = 12;
const TOKEN_BYTES = 12;

const SECRET_COOKIE = "CSRF-Secret";
const TOKEN_COOKIE = "CSRF-Token";
const TOKEN_HEADER = "CSRF-Token";
const TOKEN_DOMAIN = ".mastermovies.uk";

const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/** Handle CSRF generation/verification */
export function csrfMiddleware() {
  return async (ctx: IApiContext, next: () => Promise<void>) => {
    const secret = ctx.cookies.get(SECRET_COOKIE);
    const tokenCookie = ctx.cookies.get(TOKEN_COOKIE);
    const tokenHeader = ctx.header[TOKEN_HEADER.toLowerCase()]; // koa parses as lower-case

    let newPairRequired = false;
    let csrfAuthorised = false;

    // If the token/secret is not valid, generate a new pair
    if (!secret || !tokenCookie) {
      newPairRequired = true;
    }

    // Don't verify CSRF for non state-changing requests
    if (ALLOWED_METHODS.indexOf(ctx.request.method) !== -1) {
      csrfAuthorised = true;
    } else if (secret && tokenHeader) {
      // Check that the token and secret match cryptographically
      if (BASE64_REGEX.test(tokenHeader) && BASE64_REGEX.test(tokenHeader)) {
        const rawToken = Buffer.from(tokenHeader, "base64");
        const rawSecret = Buffer.from(secret, "base64");

        const expectedToken = createHash(HASH_ALGORITHM).update(Buffer.from(rawSecret)).digest().slice(TOKEN_BYTES);
        if (Buffer.compare(rawToken, expectedToken)) {
          csrfAuthorised = true;
        }
      }
    }

    if (newPairRequired) {
      await setNewCsrfPair(ctx);
    }

    if (!csrfAuthorised) {
      ctx.standard(403, "Bad CSRF token");
      await setNewCsrfPair(ctx);
      return;
    }

    return next();
  };
}

const randomBytesAsync = promisify(randomBytes);
async function setNewCsrfPair(ctx: Context) {
  try {
    const rawSecret = await randomBytesAsync(SECRET_BYTES);
    const token = createHash(HASH_ALGORITHM).update(rawSecret).digest().toString("base64", 0, TOKEN_BYTES);

    ctx.cookies.set(SECRET_COOKIE, rawSecret.toString("base64"), {
      overwrite: true,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 86400000,
      path: "/",
    });

    ctx.cookies.set(TOKEN_COOKIE, token, {
      overwrite: true,
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      maxAge: 86400000,
      path: "/",
      domain: TOKEN_DOMAIN,
    });
  } catch (err) {
    logger.error({ msg: "Failed to generate CSRF token", err });
    throw err;
  }
}
