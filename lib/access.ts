/**
 * Temporary: while true, visitors without a session are treated as the first
 * parent of the oldest household, so the app works without signing in.
 * Anyone with the URL gets full parent access. Set to false to require sign-in again.
 */
export const OPEN_ACCESS = true;
