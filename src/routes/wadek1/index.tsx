import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wadek1/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/wadek1/"!</div>
}
