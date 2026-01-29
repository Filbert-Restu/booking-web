import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  ClipboardList,
  BookOpen,
  CalendarCheck,
  Home,
  History,
  DoorOpen,
  PlusCircle,
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
        label: 'Konfigurasi',
        items: [
          {
            title: 'Manajemen User',
            url: '/admin/users',
            icon: Users,
          },
          {
            title: 'Manajemen Unit',
            url: '/admin/units',
            icon: Building2,
          },
          {
            title: 'Manajemen Alur',
            url: '/admin/workflows',
            icon: ClipboardList,
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
            title: 'Riwayat Persetujuan',
            url: '/wadek1/riwayat-persetujuan',
            icon: History,
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
            title: 'Riwayat Persetujuan',
            url: '/dosen-pendamping/riwayat-persetujuan',
            icon: History,
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
            title: 'Riwayat Persetujuan',
            url: '/ketua-departemen/riwayat-persetujuan',
            icon: History,
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
            title: 'Riwayat Persetujuan',
            url: '/ketua-ormawa/riwayat-persetujuan',
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
            title: 'Riwayat Persetujuan',
            url: '/kemahasiswaan/riwayat-persetujuan',
            icon: History,
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
            title: 'Riwayat Persetujuan',
            url: '/sumber-daya/riwayat-persetujuan',
            icon: History,
          },
        ],
      },
      {
        label: 'Ruang',
        items: [
          {
            title: 'Manajemen Ruang',
            url: '/sumber-daya/manajemen-ruang',
            icon: DoorOpen,
          },
        ],
      },
      {
        label: 'Peminjaman',
        items: [
          {
            title: 'Tambah Peminjaman',
            url: '/sumber-daya/tambah-peminjaman',
            icon: PlusCircle,
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
            title: 'Ajukan Peminjaman',
            url: '/peminjam/pinjam',
            icon: CalendarCheck,
          },
          {
            title: 'Reservasi Ruang',
            url: '/peminjam/reservasi',
            icon: ClipboardList,
          },
          {
            title: 'Tanda Tangan',
            url: '/peminjam/sign',
            icon: BookOpen,
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
            title: 'Riwayat Persetujuan',
            url: '/senat/riwayat-persetujuan',
            icon: History,
          },
        ],
      },
    ],
  },
};

export function getMenuConfig(role: UserRole): MenuConfig {
  return menuConfigurations[role];
}
