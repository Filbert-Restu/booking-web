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

import { Link } from '@tanstack/react-router';
import { SideBar, type MenuSection } from '@/components/layouts/SideBar';

const menuSections: MenuSection[] = [
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
  return (
    <SideBar
      menuSections={menuSections}
      footerLink={{
        label: 'Documentation',
        url: '/admin/documentation',
        icon: BookOpen,
      }}
    />
  );
}
