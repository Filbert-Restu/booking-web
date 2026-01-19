import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/peminjam/peminjaman-ruang/pinjam')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/peminjam/peminjaman-ruang/pinjam"!</div>
}
