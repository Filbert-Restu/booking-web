import { createFileRoute } from '@tanstack/react-router';
import { ApprovalPage } from '../../_shared/components/ApprovalPage';

export const Route = createFileRoute('/kemahasiswaan/approval/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ApprovalPage
      role='kemahasiswaan'
      title='Approval Peminjaman - Kemahasiswaan'
      description='Kelola persetujuan awal peminjaman oleh pihak Kemahasiswaan.'
      editorRoutePath='/kemahasiswaan/approval/editor'
    />
  );
}
