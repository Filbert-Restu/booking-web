import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/kemahasiswaan')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/kemahasiswaan"!</div>
}
