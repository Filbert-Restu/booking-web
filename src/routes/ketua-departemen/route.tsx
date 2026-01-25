import { SideBar, TopBar, getMenuConfig } from '@/shared/layouts';
import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/ketua-departemen')({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = React.useState(false);
  const menuConfig = getMenuConfig('ketua-departemen');

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className='gap-0'>
      <SideBar menuSections={menuConfig.menuSections} footerLink={menuConfig.footerLink} />
      <main className='flex-1 flex flex-col w-full min-w-0'>
        <TopBar title="Ketua Departemen" />
        <div className='flex-1 p-6 space-y-6'>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
