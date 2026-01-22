import { SidebarTrigger } from '@/components/ui/shadcn/sidebar/sidebar';
import { Link } from '@tanstack/react-router';

import TopBar from '@/components/layouts/TopBar';

export default function AdminTopbar() {
  return <TopBar actionHref='/login-option' actionLabel='Keluar' />;
}
        <SidebarTrigger className='md:hidden text-white' />
