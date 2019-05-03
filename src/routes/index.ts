import express, { Router } from "express";

import { cors } from "../common/middleware/cors";
import { AppConfig } from "../config";
import { AuthRouter } from "./auth";
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
    glacier_url: AppConfig.base + "glacier"
  };

  // Build the router
  return express
    .Router()
    .all("/", cors(), (_req, res) => { res.json(index); })
    .use("/auth", AuthRouter())
    .use("/glacier", GlacierRouter());
}
