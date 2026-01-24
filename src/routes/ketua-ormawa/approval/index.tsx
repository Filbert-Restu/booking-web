import { createFileRoute } from '@tanstack/react-router';
import { ApprovalPage } from '../../_shared/components/ApprovalPage';

export const Route = createFileRoute('/ketua-ormawa/approval/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ApprovalPage
      role='ketua-ormawa'
      title='Approval Peminjaman Ruangan'
      description='Kelola persetujuan peminjaman ruangan untuk organisasi Anda'
      editorRoutePath='/ketua-ormawa/approval/editor'
    />
  );
}
