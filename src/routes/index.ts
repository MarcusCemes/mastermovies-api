import express, { Router } from "express";
import { Pool } from "pg";

import config from "../config/app.config.js";
import { createAuthRoute } from "./auth.js";
import { createFilmsRoute } from "./films.js";

/**
 * Generates the application routes
 * @param {Pool} pool The database connection pool
 */
export function createRoutes(pool: Pool): Router {

  // Generate the index
  const index = {
    auth_url:   config.base + "auth/",
    films_url:  config.base + "films/"
  };

  // Build the router
  return express.Router()
    .use("/auth", createAuthRoute(pool))
    .use("/films", createFilmsRoute(pool))
    .get("/", (_req, res) => { res.json(index) });
}
