import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ketua-departemen/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/ketua-departemen/"!</div>
}
