// MasterMovies API - CORS middleware
// made my own, because node-cors is trash.
// designed to be called before each route, identical handlers are cached
// and reused
import { Handler, Request, Response } from "express";

import { statusResponse } from "../../routes/common/statusResponse";
import { cacheRetrieve, cacheStore } from "../cache";

const allowedOrigin = /^http[s]?:\/\/(?:[\.\-\_a-zA-Z0-9]*\.)?mastermovies\.co\.uk$/;
const defaultOrigin = "https://mastermovies.co.uk";

const CACHE_SCOPE = "cors";

export interface ICorsConfig {
  methods?: string | string[];
  headers?: string | string[];
  expose?:  string | string[];
  credentials?: boolean;
  restrictOrigin?: boolean;
}

export interface IParsedConfig {
  methods: string[];
  headers: string[];
  expose:  string[];
  credentials: boolean;
  restrictOrigin: boolean;
}

/**
 * Generate and return CORS middleware for given HTTP methods.
 * @param {string|Config} config A string with the allowed methods, or a config object
 * for full customization. If *null* or *undefined*, `methods` defaults to \["GET"\]
 */
export function cors(config: string | ICorsConfig = {}): Handler {


  const parsedConfig = parseConfig(typeof config === "string" ? { methods: config } : config);
  const hit = cacheRetrieve(CACHE_SCOPE, parsedConfig);

  if (typeof hit === "undefined") {
    const newHandler = createCorsHandler(parsedConfig);
    cacheStore(CACHE_SCOPE, parsedConfig, newHandler);
    return newHandler;
  } else {
    return hit;
  }

}

function parseConfig(config: ICorsConfig): IParsedConfig {
  let methods = parseConfigKey(config.methods);
  if (methods.length === 0) methods.push("GET");
  if (methods.indexOf("OPTIONS") === -1) methods.push("OPTIONS");
  if (methods.indexOf("HEAD") === -1) methods.push("HEAD");
  methods = methods.sort();

  let headers = parseConfigKey(config.headers);
  if (headers.indexOf("Content-Type") === -1) headers.push("Content-Type");
  headers = headers.sort();

  const expose = parseConfigKey(config.expose).sort();
  const restrictOrigin = config.restrictOrigin === true;
  const credentials = config.credentials === true;

  return {
    methods,
    headers,
    expose,
    restrictOrigin,
    credentials
  };
}

function parseConfigKey(item: string | string[]): string[] {
  if (typeof item === "string") return item.split(",");
  if (Array.isArray(item)) return item;
  return [];
}

function createCorsHandler(config: IParsedConfig): Handler {
  return (req: Request, res: Response, next: (err?: Error) => void) => {

    // Reflect the origin header based on endpoint origin restrictions
    const origin = req.get("Origin");
    const isSecureOrigin = typeof origin === "string" && allowedOrigin.test(origin);
    const secureOrigin = isSecureOrigin ? origin : defaultOrigin;
    res.header("Access-Control-Allow-Origin", config.restrictOrigin ? secureOrigin : origin || defaultOrigin);

    // Block methods that aren't allowed
    if (config.methods.indexOf(req.method) === -1) {
      res.header("Access-Control-Allow-Methods", config.methods.join(","));
      res.header("Access-Control-Allow-Headers", config.headers.join(","));
      res.header("Access-Control-Expose-Headers", config.expose.join(","));
      res.header("Access-Control-Allow-Credentials", config.credentials.toString());
      statusResponse(res, 405);  // Method Not Allowed
      return;
    }

    // Respond to OPTIONS/HEAD (pre-flight request)
    if (req.method === "OPTIONS" || req.method === "HEAD") {
      res.header("Access-Control-Allow-Methods", config.methods.join(","));
      res.header("Access-Control-Allow-Headers", config.headers.join(","));
      res.header("Access-Control-Expose-Headers", config.expose.join(","));
      res.header("Access-Control-Allow-Credentials", config.credentials.toString());
      statusResponse(res, 204);  // No Content
      return;
    }

    // Deny restricted requests
    if (config.restrictOrigin === true && isSecureOrigin !== true) {
      statusResponse(res, 403, "Origin blocked by endpoint CORS policy");  // Forbidden
      return;
    }

    next();

  };
}