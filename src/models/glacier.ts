import { Request } from "express";
import { Pool } from "pg";

import { isValidHex } from "../routes/common/util";

export interface IFilmSummary {
  fingerprint: string;
  name: string;
  release: Date;
}

export interface IExport {
  fingerprint: string;
  width: number;
  height: number;
  size: number;
  mime: string;
  video_codec: string;
  audio_codec: string;
  stream_optimized: boolean;
  download_url: string;
  stream_url: string;
}

export interface IFilmExports {
  exports: IExport[];
}

export interface IThumbnail {
  fingerprint: string;
  width: number;
  height: number;
  mime: string;
  image_url: string;
}

export interface IFilmThumbnails {
  thumbnails: IThumbnail[];
}

export interface IFilm extends IFilmSummary, IFilmExports, IFilmThumbnails {
  description: string;
  location: string;
  copyright: string;
  restricted: boolean;
}

export interface IFilmDownloadInfo {
  name: string;
  release: Date;
  size: number;
  mime: string,
  restricted: boolean;
}

/** Return a list of films */
const FILM_LIST_QUERY = (pub?: boolean) =>
  `SELECT
encode(fingerprint, 'hex') AS fingerprint, name, release, restricted
FROM films.film
LEFT JOIN films.access
ON films.film.id = film_id
${pub ? "WHERE films.access.restricted = false" : ""}
ORDER BY release DESC;`;

/** Return detailed film information */
const FILM_QUERY = `SELECT
encode(fingerprint, 'hex') AS fingerprint, name, release, restricted, description, location, copyright, views
FROM films.film
LEFT JOIN films.access
ON films.film.id = films.access.film_id
LEFT JOIN films.metadata
ON films.film.id = films.metadata.film_id
LEFT JOIN films.views
ON films.film.id = films.views.film_id
WHERE films.film.fingerprint = decode($1, 'hex')
LIMIT 1;`;

const FILM_LIST_EXPORTS_QUERY = `SELECT
encode(films.export.fingerprint, 'hex') AS fingerprint, width, height, size, mime, video_codec, audio_codec, stream_optimized
FROM films.film
INNER JOIN films.export
ON films.film.id = films.export.film_id
WHERE films.film.fingerprint = decode($1, 'hex')
ORDER BY size, mime ASC;`;

const DOWNLOAD_INFO_QUERY = `SELECT
name, release, size, mime, restricted
FROM films.film
INNER JOIN films.export
ON films.film.id = films.export.film_id
INNER JOIN films.access
ON films.film.id = films.access.film_id
LEFT JOIN films.metadata
ON films.export.film_id = films.metadata.film_id
WHERE films.film.fingerprint = decode($1, 'hex')
AND films.export.fingerprint = decode($2, 'hex')
LIMIT 1;`;

const FILM_INCREMENT_VIEWS_QUERY = `INSERT INTO films.views (film_id, views)
SELECT films.film.id, 1
FROM films.film
WHERE films.film.fingerprint = decode($1, 'hex')
ON CONFLICT (film_id) DO UPDATE
SET views = films.views.views + 1;`;

const FILM_LIST_THUMBNAILS_QUERY = `SELECT
encode(films.thumbnail.fingerprint, 'hex') AS fingerprint, width, height, mime
FROM films.film
INNER JOIN films.thumbnail
ON films.film.id = films.thumbnail.film_id
WHERE films.film.fingerprint = decode($1, 'hex')
ORDER BY width, mime ASC;`;

const FILM_THUMBNAIL_QUERY = `SELECT mime
FROM films.film
INNER JOIN films.thumbnail
ON films.film.id = films.thumbnail.film_id
WHERE films.film.fingerprint = decode($1, 'hex')
AND films.thumbnail.fingerprint = decode($2, 'hex');`;

/** Get all list of published films with minimal information */
export async function getFilms(
  pool: Pool,
  req: Request,
  base: string
): Promise<IFilmSummary[]> {
  const { rows } = await pool.query(
    FILM_LIST_QUERY(req.query.public !== undefined)
  );
  for (const row of rows) {
    row.film_url = base + "glacier/film/" + row.fingerprint;
  }
  return rows;
}

/** Get a single film with more detailed information */
export async function getFilm(
  pool: Pool,
  req: Request,
  base: string
): Promise<IFilm> {
  if (!isValidHex(req.params.film)) {
    return void 0;
  }
  const filmResult = await pool.query(FILM_QUERY, [req.params.film]);
  if (filmResult.rows.length > 0) {
    const exportsResult = await pool.query(FILM_LIST_EXPORTS_QUERY, [
      req.params.film
    ]);
    const thumbnailResult = await pool.query(FILM_LIST_THUMBNAILS_QUERY, [
      req.params.film
    ]);
    const result: IFilm = {
      ...filmResult.rows[0],
      exports: [],
      thumbnails: []
    };
    const path = req.originalUrl;
    for (const exp of exportsResult.rows) {
      result.exports.push({
        fingerprint: exp.fingerprint,
        width: exp.width,
        height: exp.height,
        size: exp.size,
        mime: exp.mime,
        video_codec: exp.video_codec,
        audio_codec: exp.audio_codec,
        stream_optimized: exp.stream_optimized,
        download_url: base + path + `/export/${exp.fingerprint}?download`,
        stream_url: base + path + `/export/${exp.fingerprint}`
      });
    }
    for (const thumb of thumbnailResult.rows) {
      result.thumbnails.push({
        fingerprint: thumb.fingerprint,
        width: thumb.width,
        height: thumb.height,
        mime: thumb.mime,
        image_url: base + path + `/thumbnail/${thumb.fingerprint}`
      });
    }
    return result;
  }
  return void 0;
}

export async function getFilmDownloadInfo(
  pool: Pool,
  film: string,
  exp: string
): Promise<IFilmDownloadInfo> {
  if (!isValidHex(film) || !isValidHex(exp)) {
    return void 0;
  }
  const { rows } = await pool.query(DOWNLOAD_INFO_QUERY, [film, exp]);
  return rows[0];
}

export async function incrementViews(
  pool: Pool,
  film: string
): Promise<void> {
  if (isValidHex(film)) {
    await pool.query(FILM_INCREMENT_VIEWS_QUERY, [film]);
  }
  return;
}

export async function getFilmThumbnail(
  pool: Pool,
  film: string,
  thumbnail: string
): Promise<{ mime: string }> {
  if (!isValidHex(thumbnail)) {
    return void 0;
  }
  const { rows } = await pool.query(FILM_THUMBNAIL_QUERY, [film, thumbnail]);
  return rows[0];
}
