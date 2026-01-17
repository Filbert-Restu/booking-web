import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/users/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/users/add"!</div>
}
