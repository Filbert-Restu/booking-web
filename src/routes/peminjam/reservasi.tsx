import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';

type ReservationStatus = {
	id: number;
	borrowerId: string;
	borrowerName: string;
	date: string;
	time: string;
	status: 'pending' | 'approved';
};

export const Route = createFileRoute('/peminjam/reservasi')({
	component: RouteComponent,
});

function RouteComponent() {
	const [selectedRoom, setSelectedRoom] = useState('K105');
	const [search, setSearch] = useState('');
	const [showRoomDetails, setShowRoomDetails] = useState(false);

	const [startTime, setStartTime] = useState('09:30');
	const [endTime, setEndTime] = useState('09:30');
	const [startDate, setStartDate] = useState('2026-01-31');
	const [endDate, setEndDate] = useState('2026-01-31');
	const [activity, setActivity] = useState('');
	const [attachment, setAttachment] = useState<File | null>(null);

	const borrowerId = '24060119120011';

	const getStatusBadge = (status: 'pending' | 'approved') => {
		const statusConfig = {
			pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
			approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
		};
		const config = statusConfig[status];
		return (
			<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
				{config.label}
			</span>
		);
	};

	const reservations: ReservationStatus[] = [
		{
			id: 1,
			borrowerId: '24060119120011',
			borrowerName: 'Ahmad Fauzi',
			date: '31/01/2026',
			time: '09:30 - 11:30',
			status: 'approved',
		},
		{
			id: 2,
			borrowerId: '24060120130045',
			borrowerName: 'Siti Nurhaliza',
			date: '31/01/2026',
			time: '13:00 - 15:00',
			status: 'approved',
		},
		{
			id: 3,
			borrowerId: '199012012015041001',
			borrowerName: 'Dr. Budi Santoso',
			date: '01/02/2026',
			time: '08:00 - 10:00',
			status: 'pending',
		},
		{
			id: 4,
			borrowerId: '24060119140028',
			borrowerName: 'Rina Wijaya',
			date: '02/02/2026',
			time: '14:00 - 16:00',
			status: 'pending',
		},
	];

	const handleSearch = () => {
		setShowRoomDetails(true);
		// TODO: Integrate with API to fetch room availability
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Integrate with API when backend is ready
		console.log({
			selectedRoom,
			borrowerId,
			startTime,
			endTime,
			startDate,
			endDate,
			activity,
			attachment,
		})
	}

	return (
		<div className='space-y-6'>
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-3'>
				<div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center w-fit'>
					<Select value={selectedRoom} onValueChange={setSelectedRoom}>
						<SelectTrigger className='w-full sm:w-64'>
							<SelectValue placeholder='Pilih ruangan...' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='K105'>K105</SelectItem>
							<SelectItem value='K106'>K106</SelectItem>
							<SelectItem value='K201'>K201</SelectItem>
						</SelectContent>
					</Select>
					<Button onClick={handleSearch}>Cari</Button>
				</div>
			</div>

			{showRoomDetails && (
				<div className='flex flex-col lg:flex-row gap-6'>
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 lg:w-[37.5%]'>
					<div>
						<h2 className='text-lg font-semibold text-gray-900'>
							Reservasi Ruang {selectedRoom}
						</h2>
					</div>

					<form onSubmit={handleSubmit} className='space-y-5'>
						<div className='space-y-2'>
							<label className='block text-sm font-medium text-gray-700'>
								Peminjam
							</label>
							<Input value={borrowerId} disabled readOnly className='bg-gray-300' />
						</div>

						<div className='space-y-3'>
							<p className='text-sm font-medium text-gray-700'>Waktu & Tanggal</p>

							<div className='space-y-3'>
								<div className='flex flex-col gap-2'>
									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<Clock className='w-4 h-4' />
										<span>Waktu</span>
									</div>
									<div className='flex items-center gap-2 w-full'>
										<Input
											type='time'
											value={startTime}
											onChange={(e) => setStartTime(e.target.value)}
											className='flex-1 min-w-0'
										/>
										<span className='text-sm text-gray-500 flex-shrink-0'>-</span>
										<Input
											type='time'
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
											className='flex-1 min-w-0'
										/>
									</div>
								</div>

								<div className='flex flex-col gap-2'>
									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<Calendar className='w-4 h-4' />
										<span>Tanggal</span>
									</div>
									<div className='flex items-center gap-2 w-full'>
										<Input
											type='date'
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
											className='flex-1 min-w-0'
										/>
										<span className='text-sm text-gray-500 flex-shrink-0'>-</span>
										<Input
											type='date'
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
											className='flex-1 min-w-0'
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='space-y-2'>
							<label className='block text-sm font-medium text-gray-700'>
								Aktivitas/Kegiatan
							</label>
							<Textarea
								placeholder=''
								value={activity}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setActivity(e.target.value)}
								rows={4}
								className='resize-none'
							/>
						</div>

						<div className='flex justify-end'>
							<Button type='submit' className='mt-2'>
								Reservasi
							</Button>
						</div>
					</form>
				</div>

				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 lg:w-[62.5%]'>
					<div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
						<h2 className='text-lg font-semibold text-gray-900'>
							Status Peminjaman Ruang {selectedRoom}
						</h2>
						<div className='flex items-center gap-2 text-sm'>
							<span className='text-gray-700'>Search:</span>
							<Input
								className='w-40'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder='Cari...'
							/>
						</div>
					</div>

					<div className='border border-gray-200 rounded-lg overflow-hidden'>
						<div className='overflow-x-auto'>
							<Table className='min-w-full text-sm'>
								<TableHeader>
									<TableRow>
										<TableHead className='w-12 text-center'>No</TableHead>
										<TableHead>NIM/NIP Peminjam</TableHead>
										<TableHead>Nama Peminjam</TableHead>
										<TableHead>Tanggal</TableHead>
										<TableHead>Waktu</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{reservations.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={6}
												className='text-center text-gray-500 py-8'
											>
												No data available in table
											</TableCell>
										</TableRow>
									) : (
										reservations
											.filter((item) =>
												[
													item.borrowerId,
													item.borrowerName,
													item.date,
													item.time,
												]
													.join(' ')
													.toLowerCase()
													.includes(search.toLowerCase())
											)
											.map((item, index) => (
												<TableRow key={item.id}>
													<TableCell className='text-center'>
														{index + 1}
													</TableCell>
													<TableCell>{item.borrowerId}</TableCell>
													<TableCell>{item.borrowerName}</TableCell>
													<TableCell>{item.date}</TableCell>
													<TableCell>{item.time}</TableCell>
													<TableCell>
														{getStatusBadge(item.status)}
													</TableCell>
												</TableRow>
											))
									)}
								</TableBody>
							</Table>
						</div>

						<div className='flex items-center justify-between px-4 py-3 border-t text-xs text-gray-500 bg-gray-50'>
							<span>
								Showing 0 to 0 of {reservations.length} entries
							</span>
							<div className='flex gap-2'>
								<button className='text-primary disabled:text-gray-400' disabled>
									Previous
								</button>
								<button className='text-primary disabled:text-gray-400' disabled>
									Next
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			)}
		</div>
	)
}

export default RouteComponent;

