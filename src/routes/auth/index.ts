// MasterMovies API - Authorization Endpoint
import express, { Router } from "express";

import { cors } from "../../common/middleware/cors";
import { csrf } from "../../common/middleware/csrf";
import { AppConfig, AuthConfig } from "../../config";
import { serviceUnavailable } from "../common/serviceUnavailable";
import { authorizeFilm } from "./authorize";
import { query } from "./query";

/** Provides authentication and authorization */
export function AuthRouter(): Router {

  // Require config
  if (!AuthConfig) {
    return serviceUnavailable();
  }

  // Generate the index
  const index = {
    _message: AppConfig.title + " - Authorization Endpoint",
    authorize_url: AppConfig.base + "auth/authorize",
    query_url: AppConfig.base + "auth/query"
  };


  return express
  .Router()
  .all("/", cors(), (_req, res) => { res.json(index); })
  .all("/authorize", cors({ methods: ["POST"], restrictOrigin: true }), csrf,  authorizeFilm)
  .all("/query", cors(), query);
}
