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

export const Route = createFileRoute('/senat/approval/')({
  component: RouteComponent,
})

const role: ActorRole = 'senat'

function RouteComponent() {
  const [bookings] = useState(() => getMockBookings())
  const mappedBookings = useMemo(() => mapBookingsToApprovalItems(bookings), [bookings])
  const navigate = useNavigate()

  const handleApprove = (id: number) => {
    console.log('Senat approve booking:', id)
    alert(`Booking ${id} disetujui oleh Senat Fakultas`)
  }

  const handleRevise = (id: number) => {
    console.log('Senat revises booking:', id)
    alert(`Booking ${id} dikembalikan oleh Senat Fakultas`)
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
        <h1 className="text-2xl font-bold">Approval Peminjaman - Senat Fakultas</h1>
        <p className="text-muted-foreground">Berikan persetujuan akhir sebelum kemahasiswaan memproses.</p>
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
