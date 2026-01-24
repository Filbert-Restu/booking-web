import { createFileRoute } from '@tanstack/react-router';
import { ApprovalPage } from '../../_shared/components/ApprovalPage';

export const Route = createFileRoute('/ketua-departemen/approval/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ApprovalPage
      role='ketua-departemen'
      title='Approval Peminjaman - Ketua Departemen'
      description='Tinjau dan lanjutkan permohonan sesuai kebijakan departemen.'
      editorRoutePath='/ketua-departemen/approval/editor'
    />
  );
}
