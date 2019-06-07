// MasterMovies API - Authorization Endpoint
import express, { Request, Response, Router } from "express";
import { posix } from "path";

import { cors } from "../../common/middleware/cors";
import { csrf } from "../../common/middleware/csrf";
import { AppConfig } from "../../config";
import { CommConfig } from "../../config/comm.config";
import { serviceUnavailable } from "../common/serviceUnavailable";
import { contact } from "./contact";

/** Provides communication such as contact forms */
export function CommRouter(): Router {
  // Require config
  if (!CommConfig) {
    return serviceUnavailable();
  }

  return express
    .Router()
    .all("/", cors(), index)
    .all("/contact", cors({ methods: ["POST"] }), csrf, contact);
}

function index(
  req: Request,
  res: Response,
  _next: (err?: Error) => void
): void {
  const base = AppConfig.base;
  res.status(200).json({
    _message: AppConfig.title + " - Communication Endpoint",
    contact_url: base + posix.normalize(`${req.originalUrl}/contact`)
  });
}
