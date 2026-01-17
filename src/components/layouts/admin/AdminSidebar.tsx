import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  ClipboardList,
  UserCheck,
  FileCheck,
  BookOpen,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/shadcn/sidebar/sidebar';
import { Link, useRouterState } from '@tanstack/react-router';

const menuSections = [
  {
    label: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        url: '/admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Manajemen User',
        url: '/admin/users',
        icon: Users,
      },
    ],
  },
  {
    label: 'Ruang',
    items: [
      {
        title: 'Peminjaman Ruang',
        url: '/admin/peminjaman-ruang',
        icon: Calendar,
      },
      {
        title: 'Manajemen Ruang',
        url: '/admin/manajemen-ruang',
        icon: Building2,
      },
    ],
  },
  {
    label: 'Peminjaman',
    items: [
      {
        title: 'Manajemen Peminjaman',
        url: '/admin/manajemen-peminjaman',
        icon: ClipboardList,
      },
      {
        title: 'Approve Kemahasiswaan',
        url: '/admin/approve-kemahasiswaan',
        icon: UserCheck,
      },
      {
        title: 'Approve Sumberdaya',
        url: '/admin/approve-sumberdaya',
        icon: FileCheck,
      },
    ],
  },
];

export function AdminSidebar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarTrigger className='text-foreground group-data-[collapsible=icon]:ml-0' />
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section, index) => (
          <SidebarGroup
            key={section.label}
            className={
              index < menuSections.length - 1
                ? 'border-b border-border pb-4'
                : ''
            }
          >
            <SidebarGroupLabel className='text-muted-foreground uppercase text-xs'>
              {section.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => {
                const isActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? 'bg-primary/20! border-l-4! border-primary! hover:bg-primary/30!'
                          : 'hover:bg-accent/50! hover:border-l-4! hover:border-primary/30!'
                      }
                    >
                      <Link to={item.url}>
                        <item.icon
                          className={
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          }
                        />
                        <span
                          className={
                            isActive
                              ? 'text-foreground! font-semibold!'
                              : 'text-foreground'
                          }
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='bg-primary text-primary-foreground hover:bg-primary/90'
            >
              <Link to='/admin/documentation'>
                <BookOpen />
                <span>Documentation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
