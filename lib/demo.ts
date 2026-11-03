export const DEMO_EMAIL = 'demo@family-command-center.local';

export function isDemoEnabled() {
  return process.env.NODE_ENV === 'development' || process.env.ENABLE_DEMO === 'true';
}
