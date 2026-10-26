import 'server-only'
import type { Ingredient } from '@/lib/db/schema'
import { normalizeUnit, parseItemPhrase } from '@/lib/food'
import { safeFetchHtml } from '@/lib/safe-fetch'

export type RecipeDraft = {
  title: string
  sourceUrl: string | null
  sourceName: string | null
  externalId: string | null
  imageUrl: string | null
  servings: number | null
  prepMinutes: number | null
  cookMinutes: number | null
  ingredients: Ingredient[]
  instructions: string | null
  tags: string[]
  cuisine: string | null
  mainIngredient: string | null
}

// ---------------------------------------------------------------------------
// TheMealDB (https://www.themealdb.com) — free public recipe API, attribution required.
// ---------------------------------------------------------------------------
const MEALDB = 'https://www.themealdb.com/api/json/v1/1'

type MealDbMeal = Record<string, string | null>

async function mealdb(path: string): Promise<MealDbMeal[]> {
  const res = await fetch(`${MEALDB}/${path}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Recipe provider responded ${res.status}`)
  const json = (await res.json()) as { meals: MealDbMeal[] | null | string }
  return Array.isArray(json.meals) ? json.meals : []
}

function parseMeasure(measure: string, name: string): Ingredient {
  const m = measure.trim()
  if (!m) return { name, quantity: null, unit: null }
  const parsed = parseItemPhrase(`${m} ${name}`)
  const matched = parsed.name.toLowerCase().endsWith(name.toLowerCase())
  if (parsed.quantity !== null && matched) {
    const leftover = parsed.name.slice(0, parsed.name.length - name.length).trim()
    return { name, quantity: parsed.quantity, unit: normalizeUnit(parsed.unit), note: leftover || null }
  }
  // Keep the original measurement text when it can't be parsed safely (e.g. "to taste").
  return { name, quantity: null, unit: null, note: m }
}

function fromMealDb(meal: MealDbMeal): RecipeDraft {
  const ingredients: Ingredient[] = []
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim()
    if (name) ingredients.push(parseMeasure(meal[`strMeasure${i}`] ?? '', name))
  }
  return {
    title: meal.strMeal ?? 'Untitled recipe',
    sourceUrl: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
    sourceName: meal.strSource ? `${new URL(meal.strSource).hostname.replace(/^www\./, '')} via TheMealDB` : 'TheMealDB',
    externalId: `mealdb:${meal.idMeal}`,
    imageUrl: meal.strMealThumb ?? null,
    servings: null,
    prepMinutes: null,
    cookMinutes: null,
    ingredients,
    instructions: meal.strInstructions?.replace(/\r\n/g, '\n').trim() ?? null,
    tags: (meal.strTags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    cuisine: meal.strArea ?? null,
    mainIngredient: meal.strCategory ?? null,
  }
}

export async function searchMealDb(opts: { query?: string; cuisine?: string; mainIngredient?: string }): Promise<RecipeDraft[]> {
  if (opts.query) {
    const meals = await mealdb(`search.php?s=${encodeURIComponent(opts.query)}`)
    return meals.slice(0, 18).map(fromMealDb)
  }
  const filter = opts.cuisine ? `filter.php?a=${encodeURIComponent(opts.cuisine)}` : opts.mainIngredient ? `filter.php?i=${encodeURIComponent(opts.mainIngredient.replace(/\s+/g, '_'))}` : null
  if (!filter) return []
  const list = await mealdb(filter)
  const details = await Promise.all(list.slice(0, 12).map((m) => mealdb(`lookup.php?i=${m.idMeal}`).then((r) => r[0]).catch(() => null)))
  return details.filter((m): m is MealDbMeal => !!m).map(fromMealDb)
}

// ---------------------------------------------------------------------------
// URL import via schema.org/Recipe JSON-LD
// ---------------------------------------------------------------------------
function isoMinutes(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const m = value.match(/^P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?/i)
  if (!m) return null
  const total = Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0)
  return total > 0 ? total : null
}

function asArray<T>(v: T | T[] | undefined | null): T[] {
  return v == null ? [] : Array.isArray(v) ? v : [v]
}

function decode(text: string) {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim()
}

function findRecipe(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== 'object') return null
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = findRecipe(n)
      if (r) return r
    }
    return null
  }
  const obj = node as Record<string, unknown>
  const type = asArray(obj['@type'] as string | string[])
  if (type.some((t) => String(t).toLowerCase() === 'recipe')) return obj
  return findRecipe(obj['@graph']) ?? null
}

function instructionsText(value: unknown): string | null {
  const steps: string[] = []
  const walk = (v: unknown) => {
    if (typeof v === 'string') steps.push(decode(v))
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      if (o.itemListElement) walk(o.itemListElement)
      else if (typeof o.text === 'string') steps.push(decode(o.text))
    }
  }
  walk(value)
  const cleaned = steps.filter(Boolean)
  return cleaned.length ? cleaned.map((s, i) => `${i + 1}. ${s}`).join('\n') : null
}

export async function importRecipeUrl(raw: string): Promise<RecipeDraft> {
  const { url, html } = await safeFetchHtml(raw)
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  let recipe: Record<string, unknown> | null = null
  for (const s of scripts) {
    try {
      recipe = findRecipe(JSON.parse(s[1].trim()))
      if (recipe) break
    } catch {
      // ignore malformed blocks
    }
  }
  if (!recipe) throw new Error('No recipe data was found on that page.')

  const ingredients = asArray(recipe.recipeIngredient as string[]).map((line) => {
    const text = decode(String(line))
    const p = parseItemPhrase(text)
    return { name: p.name, quantity: p.quantity, unit: normalizeUnit(p.unit), note: p.quantity === null ? null : null }
  })
  const yieldVal = asArray(recipe.recipeYield as string | number | (string | number)[])[0]
  const servings = yieldVal != null ? Number(String(yieldVal).match(/\d+/)?.[0] ?? NaN) : NaN
  const image = asArray(recipe.image as unknown)[0]
  const imageUrl = typeof image === 'string' ? image : image && typeof image === 'object' ? String((image as Record<string, unknown>).url ?? '') || null : null
  const keywords = typeof recipe.keywords === 'string' ? recipe.keywords.split(',') : asArray(recipe.keywords as string[])
  const host = new URL(url).hostname.replace(/^www\./, '')

  return {
    title: decode(String(recipe.name ?? 'Imported recipe')).slice(0, 160),
    sourceUrl: url,
    sourceName: host,
    externalId: null,
    imageUrl: imageUrl && /^https?:\/\//.test(imageUrl) ? imageUrl : null,
    servings: Number.isFinite(servings) ? servings : null,
    prepMinutes: isoMinutes(recipe.prepTime),
    cookMinutes: isoMinutes(recipe.cookTime) ?? (isoMinutes(recipe.totalTime) && !isoMinutes(recipe.prepTime) ? isoMinutes(recipe.totalTime) : null),
    ingredients,
    instructions: instructionsText(recipe.recipeInstructions),
    tags: keywords.map((k) => decode(String(k))).filter(Boolean).slice(0, 8),
    cuisine: asArray(recipe.recipeCuisine as string[])[0] ? decode(String(asArray(recipe.recipeCuisine as string[])[0])) : null,
    mainIngredient: asArray(recipe.recipeCategory as string[])[0] ? decode(String(asArray(recipe.recipeCategory as string[])[0])) : null,
  }
}
