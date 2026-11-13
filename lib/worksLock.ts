/*
 * Locking the list of previews at /works with a token, for a site that is only static files.
 *
 * At build time the list is encrypted with a key made from WORKS_TOKEN (PBKDF2, then AES-256-GCM), and only that
 * ciphertext goes into the page. The browser makes the same key from the token typed in and decrypts the list
 * itself: without the right token the page holds nothing readable, not even the client names.
 *
 * Runs on the server (at build) only: it uses node:crypto. The page imports just the `Locked` type from here.
 */
import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";

export interface Locked {
  /** PBKDF2 rounds: they make each guess at the token slow */
  iter: number;
  salt: string;
  iv: string;
  /** the ciphertext with its 16-byte authentication tag at the end, as the browser's AES-GCM expects; base64 */
  data: string;
}

const ITERATIONS = 310_000;

export function lock(value: unknown, token: string): Locked {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(token, salt, ITERATIONS, 32, "sha256");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final(), cipher.getAuthTag()]);
  return { iter: ITERATIONS, salt: salt.toString("base64"), iv: iv.toString("base64"), data: data.toString("base64") };
}
