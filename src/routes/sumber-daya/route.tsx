import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sumber-daya')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sumber-daya"!</div>
}
