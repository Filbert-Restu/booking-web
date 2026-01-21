import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/peminjam/pinjam/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/peminjam/pinjam/"!</div>
}
