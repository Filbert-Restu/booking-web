import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { SidebarProvider } from '@/components/ui/shadcn/sidebar';
import TopBar from '@/components/layouts/TopBar';
import { PeminjamSidebar } from '@/components/layouts/peminjam/PeminjamSidebar';

export const Route = createFileRoute('/peminjam')({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = React.useState(false);
  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className='gap-0'>
      <PeminjamSidebar />
      <main className='flex-1 flex flex-col w-full min-w-0'>
        <TopBar actionHref='/login' actionLabel='Login Cuy!' />
        <div className='flex-1 p-6 space-y-6'>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
