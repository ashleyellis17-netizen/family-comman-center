'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { parseItemPhrase, splitItemList } from '@/lib/food'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export type ReviewItem = { name: string; quantity: string; unit: string }

/** Lets the user correct items parsed from speech or a pasted list before anything is saved. */
export function ItemReviewDialog({
  transcript,
  onClose,
  onConfirm,
  title = 'Review before adding',
  confirmLabel = 'Add items',
}: {
  transcript: string | null
  onClose: () => void
  onConfirm: (items: ReviewItem[]) => Promise<void> | void
  title?: string
  confirmLabel?: string
}) {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!transcript) return
    setItems(
      splitItemList(transcript).map((part) => {
        const p = parseItemPhrase(part)
        return { name: p.name, quantity: p.quantity?.toString() ?? '', unit: p.unit ?? '' }
      }),
    )
  }, [transcript])

  const update = (i: number, patch: Partial<ReviewItem>) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const valid = items.filter((i) => i.name.trim())

  return (
    <Dialog open={transcript !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Heard: <span className="italic">&ldquo;{transcript}&rdquo;</span>. Fix anything that looks wrong.
          </DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 items-center">
              <Input aria-label="Quantity" value={it.quantity} onChange={(e) => update(i, { quantity: e.target.value })} className="w-16 h-11" inputMode="decimal" />
              <Input aria-label="Unit" value={it.unit} onChange={(e) => update(i, { unit: e.target.value })} className="w-20 h-11" placeholder="unit" />
              <Input aria-label="Item" value={it.name} onChange={(e) => update(i, { name: e.target.value })} className="flex-1 h-11" />
              <Button variant="ghost" size="icon" aria-label={`Remove ${it.name}`} onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}>
                <Trash2 className="w-4 h-4" aria-hidden />
              </Button>
            </li>
          ))}
          {items.length === 0 && <li className="text-sm text-muted-foreground">No items recognized.</li>}
        </ul>
        <Button variant="outline" size="sm" onClick={() => setItems((p) => [...p, { name: '', quantity: '', unit: '' }])}>
          Add another line
        </Button>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid.length || saving}
            onClick={async () => {
              setSaving(true)
              await onConfirm(valid)
              setSaving(false)
            }}
          >
            {confirmLabel} ({valid.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
