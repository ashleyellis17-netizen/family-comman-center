import { Database } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { IntegrationStatusCard } from '@/components/integration-status-card';
import { sheetsIntegrationStatus } from '@/lib/integrations';
import { requireActorPage } from '@/lib/household';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Data Connection | Theveny Family Command Center' };

export default async function DataConnectionPage() {
  await requireActorPage();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Data Connection" description="Google Sheets workbook link" icon={Database} />
      <IntegrationStatusCard
        status={sheetsIntegrationStatus()}
        summary="The Google Sheets link has not been set up. Your household data lives in the app's own database, so you don't need this to use the app."
        whatItWillDo={[
          'Copy chores, allowance, and grocery data into your Google Sheets workbook.',
          'The workbook link and secret token are saved securely on the server, never typed into this page.',
          'This page shows the real time of the last successful sync and any errors.',
        ]}
      />
    </div>
  );
}
