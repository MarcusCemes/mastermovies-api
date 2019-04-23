import { Request, Response } from "express";
import { isAbsolute, join, normalize, relative, resolve } from "path";

/**
 * Higher order factory function for a Node.js JSON Request/Response handler.
 * But with actual Typescript generic typings!
 *
 * This abstracts away the HTTP logic, allowing simple stateless function
 * calling to resolve JSON data (REST API).
 *
 * Takes a variable function F as the first parameter, and all of the F's
 * parameters (let's call them P) as the remaining parameters. Returns a
 * function H that accepts a HTTP Request, Response and next callback.
 *
 * The returned function H will call F along with the provided parameters P,
 * resolve the returned promise if necessary, resolving the HTTP Response
 * with the data returned from F as a JSON payload.
 *
 * If an error occurs, the next callback will be called with the error,
 * allowing capture by error middleware.
 * @param {Function} fctn A sync/async function that returns an object
 * @param {...*} args The arguments to call _fctn_ with
 * @returns {Function} A function that acts as an Express.js middleware
 * @example
 * router.get("/", jsonFetcher(databaseFunction, databaseConnection));
 * // is similar to doing...
 * router.get("/", (req, res, next) => {
 *   try { res.json(await databaseFunction(databaseConnection)) } catch (err) { next(err); }
 * })
 */
export function jsonFetcher<F extends (...args: any[]) => any>(fctn: F, ...args: Parameters<F>):
(req: Request, res: Response, next: (err?: Error) => void) => void {
  return async (_req: Request, res: Response, next: (err?: Error) => void): Promise<void> => {
    try {
      const result = await fctn(...args);
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

type RemoveFirstFromTuple<T extends any[]> =
  T['length'] extends 0 ? undefined :
  (((...b: T) => void) extends (a, ...b: infer I) => void ? I : [])

/**
 * Similar to jsonFetcher, but also passes the request parameters as the first
 * parameter to the F function.
 * @see jsonFetcher
 */
export function jsonFetcherWithParameters<F extends (parameters: any, ...args: any[]) => any>(fctn: F, ...args: RemoveFirstFromTuple<Parameters<F>>):
(req: Request, res: Response, next: (err?: Error) => void) => void {
  return async (req: Request, res: Response, next: (err?: Error) => void): Promise<void> => {
    try {
      const result = await fctn(req.params, ...args);
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

export function getAuthHeader(req: Request) {
  const auth = (req.headers || {}).authorization;
  if (auth) {
    const parts = auth.split(" ");
    if (parts.length > 1 && parts[0].trim().toLowerCase() === "bearer") {
      parts.shift(); // Remove the bearer prefix
      return parts.join(" ");
    }
  }
  return null;
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
    for (let i=1; i<paths.length; i++) {
      if (isAbsolute(paths[i])) {
        return false;
      }
    }
    const p = resolve(join(...paths));
    return relative(paths[0], p).substring(0, 3) === "../" ? false : p;
  }
}

export function isValidHex(data: string): boolean {
  return data && /^[0-9a-f]*$/.test(data) && data.length % 2 === 0
}