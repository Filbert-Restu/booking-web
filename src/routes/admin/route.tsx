import { AdminSidebar } from '@/components/layouts/admin/AdminSidebar';
import AdminTopbar from '@/components/layouts/admin/AdminTopbar';
import { SidebarProvider } from '@/components/ui/shadcn/sidebar';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = React.useState(false);
  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className='gap-0'>
      <AdminSidebar />
      <main className='flex-1 flex flex-col w-full min-w-0'>
        <AdminTopbar />
        <div className='flex-1 p-6 space-y-6'>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
