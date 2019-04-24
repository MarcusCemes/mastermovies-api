import express, { Request, Response, Router } from "express";

import { statusResponse } from "./common/response";

export default function create(): Router {
  return express.Router()
    .get("/", index);
}

function index(_req: Request, res: Response): void {
  statusResponse(res, 503, "Service is offline"); // service unavailable
}
