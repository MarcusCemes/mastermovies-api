import nanoid from "nanoid";

import { AuthConfig } from "../config/auth";
import { ServerConfig } from "../config/server";
import { BASE_PATH } from "../lib/createAppRouter";
import { signJwt, verifyJwt } from "../lib/jsonWebToken";
import { ApiContext, ApiSession } from "../typings/App";

const resolvedSession = Symbol("resolvedSession");

const SECURE_COOKIE_OPTIONS = {
  secure: ServerConfig.get("env") === "production",
  httpOnly: true,
  domain: ServerConfig.get("env") === "production" ? "api.mastermovies.uk" : void 0,
  overwrite: true
};

const SESSION_COOKIE_OPTIONS = {
  ...SECURE_COOKIE_OPTIONS,
  path: BASE_PATH + "/auth/"
};

/** Session handling, extension of the Auth endpoint */
export function sessionMiddleware() {
  // Return a middleware function
  return async (ctx: ApiContext, next: () => Promise<void>) => {
    // Attach a getSession method to the context
    ctx.getSession = () => getSession(ctx);

    // Attach a setSession method to the context
    let sessionUpdate = false;
    let newSession = null;

    ctx.setSession = (x: ApiSession | null) => {
      sessionUpdate = true;
      newSession = x;
      // Update the cached session for future getSession
      ctx.state[resolvedSession] = x;
    };

    await next();

    // Send the new JWT back to the client
    if (sessionUpdate) {
      if (newSession === null) {
        destroySession(ctx);
      } else {
        await saveSession(ctx, newSession);
      }
    }
  };
}

/** Verify and decode the JWT session. Caches the operation/result. */
async function getSession(ctx: ApiContext): Promise<ApiSession> {
  const secret = AuthConfig.get("jwtSecret");

  // Check if a nonce can be found (required)
  const nonce = ctx.cookies.get(AuthConfig.get("nonceCookie"));
  if (!nonce) return {};

  // Extract bearer token
  let token = null;
  const tokenHeader = ctx.request.header.authorization;
  if (typeof tokenHeader === "string" && tokenHeader.substring(0, 7) === "Bearer ") {
    token = tokenHeader.substring(7);
  }

  // Verify and decode token if present
  if (token !== null) {
    // If the session is being decoded (or has been), return the original Promise
    if (ctx.state[resolvedSession]) {
      return ctx.state[resolvedSession];
    } else {
      // Start verifying and decoding the session as a Promise
      const sessionPromise = (async () => {
        const verifiedJwt = await verifyJwt<ApiSession>(token, secret, nonce);

        if (verifiedJwt !== false) {
          return verifiedJwt;
        } else {
          return {};
        }
      })();

      // Cache the decoded token only if it hasn't already been set
      if (!ctx.state[resolvedSession]) ctx.state[resolvedSession] = sessionPromise;

      return ctx.state[resolvedSession];
    }
  }
  return {};
}

async function saveSession(ctx: ApiContext, session: ApiSession) {
  const secret = AuthConfig.get("jwtSecret");

  // Generate a new nonce
  const newNonce = nanoid();
  const lifetime = AuthConfig.get("lifetime");

  const signedJwt = await signJwt(session, secret, lifetime, newNonce);

  // Return the signed JWT in the response payload
  ctx.body.token = signedJwt;

  // Send the nonce to client as a secure cookie
  ctx.cookies.set(AuthConfig.get("nonceCookie"), newNonce, {
    ...SECURE_COOKIE_OPTIONS,
    maxAge: Math.floor(lifetime * 1000)
  });

  // Save an archived JWT for future retrieval
  ctx.cookies.set(AuthConfig.get("cookie"), signedJwt, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: Math.floor(lifetime * 1000)
  });
}

function destroySession(ctx: ApiContext): void {
  ctx.cookies.set(AuthConfig.get("nonceCookie"), null, SECURE_COOKIE_OPTIONS);
  ctx.cookies.set(AuthConfig.get("cookie"), null, SESSION_COOKIE_OPTIONS);
}
