import 'server-only';

export type IntegrationStatus = {
  configured: boolean;
  missing: string[];
};

function check(keys: string[]): IntegrationStatus {
  const missing = keys.filter((k) => !process.env[k]?.trim());
  return { configured: missing.length === 0, missing };
}

/**
 * Configuration presence only. Neither integration has a working sync
 * implementation yet, so even a "configured" result is reported as
 * "credentials present, sync not built" by the pages — never as connected.
 */
export function googleIntegrationStatus() {
  return check(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']);
}

export function sheetsIntegrationStatus() {
  return check(['SHEETS_WEB_APP_URL', 'SHEETS_API_TOKEN', 'SHEETS_SHEET_ID']);
}
