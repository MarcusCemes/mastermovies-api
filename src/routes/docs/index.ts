import express, { Router } from "express";

import { cors } from "../../common/middleware/cors";
import api from "./openapi.json";

/** Provides API documentation */
export function DocsRouter(): Router {

  return express
    .Router()
    .all("/", cors(), (_req, res) => { res.json(api); });
}
