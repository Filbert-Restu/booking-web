import { createFileRoute } from '@tanstack/react-router'
import { WordEditorPlaceholder } from '@/components/WordEditorPlaceholder'
import {
  APPROVAL_DOC_OPTIONS,
  APPROVAL_MODE_OPTIONS,
  type ApprovalDocType,
  type ApprovalModeType,
} from '../../_shared/approval-mock'

export const Route = createFileRoute('/kemahasiswaan/approval/editor')({
  validateSearch: (search: Record<string, unknown>) => ({
    bookingId: typeof search.bookingId === 'string' ? search.bookingId : undefined,
    doc: APPROVAL_DOC_OPTIONS.includes(search.doc as ApprovalDocType)
      ? (search.doc as ApprovalDocType)
      : undefined,
    mode: APPROVAL_MODE_OPTIONS.includes(search.mode as ApprovalModeType)
      ? (search.mode as ApprovalModeType)
      : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { mode, doc, bookingId } = Route.useSearch()

  if (!mode || !doc || !bookingId) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">Editor Dokumen</h1>
        <p className="text-muted-foreground">Parameter editor tidak lengkap.</p>
      </div>
    )
  }

  return (
    <WordEditorPlaceholder
      bookingId={bookingId}
      docType={doc}
      mode={mode}
      roleName="Kemahasiswaan"
    />
  )
}
