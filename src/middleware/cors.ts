import { ApiContext } from "../typings/App";

const DOMAIN_REGEX = /^http[s]?:\/\/(?:[\.\-\_a-zA-Z0-9]*\.)?mastermovies\.uk$/;

/** Apply the appropriate CORS headers */
export function corsMiddleware() {
  return async (ctx: ApiContext, next: () => void) => {
    const origin = ctx.get("Origin");
    ctx.cors = true;

    ctx.set({
      "Access-Control-Allow-Headers": "Authorization, CSRF-Token",
      "Access-Control-Expose-Headers": "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": origin || "*"
    });

    await next();

    if (!ctx.cors) {
      ctx.set(
        "Access-Control-Allow-Origin",
        DOMAIN_REGEX.test(origin) ? origin : "https://mastermovies.uk"
      );
    }
  };
}
