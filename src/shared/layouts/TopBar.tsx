import { SidebarTrigger } from '@/shared/components/ui/sidebar/sidebar';
import { Button } from '@/shared/components/ui/button/button';
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
   * URL tujuan tombol kanan (misal login / logout)
   */
  actionHref?: string;
  /**
   * Label tombol kanan
   */
  actionLabel?: string;
  /**
   * Callback when login button is clicked
   */
  onLoginClick?: () => void;
};

export function TopBar({
  actionHref = '/login-option',
  actionLabel = 'Login',
  onLoginClick,
}: TopBarProps) {
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // ignore network errors
    }
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

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
    <header className={`w-full flex items-center justify-between bg-primary border-b border-gray-100 px-6 py-6 h-20 transition-all`}>
      <div className='flex items-center gap-3'>
        {/* Trigger sidebar untuk layout dengan sidebar (admin, role, dll) */}
        {hasSidebar && <SidebarTrigger className='md:hidden text-white' />}
        <div className='flex items-center gap-3'>
          <img src='/fsm-logo.webp' alt='FSM Logo' className='h-12 w-auto' />
        </div>
      </div>
      <div className='flex items-center gap-4'>
        {user ? (
          <>
            <div className='text-white text-right sm:block'>
              <p className='text-sm font-semibold'>{user.name}</p>
              <p className='text-xs text-white/80'>
                {user.role?.name || 'User'}{' '}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className='inline-flex items-center gap-2 bg-white/20 text-white hover:bg-white/30 border border-white/30 px-4 py-2 rounded-xl shadow-sm transition-all duration-200 text-sm font-bold active:scale-95'
            >
              Logout
            </button>
          </>
        ) : onLoginClick ? (
          <Button
            onClick={onLoginClick}
            className='flex rounded-xl items-center gap-1.5 bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/30 px-6 py-2 font-bold transition-all duration-200 text-sm h-auto active:scale-95 relative overflow-hidden group'
          >
            <span className='relative z-10'>{actionLabel}</span>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5 relative z-10 transition-transform group-hover:translate-x-0.5 duration-200' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M13 7l5 5m0 0l-5 5m5-5H6' />
            </svg>
            <span className='absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
          </Button>
        ) : (
          <Link
            to={actionHref}
            className='flex rounded-xl items-center gap-1.5 bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/30 px-6 py-2 font-bold transition-all duration-200 text-sm active:scale-95'
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
