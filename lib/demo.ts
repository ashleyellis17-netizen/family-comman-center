export const DEMO_EMAIL = 'demo@family-command-center.local';
export const DEMO_HOUSEHOLD_NAME = 'Demo Household';

export function isDemoEnabled() {
  return process.env.NODE_ENV === 'development' || process.env.ENABLE_DEMO === 'true';
}
