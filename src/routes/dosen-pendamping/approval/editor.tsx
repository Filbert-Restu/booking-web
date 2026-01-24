import { createFileRoute } from '@tanstack/react-router';
import { EditorPage } from '../../_shared/components/EditorPage';
import {
  APPROVAL_DOC_OPTIONS,
  APPROVAL_MODE_OPTIONS,
  type ApprovalDocType,
  type ApprovalModeType,
} from '../../_shared/approval-mock';

export const Route = createFileRoute('/dosen-pendamping/approval/editor')({
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
});

function RouteComponent() {
  const { doc, mode, bookingId } = Route.useSearch();
  return <EditorPage roleName='Dosen Pendamping' doc={doc} mode={mode} bookingId={bookingId} />;
}
