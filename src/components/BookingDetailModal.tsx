'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button/button';
import { cn } from '@/lib/utils';

interface Booking {
  id: number;
  activity: string;
  date: string;
  time: string;
  approveSumberdaya: 'approved' | 'pending' | 'rejected';
  approveKemahasiswaan: 'approved' | 'pending' | 'rejected';
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
}

export function BookingDetailModal({ open, onOpenChange, booking }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50' />

        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl z-50',
            'focus:outline-none',
          )}
        >
          <div className='flex items-start justify-between gap-4'>
            <div>
              <Dialog.Title className='text-lg font-semibold'>
                Detail Peminjaman
              </Dialog.Title>
              <Dialog.Description className='text-sm text-gray-500'>
                Informasi detail permintaan peminjaman ruang
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className='rounded p-1 text-gray-600 hover:text-gray-900'>
                <X className='w-5 h-5' />
              </button>
            </Dialog.Close>
          </div>

          <div className='mt-6 grid grid-cols-2 gap-4'>
            <div className='p-3 bg-gray-50 rounded'>
              <div className='text-sm text-gray-600'>Kegiatan</div>
              <div className='text-base font-semibold text-gray-900'>
                {booking?.activity ?? '-'}
              </div>
            </div>

            <div className='p-3 bg-gray-50 rounded'>
              <div className='text-sm text-gray-600'>Tanggal</div>
              <div className='text-base font-semibold text-gray-900'>
                {booking?.date ?? '-'}
              </div>
            </div>

            <div className='p-3 bg-gray-50 rounded'>
              <div className='text-sm text-gray-600'>Waktu</div>
              <div className='text-base font-semibold text-gray-900'>
                {booking?.time ?? '-'}
              </div>
            </div>

            <div className='p-3 bg-gray-50 rounded'>
              <div className='text-sm text-gray-600'>Approve Sumberdaya</div>
              <div className='text-base font-semibold text-gray-900'>
                {booking?.approveSumberdaya ?? '-'}
              </div>
            </div>

            <div className='p-3 bg-gray-50 rounded'>
              <div className='text-sm text-gray-600'>Approve Kemahasiswaan</div>
              <div className='text-base font-semibold text-gray-900'>
                {booking?.approveKemahasiswaan ?? '-'}
              </div>
            </div>
          </div>

          <div className='mt-6 flex justify-end gap-2'>
            <Button variant='ghost' onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
