import { getDatabase } from "../database";
import { ApiContext } from "../typings/App";

/** Injects ctx with a JSON status response */
export function databaseMiddleware() {
  const db = getDatabase();

  return async (ctx: ApiContext, next: () => void) => {
    ctx.db = db;
    await next();
  };
}
