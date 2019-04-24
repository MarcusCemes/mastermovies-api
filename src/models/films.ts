import { Pool } from 'pg';

import config from '../config/app.config';
import { isValidHex } from '../routes/common/helpers';

export interface IFilmSummary {
  fingerprint: string;
  name: string;
  release: Date;
  restricted: boolean;
}

export interface IExport {
  fingerprint: string;
  width: number;
  height: number;
  size: number;
  video_codec: string;
  audio_codec: string;
  stream_optimized: boolean;
}

export interface IFilmExports {
  exports: IExport[];
}

export interface IFilm extends IFilmSummary, IFilmExports {
  description: string;
  location: string;
  copyright: string;
}

/** Return a list of films */
const LIST_FILMS_QUERY =
`SELECT
encode(fingerprint, 'hex') AS fingerprint, name, release, restricted
FROM films.film
LEFT JOIN films.access
ON films.film.id = film_id
ORDER BY release DESC;`;

/** Return detailed film information */
const FILM_QUERY =
`SELECT
encode(fingerprint, 'hex') AS fingerprint, name, release, restricted, description, location, copyright, views
FROM films.film
LEFT JOIN films.access
ON films.film.id = films.access.film_id
LEFT JOIN films.metadata
ON films.film.id = films.metadata.film_id
LEFT JOIN films.views
ON films.film.id = films.views.film_id
WHERE films.film.fingerprint = decode($1, 'hex');`;

const FILM_EXPORT_QUERY =
`SELECT
encode(films.export.fingerprint, 'hex') AS fingerprint, width, height, size, video_codec, audio_codec, stream_optimized
FROM films.film
INNER JOIN films.export
ON films.film.id = films.export.film_id
WHERE films.film.fingerprint = decode($1, 'hex')
ORDER BY size ASC;`;

const FILM_DOWNLOAD_QUERY =
`SELECT
filename, name, release, size
FROM films.export
INNER JOIN films.film
ON films.film.id = films.export.film_id
LEFT JOIN films.metadata
ON films.export.film_id = films.metadata.film_id
WHERE films.film.fingerprint = decode($1, 'hex')
AND films.export.fingerprint = decode($2, 'hex');`;

const FILM_AUTHORIZATION_QUERY =
`SELECT EXISTS (
  /* Check for video restrictions */
  SELECT 1
  FROM films.film
  INNER JOIN films.access ON films.film.id = films.access.film_id
  WHERE films.film.fingerprint = decode($1, 'hex') AND films.access.restricted = false
  /* Check for group access */
  UNION SELECT 1
  FROM films.film
  INNER JOIN films.access ON films.film.id = films.access.film_id
  INNER JOIN films.group_access ON films.access.id = films.group_access.access_id
  INNER JOIN films.group ON films.group_access.group_id = films.group.id
  INNER JOIN films.key_group ON films.key_group.group_id = films.group.id
  INNER JOIN films.key ON films.key.id = films.key_group.key_id
  WHERE films.key.value = $2 AND films.film.fingerprint = decode($1, 'hex')
  /* Check for exact key access */
  UNION SELECT 1
  FROM films.film
  INNER JOIN films.access ON films.film.id = films.access.film_id
  INNER JOIN films.key_access ON films.access.id = films.key_access.access_id
  INNER JOIN films.key ON films.key.id = films.key_access.key_id
  WHERE films.key.value = $2 AND films.film.fingerprint = decode($1, 'hex')
  /* Check for master key */
  UNION SELECT 1
  FROM films.key
  INNER JOIN films.master_key ON films.key.id = films.master_key.key_id
  WHERE films.key.value = $2
) AS authorized;`;

const INCREMENT_VIEWS_QUERY =
`INSERT INTO films.views (film_id, views)
SELECT films.film.id, 1
FROM films.film
WHERE films.film.fingerprint = decode($1, 'hex')
ON CONFLICT (film_id) DO UPDATE
SET views = films.views.views + 1;`;


/** Get all list of published films with minimal information */
export async function getFilms(pool: Pool, _params: any): Promise<IFilmSummary[]> {
  const { rows } = await pool.query(LIST_FILMS_QUERY);
  for (const row of rows) {
    row.film_url = config.base + "films/" + row.fingerprint;
  }
  return rows;
}

/** Get a single film with more detailed information */
export async function getFilm(pool: Pool, params: any): Promise<IFilm> {
  if (!isValidHex(params.fingerprint)) {
    return void 0;
  }
  const filmResult = await pool.query(FILM_QUERY, [params.fingerprint]);
  if (filmResult.rows.length > 0) {
    const exportsResult = await pool.query(FILM_EXPORT_QUERY, [params.fingerprint]);
    const result = { ...filmResult.rows[0], exports: [] };
    for (const exp of exportsResult.rows) {
      result.exports.push({ ...exp, download_url: config.base + "films/" + params.fingerprint + "/download/" + exp.fingerprint});
    }
    return result;
  }
  return void 0;
}

export async function getFilmDownloadInfo(pool: Pool, params: any):
Promise<{ filename: string, name: string, release: Date, filesize: number }> {
  if (!isValidHex(params.fingerprint) || !isValidHex(params.export)) {
    return void 0;
  }
  const { rows } = await pool.query(FILM_DOWNLOAD_QUERY, [params.fingerprint, params.export]);
  return rows[0];
}


export async function getFilmAuthorization(pool: Pool, fingerprint: string, key: string): Promise<boolean> {
  if (!isValidHex(fingerprint)) {
    return false;
  }
  const { rows } = await pool.query(FILM_AUTHORIZATION_QUERY, [fingerprint, key]);
  return rows[0].authorized;
}

export async function incrementViews(pool: Pool, fingerprint: string): Promise<void> {
  if (isValidHex(fingerprint)) {
    await pool.query(INCREMENT_VIEWS_QUERY, [fingerprint]);
  }
  return;
}