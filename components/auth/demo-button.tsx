'use client';

import { useFormStatus } from 'react-dom';
import { Loader2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startDemo } from '@/app/actions/demo';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="lg" className="h-12 w-full text-base font-bold rounded-xl" disabled={pending}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <PlayCircle className="w-4 h-4" aria-hidden="true" />}
      Try the demo
    </Button>
  );
}

export function DemoButton() {
  return (
    <form action={startDemo} className="flex flex-col gap-2">
      <SubmitButton />
      <p className="text-center text-sm text-muted-foreground leading-relaxed">
        Opens a sample household with its own data. No account needed.
      </p>
    </form>
  );
}
