import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { StatCard } from '@/shared/components/common/StatCard';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { Approval } from '@/features/approvals';
import type { ActorRole } from '@/features/approvals';
import {
  getMockBookings,
  mapBookingsToApprovalItems,
  type ApprovalDocType,
  type ApprovalModeType,
} from '../_shared/approval-mock';

export const Route = createFileRoute('/sumber-daya/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [bookings] = useState(() => getMockBookings());
  const mappedBookings = useMemo(() => mapBookingsToApprovalItems(bookings), [bookings]);
  const actorRole: ActorRole = 'sumber-daya';

  const stats = [
    {
      title: 'Antrean Approval',
      value: String(mappedBookings.filter(b => b.status === 'waiting').length),
      icon: Clock,
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Total Pengaju',
      value: String(mappedBookings.length),
      icon: Users,
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Total Diapprove',
      value: String(mappedBookings.filter(b => b.status === 'approved').length),
      icon: CheckCircle,
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
  ];

  const handleApprove = (id: number) => {
    console.log(`${actorRole} approve booking:`, id);
  };

  const handleRevise = (id: number) => {
    console.log(`${actorRole} revise booking:`, id);
  };

  const handleOpenDoc = (payload: {
    doc: ApprovalDocType;
    mode: ApprovalModeType;
    booking: { id: number };
  }) => {
    if (payload.mode === 'preview') {
      navigate({ 
        to: '/preview-dokumen',
        search: { doc: payload.doc, id: payload.booking.id, return: '/sumber-daya' } as any
      });
    } else if (payload.mode === 'sign') {
      navigate({ 
        to: '/tanda-tangan',
        search: { doc: payload.doc, id: payload.booking.id, return: '/sumber-daya' } as any
      });
    }
  };

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard Sumber Daya</h1>
        <p className='text-gray-600 mt-1'>Ringkasan aktivitas peminjaman untuk Sumber Daya.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            textColor={stat.textColor}
            bgLight={stat.bgLight}
          />
        ))}
      </div>

      <div className='mt-6'>
        <h2 className='text-lg font-semibold mb-4'>Persetujuan Peminjaman</h2>
        <Approval
          bookings={mappedBookings}
          onApprove={handleApprove}
          onRevise={handleRevise}
          actorRole={actorRole}
          onOpenDoc={handleOpenDoc}
        />
      </div>
    </>
  );
}
