import express, { Request, Response, Router } from "express";
import { Pool } from "pg";
import { statusResponse } from "./common/standardResponses";

export function createAuthRoute(_pool: Pool): Router {
  return express.Router()
    .get("/", index);
}

function index(_req: Request, res: Response): void {
  statusResponse(res, 503); // service unavailable
}
