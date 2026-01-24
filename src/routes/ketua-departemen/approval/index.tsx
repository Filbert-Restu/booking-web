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

export const Route = createFileRoute('/ketua-departemen/approval/')({
  component: RouteComponent,
})

const role: ActorRole = 'ketua-departemen'

function RouteComponent() {
  const [bookings] = useState(() => getMockBookings())
  const mappedBookings = useMemo(() => mapBookingsToApprovalItems(bookings), [bookings])
  const navigate = useNavigate()

  const handleApprove = (id: number) => {
    console.log('Ketua Departemen approve booking:', id)
    alert(`Booking ${id} disetujui oleh Ketua Departemen`)
  }

  const handleRevise = (id: number) => {
    console.log('Ketua Departemen revises booking:', id)
    alert(`Booking ${id} direvisi oleh Ketua Departemen`)
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
        <h1 className="text-2xl font-bold">Approval Peminjaman - Ketua Departemen</h1>
        <p className="text-muted-foreground">Tinjau dan lanjutkan permohonan sesuai kebijakan departemen.</p>
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
