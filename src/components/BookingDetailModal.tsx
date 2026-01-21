'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/shadcn/badge';

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

const statusMap = {
  approved: { text: 'Disetujui', variant: 'success' },
  pending: { text: 'Menunggu', variant: 'warning' },
  rejected: { text: 'Ditolak', variant: 'destructive' },
} as const;

export function BookingDetailModal({ open, onOpenChange, booking }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50 z-40' />

        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 md:p-8 shadow-xl z-50',
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
              <button className='rounded p-1 text-gray-600 hover:text-gray-900 -mt-1 -mr-1'>
                <X className='w-5 h-5' />
              </button>
            </Dialog.Close>
          </div>

          <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6'>
            <DetailRow label='Kegiatan' className='sm:col-span-2'>
              {booking?.activity ?? '-'}
            </DetailRow>
            <DetailRow label='Tanggal'>{booking?.date ?? '-'}</DetailRow>
            <DetailRow label='Waktu'>{booking?.time ?? '-'}</DetailRow>
            <DetailRow label='Persetujuan Sumber Daya'>
              <ApprovalStatus
                status={booking?.approveSumberdaya ?? 'pending'}
              />
            </DetailRow>
            <DetailRow label='Persetujuan Kemahasiswaan'>
              <ApprovalStatus
                status={booking?.approveKemahasiswaan ?? 'pending'}
              />
            </DetailRow>
          </div>

          <div className='mt-8 flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='w-full md:w-auto'
            >
              Tutup
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 p-3 bg-gray-50/80 rounded border',
        className,
      )}
    >
      <div className='text-xs text-gray-500'>{label}</div>
      <div className='text-sm font-semibold text-gray-900 wrap-break-words'>
        {children}
      </div>
    </div>
  );
}

function ApprovalStatus({
  status,
}: {
  status: 'approved' | 'pending' | 'rejected';
}) {
  const { text, variant } = statusMap[status];
  return (
    <Badge
      variant={
        variant as
          | 'default'
          | 'destructive'
          | 'outline'
          | 'secondary'
          | 'success'
          | 'warning'
      }
    >
      {text}
    </Badge>
  );
}
