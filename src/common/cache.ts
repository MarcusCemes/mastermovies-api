// MasterMovies API - Cache
// A general purpose cache service, similar to React's "memo"
// Allows you to store/retrieve values based on a unique "scope" and "key"
// The interesting part is that the key can be a nested object...
import _hash from "node-object-hash";

const hash = _hash().hash;
const cache: { [index: string]: { [index: string]: any } } = {};

/**
 * Stores the given `value` in the cache under the given `scope` and a hash of the `key`.
 * @param {string} scope The store where to write, or a common store if *null*.
 * @param {any} key This should be as unique value that is relevant to your stored object.
 * This could, for example, be the configuration parameters that are used to generate a function.
 * The key (including complex nested objects) will be hashed into a string on storage and retrieval.
 * @param {any} value The item to store under "scope/key".
 * @returns {boolean} Store operation success, or failure if already exists
 */
export function cacheStore(
  scope: string = "common",
  key: any,
  value: any
): boolean {
  const keyHash = hash(key);

  if (typeof cache[scope] === "undefined") cache[scope] = {};

  if (typeof cache[scope][keyHash] === undefined) {
    cacheStore[scope][keyHash] = value;
    return true;
  }

  return false;
}

/**
 * Retrieve an item from cache using the given scope and key.
 * See the `store` function.
 */
export function cacheRetrieve(scope: string, key: any): any | undefined {
  if (typeof cache[scope] === "undefined") return undefined;

  const keyHash = hash(key);

  if (typeof cache[scope][keyHash] !== "undefined") {
    return cache[scope][keyHash];
  }

  return undefined;
}
