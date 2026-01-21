import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/peminjam/pinjam/detail')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/peminjam/pinjam/detail"!</div>
}
