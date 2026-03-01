import { useEffect, useState } from 'react';
import type { EventInput } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BookingDetailModal } from './BookingDetailModal';
import { DateSelectionModal } from './DateSelectionModal';
import { bookingService, type RoomBooking } from '@/services/booking.service';

export default function BookingCalendar() {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDateSelectionModalOpen, setIsDateSelectionModalOpen] =
    useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await bookingService.getBookings();

        setBookings(data ?? []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError('Gagal memuat data booking. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Transform API data into FullCalendar events
  const events: EventInput[] = bookings.map((booking) => {
    // Parse time - bisa format "HH:mm:ss" atau "HH:mm"
    const startTime = booking.start_time.includes(':')
      ? booking.start_time.substring(0, 5)
      : booking.start_time;
    const endTime = booking.end_time.includes(':')
      ? booking.end_time.substring(0, 5)
      : booking.end_time;

    // Extract only date part from booking_date (format: "YYYY-MM-DDTHH:mm:ss.SSSZ" or "YYYY-MM-DD")
    const bookingDate = booking.booking_date.split('T')[0];

    return {
      id: String(booking.id),
      title: booking.purpose || booking.room?.name || 'Booking',
      start: `${bookingDate}T${startTime}:00`,
      end: `${bookingDate}T${endTime}:00`,
      allDay: false,
      backgroundColor: getEventColor(booking.status),
      borderColor: getEventColor(booking.status),
    };
  });


  // Get color based on booking status
  function getEventColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return '#10b981'; // green
      case 'PENDING':
        return '#f59e0b'; // orange
      case 'REJECTED':
        return '#ef4444'; // red
      case 'CANCELLED':
        return '#6b7280'; // gray
      case 'COMPLETED':
        return '#3b82f6'; // blue
      default:
        return '#9ca3af'; // default gray
    }
  }

  const handleEventClick = (clickInfo: { event: { id: string } }) => {
    const bookingId = Number(clickInfo.event.id);
    const booking = bookings.find((b) => b.id === bookingId) ?? null;
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDateClick = (dateInfo: { dateStr: string }) => {
    setSelectedDate(dateInfo.dateStr);
    setIsDateSelectionModalOpen(true);
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 fc-responsive'>
        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm'>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className='flex items-center justify-center h-140'>
            <div className='text-gray-500'>Memuat data booking...</div>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView='dayGridMonth'
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            buttonText={{
              today: 'Hari Ini',
              month: 'Bulan',
              week: 'Minggu',
              day: 'Hari',
            }}
            locale='id'
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height={560}
            aspectRatio={1.5}
          />
        )}
      </div>

      <BookingDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        booking={selectedBooking}
      />

      <DateSelectionModal
        open={isDateSelectionModalOpen}
        onOpenChange={setIsDateSelectionModalOpen}
        selectedDate={selectedDate}
      />
    </>
  );
}
