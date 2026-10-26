import { redirect } from 'next/navigation'
import { getHouseholdContext } from '@/lib/household'
import { PairDisplay } from '@/components/display/pair-display'

export const metadata = { title: 'Pair this display' }

export default async function PairPage() {
  // A paired screen (or a signed-in person) already has access; pairing again would be confusing.
  if (await getHouseholdContext()) redirect('/today')
  return <PairDisplay />
}
