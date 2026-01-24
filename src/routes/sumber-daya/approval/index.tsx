import { createFileRoute } from '@tanstack/react-router';
import { ApprovalPage } from '../../_shared/components/ApprovalPage';

export const Route = createFileRoute('/sumber-daya/approval/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ApprovalPage
      role='sumber-daya'
      title='Approval Peminjaman - Sumber Daya'
      description='Kelola persetujuan penggunaan sumber daya dan fasilitas.'
      editorRoutePath='/sumber-daya/approval/editor'
    />
  );
}
