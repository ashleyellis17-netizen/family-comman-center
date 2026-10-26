import { requirePageContext } from '@/lib/household'
import { ChoreBoard } from '@/components/chores/chore-board'

export const metadata = { title: 'Chores' }

export default async function ChoresPage() {
  await requirePageContext()
  return <ChoreBoard />
}
