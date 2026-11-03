import 'server-only';
import { createHash, randomBytes, randomInt } from 'node:crypto';

export function newSecret(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

// Excludes look-alike characters (0/O, 1/I/L) so codes are easy to read off a
// wall screen and type on a phone.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function newHumanCode(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export const DISPLAY_COOKIE = 'fcc_display';
export const PAIRING_COOKIE = 'fcc_pairing';

// Browsers cap cookie lifetime at 400 days; the cookie is re-issued on use.
export const DISPLAY_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export function cookieSecurity() {
  return process.env.NODE_ENV === 'development'
    ? ({ sameSite: 'none', secure: true } as const)
    : ({ sameSite: 'lax', secure: true } as const);
}
