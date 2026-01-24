import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Approval } from '@/components/Approval'
import type { ActorRole } from '@/components/Approval'
import { useMemo, useState } from 'react'
import { Route as ApprovalEditorRoute } from './editor.tsx'
import {
  getMockBookings,
  mapBookingsToApprovalItems,
  type ApprovalDocType,
  type ApprovalModeType,
} from '../../_shared/approval-mock'

export const Route = createFileRoute('/ketua-ormawa/approval/')({
  component: RouteComponent,
})

const role: ActorRole = 'ketua-ormawa'

function RouteComponent() {
  const [bookings] = useState(() => getMockBookings())

  const navigate = useNavigate()

  const handleApprove = (id: number) => {
    console.log('Approve booking:', id)
    alert(`Booking ${id} telah diapprove`)
  }

  const handleRevise = (id: number) => {
    console.log('Revise booking:', id)
    alert(`Booking ${id} perlu direvisi`)
  }

  const mappedBookings = useMemo(() => mapBookingsToApprovalItems(bookings), [bookings])

  const handleOpenDoc = (payload: {
    doc: ApprovalDocType;
    mode: ApprovalModeType;
    booking: { id: number };
  }) => {
    navigate({
      to: ApprovalEditorRoute.to,
      search: {
        doc: payload.doc,
        mode: payload.mode,
        bookingId: String(payload.booking.id),
      },
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Approval Peminjaman Ruangan</h1>
        <p className="text-muted-foreground">Kelola persetujuan peminjaman ruangan untuk organisasi Anda</p>
      </div>
      
      <Approval
        bookings={mappedBookings}
        onApprove={handleApprove}
        onRevise={handleRevise}
        actorRole={role}
        onOpenDoc={({ doc, mode, booking }) =>
          handleOpenDoc({ doc, mode, booking })
        }
      />
    </div>
  )
}
