import Router from "@koa/router";
import Knex from "knex";
import Koa, { Context } from "koa";
import {} from "ms";

interface BasicJwtProperties {
  iat?: number;
  exp?: number;
  aud?: string;
  jti?: string;
}

/** A MasterMovies API session context */
interface ApiSession extends BasicJwtProperties {
  glacier?: {
    authorisations?: { [index: number]: number };
  };
}

/** Extended state used by the MasterMovies API */
interface ApiState {
  session: Promise<ApiSession>;
}

/** Extended context used by the MasterMovies API */
interface ApiContext extends Context {
  /** Return a standard response based on a HTTP code */
  standard: (code: number, message?: string, additional?: { [index: string]: any }) => void;

  /** Read the user session from an included JWT */
  getSession: () => Promise<ApiSession>;

  /**
   * Update the user session. At the end of the request chain, the session will
   * be signed as a JWT and added to the response body
   */
  setSession: (newSession: ApiSession) => void;

  /**
   * Set cache duration of the resource. Can be a `ms` compatible string, number of seconds or null
   * for no cache.
   */
  cache: string | number | null;
}

export type ApiRouter = Router<ApiState, ApiContext>;
export type ApiApp = Koa<ApiState, ApiContext>;
