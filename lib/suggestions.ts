import type { PantryRow, PreferenceRow } from '@/lib/db/schema'
import { daysBetween } from '@/lib/dates'
import { namesMatch } from '@/lib/food'

type RecipeLike = {
  id: number
  title: string
  archived: boolean
  favorite: boolean
  wantToTry: boolean
  kidFriendly: boolean
  prepMinutes: number | null
  cookMinutes: number | null
  ingredients: { name: string }[]
  avgRating: number | null
  ratingCount: number
  lastCooked: string | null
  timesCooked: number
}

export type SuggestionMode = 'different' | 'have' | 'quick'
export type Suggestion = { recipeId: number; title: string; reasons: string[]; conflicts: string[] }

export function totalMinutes(r: { prepMinutes: number | null; cookMinutes: number | null }) {
  if (r.prepMinutes == null && r.cookMinutes == null) return null
  return (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0)
}

/** Transparent, rule-based meal suggestions. Every reason shown is derived from stored data. */
export function suggestMeals(opts: {
  recipes: RecipeLike[]
  pantry: PantryRow[]
  preferences: PreferenceRow[]
  today: string
  plannedRecipeIds: number[]
  mode: SuggestionMode
  limit?: number
}): Suggestion[] {
  const avoid = opts.preferences.filter((p) => p.kind === 'dislike' || p.kind === 'restriction')
  const inStock = opts.pantry.filter((p) => p.status === 'in_stock')
  const planned = new Set(opts.plannedRecipeIds)

  const scored = opts.recipes
    .filter((r) => !r.archived && !planned.has(r.id))
    .map((r) => {
      const reasons: string[] = []
      const conflicts: string[] = []
      let score = 0

      for (const p of avoid) {
        const hit = r.ingredients.find((i) => namesMatch(i.name, p.value))
        if (hit) conflicts.push(`${p.person} ${p.kind === 'dislike' ? 'dislikes' : 'avoids'} ${p.value}`)
      }

      const since = r.lastCooked ? daysBetween(r.lastCooked, opts.today) : null
      if (since === null) {
        if (r.wantToTry) {
          score += 3
          reasons.push('On your Want to Try list')
        } else {
          score += 1.5
          reasons.push('Never cooked yet')
        }
      } else if (since >= 21) {
        score += 2
        reasons.push(`Not cooked in ${since} days`)
      } else if (since < 10) {
        score -= 4
      }

      if (r.avgRating !== null && r.ratingCount > 0) {
        score += (r.avgRating - 3) * 0.8
        if (r.avgRating >= 4) reasons.push(`Rated ${r.avgRating}★ by ${r.ratingCount}`)
      }
      if (r.favorite) {
        score += 1
        reasons.push('Family favorite')
      }

      const matched = r.ingredients.filter((i) => inStock.some((p) => namesMatch(p.name, i.name)))
      if (opts.mode === 'have') {
        if (!r.ingredients.length || !matched.length) score -= 10
        else {
          score += (matched.length / r.ingredients.length) * 6
          reasons.unshift(`Uses ${matched.length} of ${r.ingredients.length} ingredients marked in stock`)
        }
      }

      const minutes = totalMinutes(r)
      if (opts.mode === 'quick') {
        if (minutes === null || minutes > 35) score -= 10
        else {
          score += 3
          reasons.unshift(`Ready in about ${minutes} min`)
        }
      }

      if (opts.mode === 'different' && r.timesCooked > 3) score -= 1
      if (conflicts.length) score -= 5
      return { recipeId: r.id, title: r.title, reasons: reasons.slice(0, 3), conflicts, score }
    })
    .filter((s) => s.score > -5)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, opts.limit ?? 4).map(({ score: _score, ...rest }) => rest)
}
