import { redirect } from 'next/navigation';

/** Sprint 1.6 calendar drag-reschedule lives on /dashboard, not this legacy route. */
export default function CalendarPage() {
  redirect('/dashboard');
}
