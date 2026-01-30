import { SidebarTrigger } from '@/shared/components/ui/sidebar/sidebar';
import { Link } from '@tanstack/react-router';
import { useSidebar } from '@/shared/components/ui/sidebar/sidebarContext';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

type User = {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    name: string;
    slug: string;
  };
  unit?: {
    id: number;
    name: string;
    code: string;
  };
};

type TopBarProps = {
  /**
   * Judul atau nama halaman/role yang ditampilkan di TopBar
   */
  title?: string;
  /**
   * URL tujuan tombol kanan (misal login / logout)
   */
  actionHref?: string;
  /**
   * Label tombol kanan
   */
  actionLabel?: string;
};

export function TopBar({
  title,
  actionHref = '/login-option',
  actionLabel = 'Login',
}: TopBarProps) {
  const [user, setUser] = useState<User | null>(null);

  // Fetch current user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get<User>('/user');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Check if we're inside a SidebarProvider
  let hasSidebar = false;
  try {
    useSidebar();
    hasSidebar = true;
  } catch {
    hasSidebar = false;
  }

  return (
    <header className='w-full flex items-center justify-between bg-primary px-6 py-10 h-16'>
      <div className='flex items-center gap-3'>
        {/* Trigger sidebar untuk layout dengan sidebar (admin, role, dll) */}
        {hasSidebar && <SidebarTrigger className='md:hidden text-white' />}
        <div>
          <h3 className='text-white text-sm font-bold'>
            {title || 'Sistem Peminjaman Ruang'}
          </h3>
          <p className='text-white/90 text-xs'>
            Fakultas Sains dan Matematika
          </p>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        {user && (
          <div className='text-white text-right'>
            <p className='text-sm font-semibold'>{user.name}</p>
            <p className='text-xs text-white/80'>
              {user.role?.name || 'User'} {user.unit?.name ? `- ${user.unit.name}` : ''}
            </p>
          </div>
        )}
        <Link
          to={actionHref}
          className='flex items-center gap-4 bg-white text-primary px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition text-sm'
        >
          {actionLabel}
        </Link>
      </div>
    </header>
  );
}
