import { CalendarView } from '@/components/calendar-view';
import { getEvents } from '@/app/actions/events';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const events = await getEvents();
  return <CalendarView initialEvents={events} />;
}
