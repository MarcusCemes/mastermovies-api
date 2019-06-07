import express, { Request, Response, Router } from "express";
import { posix } from "path";

import { cors } from "../../common/middleware/cors";
import { AppConfig, GlacierConfig } from "../../config";
import { getFilm, getFilms } from "../../models/glacier";
import { dataFetcher } from "../common/helpers.js";
import { serviceUnavailable } from "../common/serviceUnavailable";
import { downloadFilm } from "./download";
import { downloadThumbnail } from "./thumbnail";

export function GlacierRouter(): Router {
  // Require config
  if (!GlacierConfig) {
    return serviceUnavailable();
  }

  return express
    .Router()
    .all("/", cors(), index)
    .all("/list", cors(), dataFetcher(getFilms, AppConfig.base))
    .all("/film/:film", cors(), dataFetcher(getFilm, AppConfig.base))
    .all("/film/:film/export/:export", cors(), downloadFilm)
    .all("/film/:film/thumbnail/:thumbnail", cors(), downloadThumbnail);
}

function index(
  req: Request,
  res: Response,
  _next: (err?: Error) => void
): void {
  const base = AppConfig.base;
  res.status(200).json({
    _message: AppConfig.title + " - Glacier Endpoint",
    list_url: base + posix.normalize(`${req.originalUrl}/list{?public}`),
    film_url: base + posix.normalize(`${req.originalUrl}/film/{film}`),
    export_url:
      base +
      posix.normalize(
        `${req.originalUrl}/film/{film}/export/{export}?download`
      ),
    thumbnail_url:
      base +
      posix.normalize(`${req.originalUrl}/film/{film}/thumbnail/{thumbnail}`)
  });
}
