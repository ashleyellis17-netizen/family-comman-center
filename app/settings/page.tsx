import { requirePageContext } from '@/lib/household'
import { HouseholdSettings } from '@/components/settings/household-settings'

export const metadata = { title: 'Household Settings' }

export default async function SettingsPage() {
  const ctx = await requirePageContext({ parentOnly: true })
  return <HouseholdSettings displayMode={ctx.publicMode} />
}
