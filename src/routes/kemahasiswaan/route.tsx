import { KemahasiswaanSidebar } from '@/components/layouts/kemahasiswaan/KemahasiswaanSidebar';
import KemahasiswaanTopbar from '@/components/layouts/kemahasiswaan/KemahasiswaanTopbar';
import { SidebarProvider } from '@/components/ui/shadcn/sidebar';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/kemahasiswaan')({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = React.useState(false);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className='gap-0'>
      <KemahasiswaanSidebar />
      <main className='flex-1 flex flex-col w-full min-w-0'>
        <KemahasiswaanTopbar />
        <div className='flex-1 p-6 space-y-6'>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
