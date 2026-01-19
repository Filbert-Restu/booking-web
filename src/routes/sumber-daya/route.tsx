import { SumberdayaSidebar } from '@/components/layouts/sumberdaya/SumberdayaSidebar';
import SumberdayaTopbar from '@/components/layouts/sumberdaya/SumberdayaTopbar';
import { SidebarProvider } from '@/components/ui/shadcn/sidebar';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/sumber-daya')({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = React.useState(false);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className='gap-0'>
      <SumberdayaSidebar />
      <main className='flex-1 flex flex-col w-full min-w-0'>
        <SumberdayaTopbar />
        <div className='flex-1 p-6 space-y-6'>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
