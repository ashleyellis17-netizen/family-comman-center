import { requirePageContext } from '@/lib/household'
import { RewardsBoard } from '@/components/chores/rewards-board'

export const metadata = { title: 'Rewards' }

export default async function RewardsPage() {
  await requirePageContext()
  return <RewardsBoard />
}
