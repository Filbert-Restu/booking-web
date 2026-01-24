import { LayoutDashboard, Calendar, FileText, Users } from 'lucide-react';
import { SideBar, type MenuSection } from '@/components/layouts/SideBar';

const menuSections: MenuSection[] = [
  {
    label: 'Main',
    items: [
      {
        title: 'Dashboard',
        url: '/ketua-ormawa',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Peminjaman',
    items: [
      {
        title: 'Approval',
        url: '/ketua-ormawa/approval/',
        icon: FileText,
      },
      {
        title: 'Daftar Pengaju',
        url: '/ketua-ormawa/pengaju',
        icon: Users,
      },
    ],
  },
];

export function KetuaOrmawaSidebar() {
  return <SideBar menuSections={menuSections} />;
}
