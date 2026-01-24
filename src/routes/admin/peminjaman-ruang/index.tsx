import { createFileRoute } from '@tanstack/react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BookingDetailModal } from '@/features/bookings/BookingDetailModal';

export const Route = createFileRoute('/admin/peminjaman-ruang/')({
  component: RouteComponent,
});

interface Booking {
  id: number;
  activity: string;
  date: string;
  time: string;
  approveSumberdaya: 'approved' | 'pending' | 'rejected';
  approveKemahasiswaan: 'approved' | 'pending' | 'rejected';
}

const sampleBookings: Booking[] = [
  {
    id: 1,
    activity: 'Seminar Pengembangan Karir',
    date: '2026-02-10',
    time: '09:00 - 12:00',
    approveSumberdaya: 'approved',
    approveKemahasiswaan: 'approved',
  },
  {
    id: 2,
    activity: 'Rapat Koordinasi HIMA',
    date: '2026-02-12',
    time: '13:00 - 15:00',
    approveSumberdaya: 'pending',
    approveKemahasiswaan: 'pending',
  },
  {
    id: 3,
    activity: 'Workshop Teknologi',
    date: '2026-02-14',
    time: '10:00 - 16:00',
    approveSumberdaya: 'rejected',
    approveKemahasiswaan: 'pending',
  },
];

function badgeClass(
  status: Booking['approveSumberdaya'] | Booking['approveKemahasiswaan'],
) {
  return status === 'approved'
    ? 'bg-green-100 text-green-800'
    : status === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';
}

function RouteComponent() {
  const [bookings] = useState<Booking[]>(sampleBookings);

  const [openBooking, setOpenBooking] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const events = useMemo(() => {
    return bookings.map((b) => {
      // parse time like "09:00 - 12:00"
      const [startTime, endTime] = b.time.split(' - ').map((s) => s.trim());
      const start = `${b.date}T${startTime || '09:00'}:00`;
      const end = `${b.date}T${endTime || startTime || '10:00'}:00`;
      return {
        id: String(b.id),
        title: b.activity,
        start,
        end,
        className:
          b.approveSumberdaya === 'rejected' ||
          b.approveKemahasiswaan === 'rejected'
            ? 'fc-event-rejected'
            : b.approveSumberdaya === 'pending' ||
                b.approveKemahasiswaan === 'pending'
              ? 'fc-event-pending'
              : 'fc-event-approved',
        extendedProps: {
          approveSumberdaya: b.approveSumberdaya,
          approveKemahasiswaan: b.approveKemahasiswaan,
          raw: b,
        },
      };
    });
  }, [bookings]);

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Peminjaman Ruang</h1>
        <p className='text-gray-600 mt-1'>Daftar permintaan peminjaman ruang</p>
      </div>

      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='mb-6'>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView='timeGridWeek'
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            nowIndicator={true}
            height={500}
            selectable={true}
            eventContent={(arg) => {
              const props = arg.event.extendedProps;
              const approveS = props.approveSumberdaya as string | undefined;
              const approveK = props.approveKemahasiswaan as string | undefined;
              return (
                <div className='fc-event-custom'>
                  <div className='text-sm font-medium'>{arg.event.title}</div>
                  <div className='flex gap-1 mt-1'>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${approveS === 'approved' ? 'bg-green-100 text-green-800' : approveS === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                    >
                      S:{approveS}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${approveK === 'approved' ? 'bg-green-100 text-green-800' : approveK === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                    >
                      K:{approveK}
                    </span>
                  </div>
                </div>
              );
            }}
            eventClick={(info) => {
              const raw = info.event.extendedProps.raw as Booking | undefined;
              if (raw) {
                setDetailBooking(raw);
                setOpenBooking(true);
              } else {
                alert(info.event.title);
              }
            }}
          />
          <BookingDetailModal
            open={openBooking}
            onOpenChange={setOpenBooking}
            booking={detailBooking}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-center'>No</TableHead>
              <TableHead className='text-center'>
                Kegiatan / Aktivitas
              </TableHead>
              <TableHead className='text-center'>Tanggal</TableHead>
              <TableHead className='text-center'>Waktu</TableHead>
              <TableHead className='text-center'>Approve Sumberdaya</TableHead>
              <TableHead className='text-center'>
                Approve Kemahasiswaan
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b, i) => (
              <TableRow key={b.id}>
                <TableCell className='text-center font-medium'>
                  {i + 1}
                </TableCell>
                <TableCell className='text-center'>{b.activity}</TableCell>
                <TableCell className='text-center'>{b.date}</TableCell>
                <TableCell className='text-center'>{b.time}</TableCell>
                <TableCell className='text-center'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass(b.approveSumberdaya)}`}
                  >
                    {b.approveSumberdaya}
                  </span>
                </TableCell>
                <TableCell className='text-center'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass(b.approveKemahasiswaan)}`}
                  >
                    {b.approveKemahasiswaan}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {bookings.length === 0 && (
          <div className='text-center py-12 text-gray-500'>
            Tidak ada peminjaman
          </div>
        )}
      </div>
    </div>
  );
}
