import Tokens from "csrf";
import { Context } from "koa";

import { ApiContext } from "../typings/App";

const ALLOWED_METHODS = ["GET", "HEAD", "OPTIONS"];
export const SECRET_COOKIE = "CSRF-Secret";
export const TOKEN_COOKIE = "CSRF-Token";
export const TOKEN_HEADER = "csrf-token"; // koa converts to lower-case

const TokenInstance = new Tokens();

/** Handles CSRF token generation and verification */
export function csrfMiddleware() {
  return async (ctx: ApiContext, next: () => void) => {
    const secret = ctx.cookies.get(SECRET_COOKIE);
    const tokenCookie = ctx.cookies.get(TOKEN_COOKIE);
    const tokenHeader = ctx.header[TOKEN_HEADER];

    // If the token/secret pair is invalid, generate a new one
    if (!secret || !tokenCookie) {
      await generateNewCsrfPair(ctx);
    }

    // Verify CSRF token for state-changing requests
    if (ALLOWED_METHODS.indexOf(ctx.request.method) === -1) {
      if (TokenInstance.verify(secret, tokenHeader) !== true) {
        ctx.standard(403, "Bad CSRF token");
        await generateNewCsrfPair(ctx);
        return;
      }
    }

    await next();
  };
}

async function generateNewCsrfPair(ctx: Context) {
  const newSecret = await TokenInstance.secret();
  ctx.cookies.set(SECRET_COOKIE, newSecret, {
    overwrite: true,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 86400000,
    path: "/"
  });

  const newToken = TokenInstance.create(newSecret);
  ctx.cookies.set(TOKEN_COOKIE, newToken, {
    overwrite: true,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    maxAge: 86400000,
    path: "/"
  });
}
