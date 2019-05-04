import express, { Request, Response, Router } from "express";

import { cors } from "../common/middleware/cors";
import { AppConfig } from "../config";
import { AuthRouter } from "./auth";
import { serviceUnavailable } from "./common/serviceUnavailable";
import { OpenApiRouter } from "./docs";
import { GlacierRouter } from "./glacier";

/**
 * Generates the application routes
 * @param {Pool} pool The database connection pool
 */
export function ApplicationRouter(): Router {

  // Require config
  if (!AppConfig) {
    return serviceUnavailable();
  }

  // Build the router
  return express
    .Router()
    .all("/", cors(), index)
    .use("/auth", AuthRouter())
    .use("/openapi.json", OpenApiRouter())
    .use("/glacier", GlacierRouter());
}

function index(req: Request, res: Response, _next: (err?: Error) => void): void {

  const base = AppConfig.base + req.originalUrl + "/";
  res.status(200).json({
    _message: AppConfig.title,
    auth_url: base + "auth",
    docs_url: "https://mastermovies.co.uk/docs",
    glacier_url: base + "glacier",
    openapi_url: base + "openapi.json"
  });

}