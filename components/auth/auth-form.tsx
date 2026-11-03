'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border/50 shadow-lg p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <Heart className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground text-balance">{title}</h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const name = String(form.get('name') ?? '').trim();

    const result =
      mode === 'sign-up'
        ? await authClient.signUp.email({ email, password, name: name || email.split('@')[0] })
        : await authClient.signIn.email({ email, password, rememberMe: true });

    if (result.error) {
      console.error('[auth] failed', result.error.status, result.error.code);
      setError(
        mode === 'sign-up'
          ? 'We could not create that account. Check the details or try signing in.'
          : 'That email and password did not match. Please try again.'
      );
      setPending(false);
      return;
    }
    router.push(mode === 'sign-up' ? '/onboarding' : '/');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate={false}>
      {mode === 'sign-up' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" autoComplete="name" required className="h-12 text-base" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-12 text-base" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          required
          className="h-12 text-base"
        />
        {mode === 'sign-up' && <p className="text-sm text-muted-foreground">At least 8 characters.</p>}
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="h-12 text-base font-bold rounded-xl" disabled={pending}>
        {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {mode === 'sign-up' ? 'Create account' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === 'sign-up' ? (
          <>
            Already have an account?{' '}
            <Link href="/sign-in" className="font-bold text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to the household?{' '}
            <Link href="/sign-up" className="font-bold text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
      {mode === 'sign-in' && (
        <Link
          href="/display/pair"
          className="text-center text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
        >
          Setting up the family wall display? Pair it here
        </Link>
      )}
    </form>
  );
}
