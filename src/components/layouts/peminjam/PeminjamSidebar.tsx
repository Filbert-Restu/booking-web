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

import { SideBar, type MenuSection } from '@/components/layouts/SideBar';

const menuSections: MenuSection[] = [
  {
    label: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        url: '/peminjam',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Ruang',
    items: [
      {
        title: 'Peminjaman Ruang',
        url: '/peminjam/pinjam',
        icon: Calendar,
      },
      {
        title: 'Reservasi',
        url: '/peminjam/reservasi',
        icon: BookOpen,
      },
    ],
  },
];

export function PeminjamSidebar() {
  return <SideBar menuSections={menuSections} />;
}
