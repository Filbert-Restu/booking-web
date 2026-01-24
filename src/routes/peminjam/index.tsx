import { createFileRoute } from '@tanstack/react-router';
import { BookingCalendar } from '@/features/bookings';

export const Route = createFileRoute('/peminjam/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <BookingCalendar />
    </div>
  );
}

export default RouteComponent;
