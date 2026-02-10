import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/manajemen-ruang/detail')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/manajemen-ruang/detail"!</div>;
}
