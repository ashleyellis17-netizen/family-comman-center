import { requirePageContext } from '@/lib/household'
import { GroundingBoard } from '@/components/family/grounding-board'

export const metadata = { title: 'Grounding & Eligibility' }

export default async function GroundingPage() {
  await requirePageContext()
  return <GroundingBoard mode="grounding" />
}
