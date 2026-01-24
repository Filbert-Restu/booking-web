import { SidebarTrigger } from '@/shared/components/ui/sidebar/sidebar';
import { Link } from '@tanstack/react-router';
import { useSidebar } from '@/shared/components/ui/sidebar/sidebarContext';

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

export default function TopBar({
  title,
  actionHref = '/login',
  actionLabel = 'Login',
}: TopBarProps) {
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
        <h3 className='text-white text-sm font-bold'>
          {title || 'Sistem Peminjaman Ruang'} <br />
          Fakultas Sains dan Matematika
        </h3>
      </div>
      <Link
        to={actionHref}
        className='flex items-center gap-4 bg-white text-primary px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition'
      >
        {actionLabel}
      </Link>
    </header>
  );
}
