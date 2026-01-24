import { createFileRoute } from '@tanstack/react-router';
import { ApprovalPage } from '../../_shared/components/ApprovalPage';

export const Route = createFileRoute('/senat/approval/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ApprovalPage
      role='senat'
      title='Approval Peminjaman - Senat Fakultas'
      description='Berikan persetujuan akhir sebelum kemahasiswaan memproses.'
      editorRoutePath='/senat/approval/editor'
    />
  );
}
