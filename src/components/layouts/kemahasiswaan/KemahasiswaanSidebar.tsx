import { LayoutDashboard, UserCheck } from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
} from '@/components/ui/shadcn/sidebar/sidebar';
import { Link, useRouterState } from '@tanstack/react-router';

const menuSections = [
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
	const router = useRouterState();
	const currentPath = router.location.pathname;

	return (
		<Sidebar collapsible='icon'>
			<SidebarHeader>
				<SidebarTrigger className='text-foreground group-data-[collapsible=icon]:ml-0' />
			</SidebarHeader>

			<SidebarContent>
				{menuSections.map((section, index) => (
					<SidebarGroup
						key={section.label}
						className={
							index < menuSections.length - 1
								? 'border-b border-border pb-4'
								: ''
						}
					>
						<SidebarGroupLabel className='text-muted-foreground uppercase text-xs'>
							{section.label}
						</SidebarGroupLabel>
						<SidebarMenu>
							{section.items.map((item) => {
								const isActive = currentPath === item.url;
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											className={
												isActive
													? 'bg-primary/20! border-l-4! border-primary! hover:bg-primary/30!'
													: 'hover:bg-accent/50! hover:border-l-4! hover:border-primary/30!'
											}
										>
											<Link to={item.url}>
												<item.icon
													className={
														isActive
															? 'text-primary'
															: 'text-muted-foreground'
													}
												/>
												<span
													className={
														isActive
															? 'text-foreground! font-semibold!'
															: 'text-foreground'
													}
												>
													{item.title}
												</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroup>
				))}
			</SidebarContent>
		</Sidebar>
	);
}

