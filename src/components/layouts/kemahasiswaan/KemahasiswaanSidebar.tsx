import { LayoutDashboard, UserCheck } from 'lucide-react';
import { SideBar, type MenuSection } from '@/components/layouts/SideBar';

const menuSections: MenuSection[] = [
	{
		label: 'Dashboard',
		items: [
			{
				title: 'Dashboard',
				url: '/kemahasiswaan',
				icon: LayoutDashboard,
			},
		],
	},
	{
		label: 'Peminjaman',
		items: [
			{
				title: 'Approve Kemahasiswaan',
				url: '/kemahasiswaan/approval/',
				icon: UserCheck,
			},
		],
	},
];

export function KemahasiswaanSidebar() {
	return <SideBar menuSections={menuSections} />;
}

