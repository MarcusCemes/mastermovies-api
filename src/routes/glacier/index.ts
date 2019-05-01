import express, { Router } from "express";

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
    .get("/", (_req, res) => { res.json(index); })
    .get("/list", dataFetcher(getFilms, AppConfig.base))
    .get("/film/:film", dataFetcher(getFilm, AppConfig.base))
    .get("/film/:film/export/:export", downloadFilm)
    .get("/film/:film/thumbnail/:thumbnail", downloadThumbnail);
}
