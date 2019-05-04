import express, { Router } from "express";

import { cors } from "../common/middleware/cors";
import { AppConfig } from "../config";
import { AuthRouter } from "./auth";
import { DocsRouter } from "./docs";
import { GlacierRouter } from "./glacier";

/**
 * Generates the application routes
 * @param {Pool} pool The database connection pool
 */
export default function create(): Router {
  // Generate the index
  const index = {
    _message: AppConfig.title,
    _documentation: "https://mastermovies.co.uk/docs",
    auth_url: AppConfig.base + "auth",
    docs_url: AppConfig.base + "docs",
    glacier_url: AppConfig.base + "glacier"
  };

  // Build the router
  return express
    .Router()
    .all("/", cors(), (_req, res) => { res.json(index); })
    .use("/auth", AuthRouter())
    .use("/docs", DocsRouter())
    .use("/glacier", GlacierRouter());
}
