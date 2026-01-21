import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ketua-ormawa/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/ketua-ormawa/"!</div>
}
