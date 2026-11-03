// Family profiles are "who is using the shared screen" labels used for
// attribution only. Selecting a profile never grants permissions — those come
// solely from the signed-in account or paired display device.

export const FAMILY_PROFILES = [
  { id: 'mom', name: 'Mom', kind: 'parent', color: 'primary' },
  { id: 'dad', name: 'Dad', kind: 'parent', color: 'primary' },
  { id: 'alex', name: 'Alex', kind: 'child', color: 'alex' },
  { id: 'jaxon', name: 'Jaxon', kind: 'child', color: 'jaxon' },
  { id: 'carson', name: 'Carson', kind: 'child', color: 'carson' },
] as const;

export type ProfileId = (typeof FAMILY_PROFILES)[number]['id'];

export const PROFILE_COOKIE = 'fcc_profile';

export function findProfile(id: string | undefined | null) {
  return FAMILY_PROFILES.find((p) => p.id === id) ?? null;
}
