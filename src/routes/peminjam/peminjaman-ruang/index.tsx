import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/peminjam/peminjaman-ruang/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/peminjam/peminjaman-ruang/"!</div>
}
