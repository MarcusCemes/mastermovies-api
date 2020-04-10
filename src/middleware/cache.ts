import ms from "ms";

import { IApiContext } from "../types/App";

/** Extend the ctx object, and apply appropriate cache headers */
export function cacheMiddleware() {
  return async (ctx: IApiContext, next: () => Promise<void>) => {
    ctx.cache = null;

    await next();

    if (typeof ctx.cache === "string") {
      ctx.cache = Math.floor(ms(ctx.cache) / 1000);
    }

    if (!ctx.cache) {
      ctx.set({
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Expires: "0",
      });
    } else {
      ctx.set({
        "Cache-Control": "max-age=" + ctx.cache,
        Expires: new Date(Date.now() + ctx.cache * 1000).toUTCString(),
      });
    }
  };
}
