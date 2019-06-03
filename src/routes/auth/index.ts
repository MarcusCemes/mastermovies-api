// MasterMovies API - Authorization Endpoint
import express, { Request, Response, Router } from "express";
import { posix } from "path";

import { cors } from "../../common/middleware/cors";
import { csrf } from "../../common/middleware/csrf";
import { AppConfig, AuthConfig } from "../../config";
import { serviceUnavailable } from "../common/serviceUnavailable";
import { authorizeFilm } from "./authorize";
import { query } from "./query";
import { logout } from "./logout";

/** Provides authentication and authorization */
export function AuthRouter(): Router {

  // Require config
  if (!AuthConfig) {
    return serviceUnavailable();
  }

  return express
    .Router()
    .all("/", cors(), index)
    .all("/authorize", cors({ methods: ["POST"], restrictOrigin: true }), csrf, authorizeFilm)
    .all("/logout", cors({ methods: ["POST"], restrictOrigin: true }), csrf, logout)
    .all("/query", cors(), query);
}

function index(req: Request, res: Response, _next: (err?: Error) => void): void {

  const base = AppConfig.base;
  res.status(200).json({
    _message: AppConfig.title + " - Authorization Endpoint",
    authorize_url: base + posix.normalize(`${req.originalUrl}/authorize`),
    logout_url: base + posix.normalize(`${req.originalUrl}/logout`),
    query_url: base + posix.normalize(`${req.originalUrl}/query`)
  });

}

