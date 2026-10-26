'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { act, newKey } from '@/lib/client-actions'
import { addReviewedIngredients, reviewIngredients, type IngredientReviewLine } from '@/app/actions/meals'

const PANTRY_LABEL = { in_stock: 'Have it', low: 'Running low', out: 'Out' } as const

/** Lets the cook pick exactly which recipe ingredients go to the grocery list. Nothing is added automatically. */
export function IngredientReview({ entryIds, onClose }: { entryIds: number[] | null; onClose: () => void }) {
  const [lines, setLines] = useState<IngredientReviewLine[] | null>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [batchKey, setBatchKey] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!entryIds) return
    let live = true
    setLines(null)
    setBatchKey(newKey('ing'))
    reviewIngredients(entryIds).then((res) => {
      if (!live) return
      if (!res.ok) {
        toast.error(res.error)
        onClose()
        return
      }
      setLines(res.data)
      setPicked(new Set(res.data.filter((l) => l.suggested).map((l) => l.key)))
    })
    return () => {
      live = false
    }
  }, [entryIds, onClose])

  async function add() {
    if (!lines) return
    setSaving(true)
    const res = await act(addReviewedIngredients({ batchKey, lines: lines.filter((l) => picked.has(l.key)).map(({ key, name, quantity, unit, forMeals }) => ({ key, name, quantity, unit, forMeals })) }))
    setSaving(false)
    if (!res) return
    toast.success(res.added.length ? `Added ${res.added.length} item${res.added.length === 1 ? '' : 's'} to the grocery list` : 'Those were already added')
    if (res.similar.length) toast.info(`Similar items were already on the list: ${res.similar.map((s) => s.existing).join(', ')}`)
    onClose()
  }

  const toggle = (k: string) => setPicked((p) => {
    const n = new Set(p)
    if (n.has(k)) n.delete(k)
    else n.add(k)
    return n
  })

  return (
    <Dialog open={entryIds !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ingredients to buy</DialogTitle>
          <DialogDescription>Checked items will be added. Things you have or that are already on the list start unchecked.</DialogDescription>
        </DialogHeader>
        {!lines && <p className="text-muted-foreground">Checking pantry and grocery list…</p>}
        {lines?.length === 0 && <p className="text-muted-foreground">These meals have no recipe ingredients to add.</p>}
        <ul className="flex flex-col gap-1">
          {lines?.map((l) => (
            <li key={l.key}>
              <label className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted">
                <input type="checkbox" className="mt-1 w-5 h-5" checked={picked.has(l.key)} onChange={() => toggle(l.key)} />
                <span className="flex-1">
                  <span className="font-semibold text-foreground">{l.display && <span className="text-primary">{l.display} </span>}{l.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {[
                      l.pantry ? `Pantry: ${PANTRY_LABEL[l.pantry.status]}` : 'Not in pantry',
                      l.onList ? `Already on list (${l.onList})` : null,
                      `for ${l.forMeals.join(', ')}`,
                    ].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={add} disabled={saving || !lines || picked.size === 0}>{saving ? 'Adding…' : `Add ${picked.size} to grocery list`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
