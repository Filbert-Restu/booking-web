import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Stepper } from '@/shared/components/common/Stepper';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { AlertCircle, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/shared/lib/utils';

// --- IMPORTS BARU ---
import React, { useMemo, useState } from 'react';
import { roomService, type Room } from '@/services/room.service';
import { documentService } from '@/services/document.service';
import { useBookingForm } from '@/hooks/useBookingForm';
import type { ReservationContent } from '@/types/booking';

export const Route = createFileRoute('/peminjam/pinjam/detail-tempat')({
  validateSearch: (search: Record<string, unknown>) => ({
    editId: Number(search.editId) || undefined,
    roomId: search.roomId ? Number(search.roomId) : undefined,
    bookingDate: search.bookingDate as string | undefined,
    startTime: search.startTime as string | undefined,
    endTime: search.endTime as string | undefined,
    purpose: search.purpose as string | undefined,
    ketuaNama: search.ketuaNama as string | undefined,
    ketuaNim: search.ketuaNim as string | undefined,
    ketuaHp: search.ketuaHp as string | undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const searchParams = Route.useSearch();
  const { editId } = searchParams;

  // 1. FETCH ROOMS
  const {
    data: rooms = [],
    isLoading: loadingRooms,
    isError: isRoomsError,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomService.getRooms({ status: 'ACTIVE' }),
  });

  // 2. FETCH DOCUMENT (Jika Edit Mode)
  const {
    data: existingDoc,
    isLoading: loadingDoc,
    isError: isDocError,
  } = useQuery({
    queryKey: ['document', editId],
    queryFn: () => documentService.getDocument(editId!),
    enabled: !!editId,
  });

  // --- LOADING STATES ---
  if (loadingRooms || loadingDoc) {
    return (
      <div className='p-6 flex justify-center items-center min-h-screen'>
        <div className='text-center text-gray-600'>Memuat data...</div>
      </div>
    );
  }

  if (isRoomsError || isDocError) {
    return (
      <div className='p-6 flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='text-red-600 mb-4'>Gagal memuat data.</div>
          <Button onClick={() => refetchRooms()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  // --- RENDER FORM ---
  return (
    <BookingForm
      key={editId || 'new'}
      rooms={rooms}
      initialData={
        existingDoc
          ? (existingDoc.content as unknown as ReservationContent)
          : undefined
      }
      searchParams={searchParams}
      editId={editId}
    />
  );
}

/**
 * KOMPONEN FORM (VIEW)
 * Tugas: Menampilkan UI. Semua logika state & API ada di useBookingForm.
 */
interface BookingFormProps {
  rooms: Room[];
  initialData?: ReservationContent;
  searchParams: Record<string, unknown>;
  editId?: number;
}

function BookingForm(props: BookingFormProps) {
  const navigate = useNavigate();

  // --- PANGGIL CUSTOM HOOK ---
  const {
    form,
    handleChange,
    handleKetuaChange,
    availabilityMsg,
    submitMutation,
  } = useBookingForm(props);

  const [dateValidationMsg, setDateValidationMsg] = useState<string | null>(
    null,
  );
  const [timeValidationMsg, setTimeValidationMsg] = useState<string | null>(
    null,
  );

  const isSaturday = useMemo(() => {
    if (!form.bookingDate) return false;
    const d = new Date(form.bookingDate + 'T00:00:00');
    return d.getDay() === 6; // Saturday === 6
  }, [form.bookingDate]);

  const isTimeWindowValid = useMemo(() => {
    if (!form.startTime || !form.endTime) return false;
    const tRe = /^\d{2}:\d{2}$/;
    if (!tRe.test(form.startTime) || !tRe.test(form.endTime)) return false;
    const [sh, sm] = form.startTime.split(':').map(Number);
    const [eh, em] = form.endTime.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    const open = 9 * 60;
    const close = 17 * 60;
    return start >= open && end <= close && end > start;
  }, [form.startTime, form.endTime]);

  // Update validation messages
  React.useEffect(() => {
    if (!form.bookingDate) {
      setDateValidationMsg(null);
    } else if (!isSaturday) {
      setDateValidationMsg('Peminjaman hanya diperbolehkan pada hari Sabtu');
    } else {
      setDateValidationMsg(null);
    }
  }, [form.bookingDate, isSaturday]);

  React.useEffect(() => {
    if (!form.startTime && !form.endTime) {
      setTimeValidationMsg(null);
    } else if (!isTimeWindowValid) {
      setTimeValidationMsg(
        'Waktu harus antara 09:00 dan 17:00 dan waktu selesai harus setelah mulai',
      );
    } else {
      setTimeValidationMsg(null);
    }
  }, [form.startTime, form.endTime, isTimeWindowValid]);

  const selectedRoom = props.rooms.find((r) => r.id === form.roomId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi UI sederhana
    if (!form.roomId || !form.bookingDate || !form.activity)
      return alert('Lengkapi data wajib');
    if (!/^\d{14}$/.test(form.ketua.nim)) return alert('NIM harus 14 digit');
    if (!/^\d{12,13}$/.test(form.ketua.hp))
      return alert('HP harus 12-13 digit');

    // Trigger Logic di Hook
    submitMutation.mutate();
  };

  return (
    <div className='space-y-6'>
      <Stepper
        steps={[
          { number: 1, title: 'Detail Tempat' },
          { number: 2, title: 'Proposal' },
          { number: 3, title: 'Tanda Tangan' },
        ]}
        currentStep={1}
      />

      <div className='max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold mb-6'>
          Detail Tempat - {selectedRoom?.name || 'Pilih Ruangan'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* ROOM SELECT */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Pilih Ruangan</label>
            <Select
              value={form.roomId?.toString()}
              onValueChange={(val) => handleChange('roomId', Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder='Pilih...' />
              </SelectTrigger>
              <SelectContent>
                {props.rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.name} ({r.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* KETUA INPUTS */}
          <div className='space-y-3 border-t pt-3'>
            <h3 className='font-medium text-sm'>Data Ketua Pelaksana</h3>
            <Input
              placeholder='Nama Ketua'
              value={form.ketua.nama}
              onChange={(e) => handleKetuaChange('nama', e.target.value)}
              required
            />
            <Input
              placeholder='NIM (14 digit)'
              value={form.ketua.nim}
              onChange={(e) =>
                handleKetuaChange(
                  'nim',
                  e.target.value.replace(/\D/g, '').slice(0, 14),
                )
              }
              required
            />
            <Input
              placeholder='HP (12-13 digit)'
              value={form.ketua.hp}
              onChange={(e) =>
                handleKetuaChange(
                  'hp',
                  e.target.value.replace(/\D/g, '').slice(0, 13),
                )
              }
              required
            />
          </div>

          {/* WAKTU INPUTS */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3'>
            <div>
              <label className='text-sm'>Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !form.bookingDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {form.bookingDate ? (
                      format(new Date(form.bookingDate), 'EEEE, dd MMMM yyyy', {
                        locale: id,
                      })
                    ) : (
                      <span>Pilih hari Sabtu...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={
                      form.bookingDate ? new Date(form.bookingDate) : undefined
                    }
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        // Format date ke string 'YYYY-MM-DD' untuk disimpan di state
                        // Perlu penyesuaian timezone agar tidak bergeser hari
                        const offset = date.getTimezoneOffset();
                        const adjustedDate = new Date(
                          date.getTime() - offset * 60 * 1000,
                        );
                        const dateString = adjustedDate
                          .toISOString()
                          .split('T')[0];

                        handleChange('bookingDate', dateString);
                        setDateValidationMsg(null); // Reset error jika ada
                      } else {
                        handleChange('bookingDate', '');
                      }
                    }}
                    // LOGIKA KUNCI DISINI:
                    disabled={(date: Date) => {
                      // 1. Disable jika BUKAN hari Sabtu (0=Minggu, 6=Sabtu)
                      const isNotSaturday = date.getDay() !== 6;

                      // 2. Disable jika tanggal sudah lewat (kemarin)
                      const isPast =
                        date < new Date(new Date().setHours(0, 0, 0, 0));

                      return isNotSaturday || isPast;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dateValidationMsg && (
                <div className='text-sm text-red-600 mt-1'>
                  {dateValidationMsg}
                </div>
              )}
            </div>
            <div className='flex gap-2'>
              <div className='flex-1'>
                <label className='text-sm'>Mulai</label>
                <Input
                  type='time'
                  value={form.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  min='09:00'
                  max='17:00'
                  required
                />
              </div>
              <div className='flex-1'>
                <label className='text-sm'>Selesai</label>
                <Input
                  type='time'
                  value={form.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  min='09:00'
                  max='17:00'
                  required
                />
                {timeValidationMsg && (
                  <div className='text-sm text-red-600 mt-1'>
                    {timeValidationMsg}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AVAILABILITY INDICATOR */}
          {availabilityMsg && (
            <div
              className={`p-2 text-sm rounded flex items-center gap-2 ${availabilityMsg.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
            >
              <AlertCircle className='w-4 h-4' /> {availabilityMsg.msg}
            </div>
          )}

          {/* ACTIVITY INPUT */}
          <div>
            <label className='text-sm'>Aktivitas</label>
            <Textarea
              rows={3}
              value={form.activity}
              onChange={(e) => handleChange('activity', e.target.value)}
              required
            />
          </div>

          {/* BUTTONS */}
          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate({ to: '/peminjam/pinjam' })}
            >
              Batal
            </Button>
            <Button
              type='submit'
              disabled={
                submitMutation.isPending ||
                (availabilityMsg?.isError && !props.editId) ||
                !isSaturday ||
                !isTimeWindowValid
              }
            >
              {submitMutation.isPending ? 'Menyimpan...' : 'Selanjutnya'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
