import express, { Router } from "express";

import config from "../config/app.config.js";
import auth from "./auth.js";
import films from "./films.js";

/**
 * Generates the application routes
 * @param {Pool} pool The database connection pool
 */
export default function create(): Router {

  // Generate the index
  const index = {
    auth_url:   config.base + "auth/",
    films_url:  config.base + "films/"
  };

  // Build the router
  return express.Router()
    .use("/auth", auth())
    .use("/films", films())
    .get("/", (_req, res) => { res.json(index) });
}
