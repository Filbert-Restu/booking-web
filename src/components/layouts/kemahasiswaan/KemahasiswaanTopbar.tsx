import { SidebarTrigger } from '@/components/ui/shadcn/sidebar/sidebar';
import { Link } from '@tanstack/react-router';

export default function KemahasiswaanTopbar() {
	return (
		<header className='w-full flex items-center justify-between bg-primary px-6 py-10 h-16'>
			{/* Logo dan Nama Fakultas */}
			<div className='flex items-center gap-3'>
				<SidebarTrigger className='md:hidden text-white' />
				<h3 className='text-white text-sm font-bold'>
					Sistem Peminjaman Ruang <br />
					Fakultas Sains dan Matematika
				</h3>
			</div>
			{/* Aksi kanan (misalnya logout / profil) */}
			<Link
				to='/login'
				className='flex items-center gap-4 bg-white text-primary px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition'
			>
				Login Cuy!
			</Link>
		</header>
	);
}

