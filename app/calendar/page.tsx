import { CalendarView } from '@/components/calendar-view';
import { getEventsForHousehold } from '@/app/actions/events';
import { requireActorPage } from '@/lib/household';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const actor = await requireActorPage();
  const events = await getEventsForHousehold(actor.householdId);
  return <CalendarView initialEvents={events} />;
}
