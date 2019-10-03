import { Config } from "../config";
import { IApiContext } from "../types/App";

const DOMAIN_REGEX = /^http[s]?:\/\/(?:[\.\-\_a-zA-Z0-9]*\.)?mastermovies\.uk$/;

/** Apply the appropriate CORS headers. Certain safety features are disabled in non-production mode. */
export function corsMiddleware() {
  return async (ctx: IApiContext, next: () => Promise<void>) => {
    const origin = ctx.get("Origin");
    ctx.strictCors = false;

    ctx.set({
      "Access-Control-Allow-Headers": "Authorization, CSRF-Token, Content-Type",
      "Access-Control-Expose-Headers": "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": origin || "*"
    });

    await next();

    const production = Config.get("env") === "production";
    if (ctx.strictCors && production) {
      ctx.set("Access-Control-Allow-Origin", DOMAIN_REGEX.test(origin) ? origin : "https://mastermovies.uk");
    }
  };
}
