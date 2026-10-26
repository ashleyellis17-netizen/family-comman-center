import { requirePageContext } from '@/lib/household'
import { AllowanceBoard } from '@/components/family/allowance-board'

export const metadata = { title: 'Allowance' }

export default async function AllowancePage() {
  await requirePageContext()
  return <AllowanceBoard />
}
