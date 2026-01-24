import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  ClipboardList,
  UserCheck,
  FileCheck,
  BookOpen,
  FileText,
  CheckSquare,
  CalendarCheck,
  Home,
} from 'lucide-react';

import type { MenuSection, SidebarFooterLink } from './SideBar';

export type UserRole =
  | 'admin'
  | 'wadek1'
  | 'dosen-pendamping'
  | 'ketua-departemen'
  | 'ketua-ormawa'
  | 'kemahasiswaan'
  | 'sumber-daya'
  | 'peminjam'
  | 'senat';

type MenuConfig = {
  menuSections: MenuSection[];
  footerLink?: SidebarFooterLink;
};

export const menuConfigurations: Record<UserRole, MenuConfig> = {
  admin: {
    menuSections: [
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
    ],
    footerLink: {
      label: 'Documentation',
      url: '/admin/documentation',
      icon: BookOpen,
    },
  },
  wadek1: {
    menuSections: [
      {
        label: 'Menu Utama',
        items: [
          {
            title: 'Dashboard',
            url: '/wadek1',
            icon: LayoutDashboard,
          },
          {
            title: 'Persetujuan',
            url: '/wadek1/approval',
            icon: CheckSquare,
          },
        ],
      },
    ],
  },
  'dosen-pendamping': {
    menuSections: [
      {
        label: 'Menu Utama',
        items: [
          {
            title: 'Dashboard',
            url: '/dosen-pendamping',
            icon: LayoutDashboard,
          },
          {
            title: 'Persetujuan',
            url: '/dosen-pendamping/approval',
            icon: CheckSquare,
          },
        ],
      },
    ],
  },
  'ketua-departemen': {
    menuSections: [
      {
        label: 'Menu Utama',
        items: [
          {
            title: 'Dashboard',
            url: '/ketua-departemen',
            icon: LayoutDashboard,
          },
          {
            title: 'Persetujuan',
            url: '/ketua-departemen/approval',
            icon: CheckSquare,
          },
        ],
      },
    ],
  },
  'ketua-ormawa': {
    menuSections: [
      {
        label: 'Menu Utama',
        items: [
          {
            title: 'Dashboard',
            url: '/ketua-ormawa',
            icon: Home,
          },
          {
            title: 'Pengajuan Baru',
            url: '/ketua-ormawa/pengajuan',
            icon: FileText,
          },
          {
            title: 'Riwayat Pengajuan',
            url: '/ketua-ormawa/riwayat',
            icon: ClipboardList,
          },
        ],
      },
    ],
  },
  kemahasiswaan: {
    menuSections: [
      {
        label: 'Menu Utama',
        items: [
          {
            title: 'Dashboard',
            url: '/kemahasiswaan',
            icon: LayoutDashboard,
          },
          {
            title: 'Persetujuan',
            url: '/kemahasiswaan/approval',
            icon: CheckSquare,
          },
        ],
      },
    ],
  },
  'sumber-daya': {
    menuSections: [
      {
        label: 'Menu Utama',
        items: [
          {
            title: 'Dashboard',
            url: '/sumber-daya',
            icon: LayoutDashboard,
          },
          {
            title: 'Persetujuan',
            url: '/sumber-daya/approval',
            icon: CheckSquare,
          },
        ],
      },
    ],
  },
  peminjam: {
    menuSections: [
      {
        label: 'Menu Utama',
        items: [
          {
            title: 'Dashboard',
            url: '/peminjam',
            icon: Home,
          },
          {
            title: 'Peminjaman Baru',
            url: '/peminjam/booking',
            icon: CalendarCheck,
          },
          {
            title: 'Riwayat Peminjaman',
            url: '/peminjam/history',
            icon: ClipboardList,
          },
        ],
      },
    ],
  },
  senat: {
    menuSections: [
      {
        label: 'Menu Utama',
        items: [
          {
            title: 'Dashboard',
            url: '/senat',
            icon: LayoutDashboard,
          },
          {
            title: 'Persetujuan',
            url: '/senat/approval',
            icon: CheckSquare,
          },
        ],
      },
    ],
  },
};

export function getMenuConfig(role: UserRole): MenuConfig {
  return menuConfigurations[role];
}
