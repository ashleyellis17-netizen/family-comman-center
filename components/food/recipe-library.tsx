'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Clock, Globe, Heart, Link2, PenLine, Search, Sparkles, Star } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useActionData } from '@/lib/client-actions'
import { getSuggestions, } from '@/app/actions/meals'
import { importRecipeFromUrl, listRecipes, searchOnlineRecipes, type RecipeSummary } from '@/app/actions/recipes'
import type { SuggestionMode } from '@/lib/suggestions'
import { RecipeForm, type RecipeFormValue } from './recipe-form'

type Filter = 'all' | 'favorites' | 'try' | 'quick' | 'kids' | 'archived'
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'try', label: 'Want to try' },
  { value: 'quick', label: '30 min or less' },
  { value: 'kids', label: 'Kid-friendly' },
  { value: 'archived', label: 'Archived' },
]

function minutes(r: { prepMinutes: number | null; cookMinutes: number | null }) {
  return r.prepMinutes == null && r.cookMinutes == null ? null : (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0)
}

export function RecipeLibrary({ canEdit }: { canEdit: boolean }) {
  const router = useRouter()
  const { data, error, mutate } = useActionData('recipes', listRecipes, { refreshInterval: 60000 })
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [draft, setDraft] = useState<Partial<RecipeFormValue> | null>(null)

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (data ?? []).filter((r) => {
      if (filter === 'archived' ? !r.archived : r.archived) return false
      if (filter === 'favorites' && !r.favorite) return false
      if (filter === 'try' && !r.wantToTry) return false
      if (filter === 'kids' && !r.kidFriendly) return false
      if (filter === 'quick') {
        const m = minutes(r)
        if (m == null || m > 30) return false
      }
      if (!term) return true
      return [r.title, r.cuisine, r.mainIngredient, ...r.tags, ...r.ingredients.map((i) => i.name)].some((v) => v?.toLowerCase().includes(term))
    })
  }, [data, q, filter])

  function saved(id: number, existed: boolean) {
    setDraft(null)
    mutate()
    toast.success(existed ? 'Already in your library — opening it.' : 'Recipe saved')
    router.push(`/recipes/${id}`)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader title="Recipes" description="Your family's recipe box, plus online search and link import." />

      <Tabs defaultValue="library">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="library">Our recipes</TabsTrigger>
          <TabsTrigger value="ideas"><Sparkles className="w-4 h-4" aria-hidden /> Ideas</TabsTrigger>
          {canEdit && <TabsTrigger value="online"><Globe className="w-4 h-4" aria-hidden /> Find online</TabsTrigger>}
          {canEdit && <TabsTrigger value="import"><Link2 className="w-4 h-4" aria-hidden /> Import link</TabsTrigger>}
          {canEdit && <TabsTrigger value="manual"><PenLine className="w-4 h-4" aria-hidden /> Write one</TabsTrigger>}
        </TabsList>

        <TabsContent value="library" className="flex flex-col gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
            <Label htmlFor="recipe-search" className="sr-only">Search saved recipes</Label>
            <Input id="recipe-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, ingredient, cuisine, tag" className="h-11 pl-9" />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter recipes">
            {FILTERS.map((f) => (
              <Button key={f.value} size="sm" variant={filter === f.value ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilter(f.value)} aria-pressed={filter === f.value}>
                {f.label}
              </Button>
            ))}
          </div>
          {error && <p role="alert" className="text-destructive text-sm">{error.message}</p>}
          {data && shown.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              {data.length === 0 ? 'No recipes yet. Find one online, import a link, or write one.' : 'No recipes match.'}
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </ul>
        </TabsContent>

        <TabsContent value="ideas" className="mt-4">
          <Ideas />
        </TabsContent>

        {canEdit && (
          <TabsContent value="online" className="mt-4">
            <OnlineSearch onPick={setDraft} />
          </TabsContent>
        )}
        {canEdit && (
          <TabsContent value="import" className="mt-4">
            <ImportLink onDraft={setDraft} onManual={() => setDraft({})} />
          </TabsContent>
        )}
        {canEdit && (
          <TabsContent value="manual" className="mt-4 rounded-2xl bg-card border border-border/50 p-4">
            <RecipeForm onSaved={saved} />
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review recipe</DialogTitle>
            <DialogDescription>Check the ingredients and amounts — imported data is not always perfect.</DialogDescription>
          </DialogHeader>
          {draft && <RecipeForm initial={draft} onSaved={saved} onCancel={() => setDraft(null)} submitLabel="Save to our recipes" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RecipeCard({ recipe: r }: { recipe: RecipeSummary }) {
  const m = minutes(r)
  return (
    <li>
      <Link href={`/recipes/${r.id}`} className="flex h-full flex-col overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary">
        {r.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote recipe images come from arbitrary hosts
          <img src={r.imageUrl} alt="" className="h-36 w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-2 bg-primary/30" aria-hidden />
        )}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="font-bold text-foreground text-pretty">{r.title}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {m != null && <span className="flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden />{m} min</span>}
            {r.avgRating != null && <span className="flex items-center gap-1"><Star className="w-3 h-3" aria-hidden />{r.avgRating} ({r.ratingCount})</span>}
            {r.favorite && <span className="flex items-center gap-1 text-primary"><Heart className="w-3 h-3" aria-hidden />Favorite</span>}
            {r.wantToTry && !r.timesCooked && <span>Want to try</span>}
            {r.lastCooked && <span>Last made {r.lastCooked}</span>}
          </p>
        </div>
      </Link>
    </li>
  )
}

function Ideas() {
  const [mode, setMode] = useState<SuggestionMode>('different')
  const { data, error, isLoading } = useActionData(`ideas-${mode}`, () => getSuggestions(mode), { refreshInterval: 0 })
  const modes: { value: SuggestionMode; label: string }[] = [
    { value: 'different', label: 'Something different' },
    { value: 'have', label: 'Use what we have' },
    { value: 'quick', label: 'Quick tonight' },
  ]
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Suggestion type">
        {modes.map((m) => (
          <Button key={m.value} size="sm" variant={mode === m.value ? 'default' : 'outline'} className="rounded-full" onClick={() => setMode(m.value)} aria-pressed={mode === m.value}>
            {m.label}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Ideas come only from your saved recipes, ratings, pantry, and preferences — each one says why.</p>
      {error && <p role="alert" className="text-destructive text-sm">{error.message}</p>}
      {isLoading && <p className="text-muted-foreground">Thinking…</p>}
      {data?.length === 0 && <p className="text-muted-foreground">Save a few recipes to get suggestions.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {data?.map((s) => (
          <li key={s.recipeId} className="rounded-2xl bg-card border border-border/50 p-4">
            <Link href={`/recipes/${s.recipeId}`} className="font-bold text-foreground hover:underline">{s.title}</Link>
            <ul className="mt-1 text-sm text-muted-foreground">
              {s.reasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
            {s.conflicts.length > 0 && <p className="mt-2 text-sm font-semibold text-destructive">Heads up: {s.conflicts.join('; ')}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function OnlineSearch({ onPick }: { onPick: (d: Partial<RecipeFormValue>) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchOnlineRecipes>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [field, setField] = useState<'query' | 'cuisine' | 'mainIngredient'>('query')

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      setResults(await searchOnlineRecipes({ [field]: query }))
    } catch {
      setResults({ ok: false, error: 'Connection lost. Check your connection and try again.' })
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={search} className="flex flex-wrap gap-2">
        <Label htmlFor="online-field" className="sr-only">Search by</Label>
        <select id="online-field" value={field} onChange={(e) => setField(e.target.value as typeof field)} className="h-11 rounded-md border border-input bg-background px-3">
          <option value="query">Dish name</option>
          <option value="cuisine">Cuisine</option>
          <option value="mainIngredient">Main ingredient</option>
        </select>
        <Label htmlFor="online-q" className="sr-only">Search term</Label>
        <Input id="online-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={field === 'cuisine' ? 'Mexican' : field === 'mainIngredient' ? 'chicken' : 'lasagna'} className="h-11 flex-1 min-w-40" />
        <Button type="submit" className="h-11" disabled={loading || !query.trim()}>{loading ? 'Searching…' : 'Search'}</Button>
      </form>
      <p className="text-xs text-muted-foreground">
        Results from <a href="https://www.themealdb.com" target="_blank" rel="noreferrer" className="underline">TheMealDB</a>. Review before saving.
      </p>
      {results && !results.ok && <p role="alert" className="rounded-xl bg-destructive/10 text-destructive p-3 text-sm">{results.error}</p>}
      {results?.ok && results.data.length === 0 && <p className="text-muted-foreground">No recipes found. Try a simpler term.</p>}
      {results?.ok && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.data.map((r) => (
            <li key={r.externalId ?? r.title} className="flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote provider images */}
              {r.imageUrl && <img src={r.imageUrl} alt="" className="h-32 w-full object-cover" loading="lazy" />}
              <div className="flex flex-1 flex-col gap-2 p-3">
                <p className="font-bold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{[r.cuisine, r.mainIngredient, `${r.ingredients.length} ingredients`].filter(Boolean).join(' · ')}</p>
                <Button size="sm" className={cn('mt-auto')} onClick={() => onPick(r)}>Review & save</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ImportLink({ onDraft, onManual }: { onDraft: (d: Partial<RecipeFormValue>) => void; onManual: () => void }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function run(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      const res = await importRecipeFromUrl(url)
      if (res.ok) onDraft(res.data)
      else setErr(res.error)
    } catch {
      setErr('Connection lost. Check your connection and try again.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={run} className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4">
      <Label htmlFor="import-url">Recipe link</Label>
      <div className="flex gap-2">
        <Input id="import-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/best-chili" className="h-11" required />
        <Button type="submit" className="h-11" disabled={loading}>{loading ? 'Reading…' : 'Import'}</Button>
      </div>
      <p className="text-xs text-muted-foreground">Works with most recipe sites that publish standard recipe data. Only public http(s) pages are fetched.</p>
      {err && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {err}
          <Button type="button" size="sm" variant="outline" onClick={onManual}>Enter manually</Button>
        </div>
      )}
    </form>
  )
}
