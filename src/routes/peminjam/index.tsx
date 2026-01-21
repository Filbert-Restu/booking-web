import { createFileRoute } from '@tanstack/react-router';
import BookingCalendar from '../../components/BookingCalendar';

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
