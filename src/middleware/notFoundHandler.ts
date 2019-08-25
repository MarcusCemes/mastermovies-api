import { ApiContext } from "../typings/App";
import { HTTP_CODES } from "./respond";

export function notFoundHandler() {
  return async (ctx: ApiContext, next: () => Promise<void>) => {
    await next();

    if (Object.keys(ctx.body).length === 0) {
      ctx.standard(HTTP_CODES.NOT_FOUND);
    }
  };
}
