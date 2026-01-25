import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ApprovalHistory } from '@/features/approvals';
import type { ActorRole } from '@/features/approvals';
import {
  getMockBookings,
  mapBookingsToApprovalItems,
} from '../_shared/approval-mock';

export const Route = createFileRoute('/ketua-departemen/riwayat-persetujuan')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [bookings] = useState(() => getMockBookings());
  const mappedBookings = useMemo(() => mapBookingsToApprovalItems(bookings), [bookings]);
  const actorRole: ActorRole = 'ketua-departemen';

  const handleOpenDoc = (payload: any) => {
    navigate({ 
      to: '/preview-dokumen',
      search: { doc: payload.doc, id: payload.booking.id, return: '/ketua-departemen/riwayat-persetujuan' } as any
    });
  };

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Riwayat Persetujuan</h1>
        <p className='text-muted-foreground'>
          Daftar peminjaman yang sudah disetujui oleh Ketua Departemen
        </p>
      </div>

      <ApprovalHistory
        bookings={mappedBookings}
        actorRole={actorRole}
        onOpenDoc={handleOpenDoc}
      />
    </div>
  );
}
