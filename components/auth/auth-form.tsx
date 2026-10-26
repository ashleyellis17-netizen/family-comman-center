'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Heart, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    try {
      const res = isSignUp
        ? await authClient.signUp.email({ email, password, name: String(form.get('name') ?? '').trim() || email.split('@')[0] })
        : await authClient.signIn.email({ email, password })
      if (res.error) {
        setError(isSignUp ? 'Could not create that account. Try a different email or a longer password (8+ characters).' : 'Email or password is incorrect.')
        setPending(false)
        return
      }
      const next = params.get('next')
      // Full navigation so the server sees the new session cookie on the first request.
      window.location.assign(next && next.startsWith('/') && !next.startsWith('//') ? next : '/today')
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md cozyla-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{isSignUp ? 'Create your account' : 'Welcome home'}</h1>
            <p className="text-sm text-muted-foreground">Family Command Center</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" name="name" autoComplete="name" className="h-12 text-base" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="h-12 text-base" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete={isSignUp ? 'new-password' : 'current-password'} className="h-12 text-base" />
          </div>
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={pending} className="h-12 text-base rounded-xl">
            {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
            {isSignUp ? 'Create account' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground text-center">
          {isSignUp ? 'Already have an account? ' : 'New here? '}
          <Link href={isSignUp ? '/sign-in' : '/sign-up'} className="font-semibold text-primary underline-offset-4 hover:underline">
            {isSignUp ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </div>
    </main>
  )
}
