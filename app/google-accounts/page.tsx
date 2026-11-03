import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { IntegrationStatusCard } from '@/components/integration-status-card';
import { googleIntegrationStatus } from '@/lib/integrations';
import { requireActorPage } from '@/lib/household';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Google Accounts | Theveny Family Command Center' };

export default async function GoogleAccountsPage() {
  await requireActorPage();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Google Accounts" description="Gmail and Google Calendar sync" icon={Mail} />
      <IntegrationStatusCard
        status={googleIntegrationStatus()}
        summary="Google sign-in for calendar sync has not been set up. The family calendar in this app is stored in your household database and works on its own."
        whatItWillDo={[
          'Each family member connects their own Google account with Google sign-in.',
          'Their Google Calendar events show up on the family calendar.',
          'Each person can disconnect at any time, and the app forgets their Google access.',
        ]}
      />
    </div>
  );
}
