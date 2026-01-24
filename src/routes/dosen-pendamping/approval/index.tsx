import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Approval } from '@/components/Approval'
import type { ActorRole } from '@/components/Approval'
import { Route as ApprovalEditorRoute } from './editor.tsx'
import {
  getMockBookings,
  mapBookingsToApprovalItems,
  type ApprovalDocType,
  type ApprovalModeType,
} from '../../_shared/approval-mock'

export const Route = createFileRoute('/dosen-pendamping/approval/')({
  component: RouteComponent,
})

const role: ActorRole = 'dosen-pendamping'

function RouteComponent() {
  const [bookings] = useState(() => getMockBookings())
  const mappedBookings = useMemo(() => mapBookingsToApprovalItems(bookings), [bookings])
  const navigate = useNavigate()

  const handleApprove = (id: number) => {
    console.log('Dosen Pendamping approve booking:', id)
    alert(`Booking ${id} disetujui oleh Dosen Pendamping`)
  }

  const handleRevise = (id: number) => {
    console.log('Dosen Pendamping revises booking:', id)
    alert(`Booking ${id} direvisi oleh Dosen Pendamping`)
  }

  const handleOpenDoc = (payload: { doc: ApprovalDocType; mode: ApprovalModeType; booking: { id: number } }) => {
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
        <h1 className="text-2xl font-bold">Approval Peminjaman - Dosen Pendamping</h1>
        <p className="text-muted-foreground">Validasi proposal dan catat masukan sebelum diteruskan.</p>
      </div>

      <Approval
        bookings={mappedBookings}
        actorRole={role}
        onApprove={handleApprove}
        onRevise={handleRevise}
        onOpenDoc={({ doc, mode, booking }) => handleOpenDoc({ doc, mode, booking })}
      />
    </div>
  )
}
