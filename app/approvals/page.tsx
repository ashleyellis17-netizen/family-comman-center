import { requirePageContext } from '@/lib/household'
import { ApprovalQueue } from '@/components/family/approval-queue'

export const metadata = { title: 'Parent Approval Queue' }

export default async function ApprovalsPage() {
  await requirePageContext({ parentOnly: true })
  return <ApprovalQueue />
}
