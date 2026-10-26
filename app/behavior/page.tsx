import { requirePageContext } from '@/lib/household'
import { BehaviorLog } from '@/components/family/behavior-log'

export const metadata = { title: 'Behavior' }

export default async function BehaviorPage() {
  await requirePageContext()
  return <BehaviorLog />
}
