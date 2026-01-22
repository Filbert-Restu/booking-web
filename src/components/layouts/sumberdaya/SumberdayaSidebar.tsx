import { LayoutDashboard, FileCheck } from 'lucide-react';
import { SideBar, type MenuSection } from '@/components/layouts/SideBar';

const menuSections: MenuSection[] = [
	{
		label: 'Dashboard',
		items: [
			{
				title: 'Dashboard',
				url: '/sumber-daya',
				icon: LayoutDashboard,
			},
		],
	},
	{
		label: 'Peminjaman',
		items: [
			{
				title: 'Approve Sumber Daya',
				url: '/sumber-daya/approval',
				icon: FileCheck,
			},
		],
	},
];

export function SumberdayaSidebar() {
	return <SideBar menuSections={menuSections} />;
}

