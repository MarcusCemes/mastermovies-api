import express, { Router } from "express";

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


  // Generate the index
  const index = {
    _message: AppConfig.title + " - Glacier Endpoint",
    list_url: AppConfig.base + "glacier/list{?public}",
    film_url: AppConfig.base + "glacier/film/{film}",
  };


  return express
    .Router()
    .all("/", cors(), (_req, res) => { res.json(index); })
    .all("/list", cors(), dataFetcher(getFilms, AppConfig.base))
    .all("/film/:film", cors(), dataFetcher(getFilm, AppConfig.base))
    .all("/film/:film/export/:export", cors(), downloadFilm)
    .all("/film/:film/thumbnail/:thumbnail", cors(), downloadThumbnail);
}
