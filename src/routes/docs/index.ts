import express, { Router } from "express";

import { cors } from "../../common/middleware/cors";
import api from "./openapi.json";

/** Provides API documentation */
export function OpenApiRouter(): Router {
  return express.Router().all("/", cors(), (_req, res) => {
    res.json(api);
  });
}
