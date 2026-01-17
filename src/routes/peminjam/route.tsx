import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SidebarTrigger } from '@/components/ui/shadcn/sidebar/sidebar';
import { AdminSidebar } from '@/components/layouts/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/shadcn/sidebar';

export const Route = createFileRoute('/peminjam')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarTrigger />
      <Outlet />
    </SidebarProvider>
  );
}
