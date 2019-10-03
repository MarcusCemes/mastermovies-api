import Router from "@koa/router";
import Koa, { Context } from "koa";

export interface IBasicJwtProperties {
  iat?: number;
  exp?: number;
  aud?: string;
  jti?: string;
}

/** A MasterMovies API session context */
export interface IApiSession extends IBasicJwtProperties {
  glacier?: {
    /** Contains expiry in UNIX seconds timestamp */
    auth?: { [index: number]: number };
  };
}

export interface IApiState {}

/** Extended context used by the MasterMovies API */
export interface IApiContext extends Context {
  /** Return a standard response based on a HTTP code */
  standard: (code: number, message?: string, additional?: { [index: string]: any }) => void;

  /** Used to interact with the API session */
  session: {
    /** Retrieve the cached API session */
    get: () => IApiSession;
    /** Update the cached session that will be signed and returned in the response */
    set: (newSession: IApiSession) => void;
  };

  /**
   * Set cache duration of the resource. Can be a `ms` compatible string, number of seconds or null
   * for no cache. (default: null)
   */
  cache: string | number | null;

  /**
   * Set the original restriction level of CORS. When set to try, only MasterMovies origins are permitted. If false,
   * any origin is permitted. (default: false)
   */
  strictCors: boolean;
}

export type TApiRouter = Router<{}, IApiContext>;
export type TApiApp = Koa<{}, IApiContext>;
