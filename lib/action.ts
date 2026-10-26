import 'server-only'
import { AuthError } from '@/lib/household'

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; code?: string }

/** An error whose message is safe and useful to show the person who caused it. */
export class UserError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
  }
}

export async function run<T>(label: string, fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: error.message, code: error.code }
    if (error instanceof UserError) return { ok: false, error: error.message, code: error.code }
    // Log the operation and error type only — never the household's data.
    console.error(`[action:${label}]`, error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error')
    return { ok: false, error: 'That could not be saved. Check your connection and try again.' }
  }
}

export function cleanText(value: unknown, max = 200): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.replace(/\s+/g, ' ').trim().slice(0, max)
  return trimmed.length ? trimmed : null
}

export function requireText(value: unknown, field: string, max = 200): string {
  const v = cleanText(value, max)
  if (!v) throw new UserError(`${field} is required.`)
  return v
}

export function cleanDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  return value
}

export function cleanNumber(value: unknown, { min = 0, max = 100000 } = {}): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < min || n > max) return null
  return Math.round(n * 1000) / 1000
}

export function cleanInt(value: unknown, { min = 0, max = 100000 } = {}): number | null {
  const n = cleanNumber(value, { min, max })
  return n === null ? null : Math.round(n)
}

export function cleanKey(value: unknown): string {
  if (typeof value !== 'string' || !/^[\w:.-]{6,120}$/.test(value)) throw new UserError('Invalid request key.')
  return value
}
