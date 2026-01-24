import { createFileRoute } from '@tanstack/react-router';
import { ApprovalPage } from '../../_shared/components/ApprovalPage';

export const Route = createFileRoute('/wadek1/approval/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ApprovalPage
      role='wadek1'
      title='Approval Peminjaman - Wakil Dekan 1'
      description='Finalisasi dokumen dan tanda tangan untuk proses akhir.'
      editorRoutePath='/wadek1/approval/editor'
    />
  );
}
