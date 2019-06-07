import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import { AppConfig } from "../config";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

// Try the algorithm and key
try {
  const key = AppConfig.encryption_key;
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const text = "Cipher is working!";

  cipher.update(text, "utf8");
  cipher.final();
} catch (err) {
  throw new Error(
    "Unable to initialize the encryption/decryption algorithm:\n" + err.message
  );
}

/** Encrypts a utf8 string into a base64 data+iv */
export function encrypt(data: string): { data: string; iv: string } {
  const key = AppConfig.encryption_key;
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let result = cipher.update(data, "utf8", "base64");
  result += cipher.final("base64");

  return { data: result, iv: iv.toString("base64") };
}

/** Decrypts base64 data+iv into a utf8 string */
export function decrypt(data: string, iv: string): string {
  const key = AppConfig.encryption_key;
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64"));

  let result = decipher.update(data, "base64", "utf8");
  result += decipher.final("utf8");

  return result;
}
