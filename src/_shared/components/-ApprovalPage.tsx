import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Approval } from '@/features/approvals';
import type { ActorRole } from '@/features/approvals';
import {
  getMockBookings,
  mapBookingsToApprovalItems,
} from '../approval-mock';

interface ApprovalPageProps {
  role: ActorRole;
  title: string;
  description: string;
  editorRoutePath: string;
}

export function ApprovalPage({ role, title, description, editorRoutePath }: ApprovalPageProps) {
  const [bookings] = useState(() => getMockBookings());
  const mappedBookings = useMemo(() => mapBookingsToApprovalItems(bookings), [bookings]);
  const navigate = useNavigate();

  const handleApprove = (id: number) => {
    console.log(`${role} approve booking:`, id);
    alert(`Booking ${id} disetujui oleh ${title}`);
  };

  const handleRevise = (id: number) => {
    console.log(`${role} revise booking:`, id);
    alert(`Booking ${id} perlu revisi oleh ${title}`);
  };

  const handleOpenDoc = (documentId: number) => {
    navigate({
      to: editorRoutePath,
      search: {
        documentId,
      } as any,
    });
  };

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>{title}</h1>
        <p className='text-muted-foreground'>{description}</p>
      </div>

      <Approval
        bookings={mappedBookings}
        onApprove={handleApprove}
        onRevise={handleRevise}
        actorRole={role}
        onOpenDoc={handleOpenDoc}
      />
    </div>
  );
}
