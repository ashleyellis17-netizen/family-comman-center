import { requirePageContext } from '@/lib/household'
import { GroundingBoard } from '@/components/family/grounding-board'

export const metadata = { title: 'Earn Back Plan' }

export default async function EarnBackPage() {
  await requirePageContext()
  return <GroundingBoard mode="earn-back" />
}
