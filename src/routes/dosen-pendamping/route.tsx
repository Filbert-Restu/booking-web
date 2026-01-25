import { SideBar, TopBar, getMenuConfig } from '@/shared/layouts';
import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/dosen-pendamping')({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = React.useState(false);
  const menuConfig = getMenuConfig('dosen-pendamping');

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className='gap-0'>
      <SideBar menuSections={menuConfig.menuSections} footerLink={menuConfig.footerLink} />
      <main className='flex-1 flex flex-col w-full min-w-0'>
        <TopBar title="Dosen Pendamping" />
        <div className='flex-1 p-6 space-y-6'>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
