import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/senat/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/senat/"!</div>
}
