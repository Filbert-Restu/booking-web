import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { SidebarProvider } from '@/components/ui/shadcn/sidebar';
import KetuaOrmawaTopbar from '@/components/layouts/ketua-ormawa/KetuaOrmawaTopbar';
import { KetuaOrmawaSidebar } from '@/components/layouts/ketua-ormawa/KetuaOrmawaSidebar';

export const Route = createFileRoute('/ketua-ormawa')({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = React.useState(false);
  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className="gap-0">
      <KetuaOrmawaSidebar />
      <main className="flex-1 flex flex-col w-full min-w-0">
        <KetuaOrmawaTopbar />
        <div className="flex-1 p-6 space-y-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
