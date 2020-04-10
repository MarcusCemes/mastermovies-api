import { createHash, randomBytes } from "crypto";
import { promisify } from "util";

import { Config } from "../config";
import { signJwt, verifyJwt } from "../lib/jsonWebToken";
import { IApiContext, IApiSession } from "../types/App";

const HASH_ALGORITHM = "blake2b512";

const JTI_SECRET_BYTES = 12;
const JTI_HASH_BYTES = 12;

const COOKIE_OPTIONS = {
  overwrite: true,
  maxAge: Math.floor(Config.get("auth").jwt.lifetime * 1000),
  httpOnly: true,
  secure: Config.get("env") === "production",
};

const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/** Session handling, extension of the Auth endpoint */
export function sessionMiddleware() {
  return async (ctx: IApiContext, next: () => Promise<void>) => {
    let modified = false;
    let session: IApiSession;

    ctx.session = {
      get: () => {
        if (typeof session !== "undefined") return session;
        return (session = deepFreeze(getSession(ctx)));
      },

      set: (newSession: IApiSession) => {
        session = deepFreeze(newSession);
        modified = true;
      },
    };

    await next();

    // Update the session
    if (modified) {
      if (session === null) {
        destroySession(ctx);
      } else {
        await setSession(ctx, session);
      }
    }
  };
}

/** Returns a valid session, or starts a new one */
function getSession(ctx: IApiContext): IApiSession {
  const { secret, jtiCookie } = Config.get("auth").jwt;

  // Get the Session ID and generate it's hash which must match the JWT's ID
  const jtiSecret = ctx.cookies.get(jtiCookie);
  if (!jtiSecret) return {};

  const jtiHash = BASE64_REGEX.test(jtiSecret)
    ? createHash(HASH_ALGORITHM).update(Buffer.from(jtiSecret, "base64")).digest().toString("base64", 0, JTI_HASH_BYTES)
    : null;

  // Extract bearer token
  const rawToken = ctx.request.header.authorization;

  const token: string =
    typeof rawToken === "string" && rawToken.substring(0, 7) === "Bearer " ? rawToken.substring(7) : null;

  if (token !== null) {
    const payload = verifyJwt(token, secret, jtiHash);

    if (payload !== false) {
      return payload;
    }
  }

  return {};
}

const randomBytesAsync = promisify(randomBytes);
/** Signs the session and deploys the required cookies/body parameters */
async function setSession(ctx: IApiContext, session: IApiSession) {
  const { secret, archiveCookie, jtiCookie, lifetime } = Config.get("auth").jwt;

  // Generate a unique ID and hash
  const jtiSecret = (await randomBytesAsync(JTI_SECRET_BYTES)).slice(0, JTI_SECRET_BYTES);
  const jtiHash = createHash(HASH_ALGORITHM).update(jtiSecret).digest().toString("base64", 0, JTI_HASH_BYTES);

  const signedSession = await signJwt(session, secret, lifetime, jtiHash);

  // Return the signed JWT in the response payload
  if (typeof ctx.body === "object" && ctx.body !== null) {
    ctx.body.token = signedSession;
  } else {
    ctx.body = {
      token: signedSession,
    };
  }

  // Set the jti secret as a HTTP-Only cookie
  ctx.cookies.set(jtiCookie, jtiSecret.toString("base64"), COOKIE_OPTIONS);

  // Save an archived JWT for future retrieval
  ctx.cookies.set(archiveCookie, signedSession, {
    ...COOKIE_OPTIONS,
    path: "/v2/auth/",
  });
}

/** Remove any session related cookies */
function destroySession(ctx: IApiContext): void {
  const { jtiCookie, archiveCookie } = Config.get("auth").jwt;
  ctx.cookies.set(jtiCookie, void 0, { ...COOKIE_OPTIONS, maxAge: void 0 });
  ctx.cookies.set(archiveCookie, void 0, { ...COOKIE_OPTIONS, maxAge: void 0, path: "/v2/auth" });

  if (typeof ctx.body === "object" && ctx.body !== null) {
    ctx.body.token = null;
  } else {
    ctx.body = {
      token: null,
    };
  }
}

/** https://github.com/substack/deep-freeze */
function deepFreeze<T extends object>(object: T): T {
  if (typeof object !== "object" || object === null) return object;

  Object.freeze(object);

  Object.getOwnPropertyNames(object).forEach((prop) => {
    if (
      object.hasOwnProperty(prop) &&
      object[prop] !== null &&
      (typeof object[prop] === "object" || typeof object[prop] === "function") &&
      !Object.isFrozen(object[prop])
    ) {
      deepFreeze(object[prop]);
    }
  });

  return object;
}
