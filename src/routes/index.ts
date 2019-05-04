import express, { Router } from "express";

import { cors } from "../common/middleware/cors";
import { AppConfig } from "../config";
import { AuthRouter } from "./auth";
import { OpenApiRouter } from "./docs";
import { GlacierRouter } from "./glacier";

/**
 * Generates the application routes
 * @param {Pool} pool The database connection pool
 */
export default function create(): Router {
  // Generate the index
  const index = {
    _message: AppConfig.title,
    auth_url: AppConfig.base + "auth",
    docs_url: "https://mastermovies.co.uk/docs",
    glacier_url: AppConfig.base + "glacier",
    openapi_url: AppConfig.base + "openapi.json"
  };

  // Build the router
  return express
    .Router()
    .all("/", cors(), (_req, res) => { res.json(index); })
    .use("/auth", AuthRouter())
    .use("/openapi.json", OpenApiRouter())
    .use("/glacier", GlacierRouter());
}
