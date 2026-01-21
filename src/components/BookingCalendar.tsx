import React from 'react';
import type { EventInput } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BookingDetailModal } from './BookingDetailModal';

// Booking type used by the component
interface Booking {
  id: number;
  activity: string;
  date: string;
  time: string;
  approveSumberdaya: 'approved' | 'pending' | 'rejected';
  approveKemahasiswaan: 'approved' | 'pending' | 'rejected';
}

// This mock data should ideally come from an API
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    activity: 'Rapat Himpunan Mahasiswa Jurusan',
    date: '2026-01-10',
    time: '10:00 - 12:00',
    approveSumberdaya: 'pending',
    approveKemahasiswaan: 'pending',
  },
  {
    id: 2,
    activity: 'Seminar Technopreneurship',
    date: '2026-01-12',
    time: '13:00 - 15:00',
    approveSumberdaya: 'approved',
    approveKemahasiswaan: 'approved',
  },
  {
    id: 3,
    activity: 'Workshop Desain Grafis',
    date: '2026-01-15',
    time: '09:00 - 16:00',
    approveSumberdaya: 'rejected',
    approveKemahasiswaan: 'pending',
  },
  {
    id: 4,
    activity: 'Pelatihan Public Speaking',
    date: '2026-01-22',
    time: '18:30 - 20:30',
    approveSumberdaya: 'approved',
    approveKemahasiswaan: 'pending',
  },
];

export default function BookingCalendar() {
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Transform mock data into FullCalendar events
  const events: EventInput[] = MOCK_BOOKINGS.map((booking) => ({
    id: String(booking.id),
    title: booking.activity,
    start: `${booking.date}T${booking.time.split(' - ')[0]}:00`,
    end: `${booking.date}T${booking.time.split(' - ')[1]}:00`,
    allDay: false,
  }));

  const handleEventClick = (clickInfo: { event: { id: string } }) => {
    const bookingId = Number(clickInfo.event.id);
    const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId) ?? null;
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 fc-responsive'>
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
          height={560}
          aspectRatio={1.5}
        />
      </div>

      <BookingDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        booking={selectedBooking}
      />
    </>
  );
}
