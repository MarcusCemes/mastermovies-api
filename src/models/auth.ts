import { Pool } from "pg";

import { isValidHex } from "../routes/common/util";

const CHECK_FILM_EXISTS = `SELECT EXISTS(
  SELECT 1
  FROM films.film
  WHERE films.film.fingerprint = decode($1, 'hex')
) as exists;`;

const CHECK_FILM_AUTHORIZATION = `
SELECT EXISTS (
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

export async function checkFilmAuthorization(
  pool: Pool,
  film: string,
  key: string
): Promise<boolean> {
  if (!isValidHex(film)) {
    return undefined;
  }

  const exists = (await pool.query(CHECK_FILM_EXISTS, [film])).rows[0].exists;
  if (!exists) return void 0;

  return (await pool.query(CHECK_FILM_AUTHORIZATION, [film, key])).rows[0]
    .authorized;
}
