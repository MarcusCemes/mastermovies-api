import { Request, Response } from "express";
import { isAbsolute, join, normalize, relative, resolve } from "path";
import { Pool } from "pg";

type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? undefined
  : (((...b: T) => void) extends (a, ...b: infer I) => void ? I : []);

type RemoveFirstTwoFromTuple<T extends any[]> = RemoveFirstFromTuple<
  RemoveFirstFromTuple<T>
>;

/**
 * Factory function for a route handler. Fetch data from a function,
 * catching errors (respond 500), testing for non-truthy value
 * (respond 404) while providing the database pool, and route
 * parameters and pass-through any parameters given to
 * the factory function.
 *
 * Let's you remove HTTP logic from your data fetching function,
 * creating a clean database retrieval function that can throw.
 */
export function dataFetcher<
  F extends (pool: Pool, Request: Request, ...args: any[]) => any
>(
  fctn: F,
  ...args: RemoveFirstTwoFromTuple<Parameters<F>>
): (req: Request, res: Response, next: (err?: Error) => void) => void {
  return async (
    req: Request,
    res: Response,
    next: (err?: Error) => void
  ): Promise<void> => {
    try {
      const result = await fctn(req.app.db, req, ...args);
      if (result) {
        res.json(result);
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Safely join several paths, verifying that the final path is inside
 * the first path (first argument). Returns false if it's a dangerous
 * path (not contained within first path).
 */
export function securePath(...paths: string[]): string | false {
  if (paths.length === 0) {
    return false;
  } else if (paths.length === 1) {
    return normalize(paths[0]);
  } else {
    for (let i = 1; i < paths.length; i++) {
      if (isAbsolute(paths[i])) {
        return false;
      }
    }
    const p = resolve(join(...paths));
    return relative(paths[0], p).substring(0, 3) === "../" ? false : p;
  }
}
