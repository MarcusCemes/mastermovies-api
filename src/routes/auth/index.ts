import express, { Router } from "express";

import { AppConfig, AuthConfig } from "../../config";
import { serviceUnavailable } from "../common/serviceUnavailable";
import { authorizeFilm } from "./authorize";
import { methodNotAllowed } from "../common/methodNotAllowed";

/** Provides authentication and authorization */
export function AuthRouter(): Router {

  // Require config
  if (!AuthConfig) {
    return serviceUnavailable();
  }

  // Generate the index
  const index = {
    _message: AppConfig.title + " - Authorization Endpoint",
    authorize_url: AppConfig.base + "auth/authorize/{film}"
  };


  return express
  .Router()
  .get("/", (_req, res) => { res.json(index); })
  .get("/authorize", methodNotAllowed)
  .post("/authorize", authorizeFilm);
}
