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

export const Route = createFileRoute('/wadek1/approval/')({
  component: RouteComponent,
})

const role: ActorRole = 'wadek1'

function RouteComponent() {
  const [bookings] = useState(() => getMockBookings())
  const mappedBookings = useMemo(() => mapBookingsToApprovalItems(bookings), [bookings])
  const navigate = useNavigate()

  const handleApprove = (id: number) => {
    console.log('Wadek 1 approve booking:', id)
    alert(`Booking ${id} disahkan oleh Wadek 1`)
  }

  const handleRevise = (id: number) => {
    console.log('Wadek 1 revises booking:', id)
    alert(`Booking ${id} dikembalikan oleh Wadek 1`)
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
        <h1 className="text-2xl font-bold">Approval Peminjaman - Wakil Dekan 1</h1>
        <p className="text-muted-foreground">Finalisasi dokumen dan tanda tangan untuk proses akhir.</p>
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
