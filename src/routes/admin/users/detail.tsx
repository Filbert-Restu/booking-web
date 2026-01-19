import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/users/detail')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/users/detail"!</div>
}
