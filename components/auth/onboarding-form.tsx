'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Loader2, UserPlus } from 'lucide-react'
import { createHousehold, joinHousehold } from '@/app/actions/household'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/New_York'

  async function submit(fn: () => Promise<{ ok: boolean; error?: string }>) {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const res = await fn()
      if (!res.ok) {
        setError(res.error ?? 'Something went wrong.')
        setPending(false)
        return
      }
      router.push('/today')
      router.refresh()
    } catch {
      setError('Could not reach the server. Try again.')
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg cozyla-card p-8">
        <h1 className="text-2xl font-extrabold text-foreground mb-1">Set up your household</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">Everything you add — groceries, recipes, meal plans — is shared only with members of your household.</p>
        <Tabs defaultValue="create">
          <TabsList className="grid grid-cols-2 w-full h-12 mb-6">
            <TabsTrigger value="create" className="gap-2"><Home className="w-4 h-4" aria-hidden />Create new</TabsTrigger>
            <TabsTrigger value="join" className="gap-2"><UserPlus className="w-4 h-4" aria-hidden />Join with code</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                const f = new FormData(e.currentTarget)
                submit(() => createHousehold({ name: String(f.get('household')), displayName: String(f.get('displayName')), timezone: String(f.get('timezone')) }))
              }}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="household">Household name</Label>
                <Input id="household" name="household" required placeholder="The Theveny Family" className="h-12" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="displayName">What should the family call you?</Label>
                <Input id="displayName" name="displayName" required defaultValue={defaultName} placeholder="Mom" className="h-12" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="timezone">Time zone</Label>
                <Input id="timezone" name="timezone" required defaultValue={timezone} className="h-12" />
                <p className="text-xs text-muted-foreground">Used for &quot;today&quot;, meal plans, and reminders. You become the household&apos;s first parent.</p>
              </div>
              <Button type="submit" size="lg" disabled={pending} className="h-12 rounded-xl">
                {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}Create household
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="join">
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                const f = new FormData(e.currentTarget)
                submit(() => joinHousehold({ code: String(f.get('code')), displayName: String(f.get('joinName')) }))
              }}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Invite code</Label>
                <Input id="code" name="code" required autoCapitalize="characters" placeholder="ABCD-1234" className="h-12 font-mono tracking-widest" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="joinName">Your name in this household</Label>
                <Input id="joinName" name="joinName" required defaultValue={defaultName} className="h-12" />
              </div>
              <Button type="submit" size="lg" disabled={pending} className="h-12 rounded-xl">
                {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}Join household
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        {error && <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p>}
        <button
          type="button"
          className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={async () => {
            await authClient.signOut()
            router.push('/sign-in')
            router.refresh()
          }}
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
