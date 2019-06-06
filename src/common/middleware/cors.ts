// MasterMovies API - CORS middleware
// made my own, because node-cors is trash.
// designed to be called before each route, identical handlers are cached
// and reused
import { Handler, Request, Response } from "express";

import { statusResponse } from "../../routes/common/statusResponse";
import { cacheRetrieve, cacheStore } from "../cache";

const allowedOrigin = /^http[s]?:\/\/(?:[\.\-\_a-zA-Z0-9]*\.)?mastermovies\.uk$/;
const defaultOrigin = "https://mastermovies.uk";

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
  credentials: string;
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
  // Parse and allow OPTIONS and HEAD
  let methods = parseConfigKey(config.methods);
  if (methods.length === 0) methods.push("GET");
  if (methods.indexOf("OPTIONS") === -1) methods.push("OPTIONS");
  if (methods.indexOf("HEAD") === -1) methods.push("HEAD");
  methods = methods.sort();

  // Parse and add default headers
  let headers = parseConfigKey(config.headers);
  if (headers.indexOf("Content-Type") === -1) headers.push("Content-Type");
  if (headers.indexOf("CSRF-Token") === -1) headers.push("CSRF-Token");
  headers = headers.sort();

  let expose = parseConfigKey(config.expose).sort();
  if (expose.indexOf("X-RateLimit-Limit") === -1) expose.push("X-RateLimit-Limit");
  if (expose.indexOf("X-RateLimit-Remaining") === -1) expose.push("X-RateLimit-Remaining");
  if (expose.indexOf("X-RateLimit-Reset") === -1) expose.push("X-RateLimit-Reset");

  const restrictOrigin = typeof config.restrictOrigin !== "undefined" ? config.restrictOrigin : false;
  const credentials = typeof config.credentials !== "undefined" && !config.credentials ? "false" : "true"; // needed for CSRF

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

    // Add CORS headers
    res.header("Access-Control-Allow-Methods", config.methods.join(", "));
    res.header("Access-Control-Allow-Headers", config.headers.join(", "));
    res.header("Access-Control-Expose-Headers", config.expose.join(", "));
    res.header("Access-Control-Allow-Credentials", config.credentials.toString());

    // Block methods that aren't allowed
    if (config.methods.indexOf(req.method) === -1) {
      statusResponse(res, 405);  // Method Not Allowed
      return;
    }

    // Respond to OPTIONS/HEAD (pre-flight request)
    if (req.method === "OPTIONS" || req.method === "HEAD") {
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