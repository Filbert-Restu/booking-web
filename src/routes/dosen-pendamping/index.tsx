import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dosen-pendamping/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dosen-pendamping/indec"!</div>
}
