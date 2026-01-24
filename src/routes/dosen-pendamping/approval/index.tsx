import { createFileRoute } from '@tanstack/react-router';
import { ApprovalPage } from '../../_shared/components/ApprovalPage';

export const Route = createFileRoute('/dosen-pendamping/approval/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ApprovalPage
      role='dosen-pendamping'
      title='Approval Peminjaman - Dosen Pendamping'
      description='Validasi proposal dan catat masukan sebelum diteruskan.'
      editorRoutePath='/dosen-pendamping/approval/editor'
    />
  );
}
