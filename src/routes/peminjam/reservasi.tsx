import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { AxiosError } from 'axios';

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
import { roomService, type Room, type RoomBooking } from '@/services/room.service';
import { documentService } from '@/services/document.service';

export const Route = createFileRoute('/peminjam/reservasi')({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			roomId: search.roomId as number | undefined,
			roomCode: search.roomCode as string | undefined,
			bookingDate: search.bookingDate as string | undefined,
			startTime: search.startTime as string | undefined,
			endTime: search.endTime as string | undefined,
			purpose: search.purpose as string | undefined,
			ketuaNama: search.ketuaNama as string | undefined,
			ketuaNim: search.ketuaNim as string | undefined,
			ketuaHp: search.ketuaHp as string | undefined,
		};
	},
});

function RouteComponent() {
	const searchParams = Route.useSearch();
	const [rooms, setRooms] = useState<Room[]>([]);
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
	const [bookings, setBookings] = useState<RoomBooking[]>([]);
	const [search, setSearch] = useState('');
	const [showRoomDetails, setShowRoomDetails] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [checkingAvailability, setCheckingAvailability] = useState(false);
	const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
	const [dateValidationMsg, setDateValidationMsg] = useState<string | null>(null);
	const [timeValidationMsg, setTimeValidationMsg] = useState<string | null>(null);

	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [bookingDate, setBookingDate] = useState('');
	const [activity, setActivity] = useState('');
	const [ketuaPelaksanaNama, setKetuaPelaksanaNama] = useState(() => {
		return localStorage.getItem('userName') || '';
	});
	const [ketuaPelaksanaNim, setKetuaPelaksanaNim] = useState(() => {
		return localStorage.getItem('userNim') || '';
	});
	const [ketuaPelaksanaHp, setKetuaPelaksanaHp] = useState('');

	// Check if selected date is Saturday
	const isSaturday = useMemo(() => {
		if (!bookingDate) return false;
		const d = new Date(bookingDate + 'T00:00:00');
		return d.getDay() === 6; // Saturday === 6
	}, [bookingDate]);

	// Check if time is valid (start_time < end_time)
	const isTimeValid = useMemo(() => {
		if (!startTime || !endTime) return true; // Belum diisi, anggap valid (belum ada error)
		return startTime < endTime;
	}, [startTime, endTime]);

	// Auto-fill form from query params (from Riwayat Pengajuan)
	useEffect(() => {
		if (searchParams.roomId) {
			setSelectedRoomId(searchParams.roomId);
			setShowRoomDetails(true);
		}
		if (searchParams.bookingDate) {
			setBookingDate(searchParams.bookingDate);
		}
		if (searchParams.startTime) {
			setStartTime(searchParams.startTime);
		}
		if (searchParams.endTime) {
			setEndTime(searchParams.endTime);
		}
		if (searchParams.purpose) {
			setActivity(searchParams.purpose);
		}
		if (searchParams.ketuaNama) {
			setKetuaPelaksanaNama(searchParams.ketuaNama);
		}
		if (searchParams.ketuaNim) {
			setKetuaPelaksanaNim(searchParams.ketuaNim);
		}
		if (searchParams.ketuaHp) {
			setKetuaPelaksanaHp(searchParams.ketuaHp);
		}
	}, [searchParams]);

	// Update validation message when date changes
	useEffect(() => {
		if (!bookingDate) {
			setDateValidationMsg(null);
		} else if (!isSaturday) {
			setDateValidationMsg('Peminjaman hanya diperbolehkan pada hari Sabtu');
		} else {
			setDateValidationMsg(null);
		}
	}, [bookingDate, isSaturday]);

	// Update validation message when time changes
	useEffect(() => {
		if (!startTime || !endTime) {
			setTimeValidationMsg(null);
		} else if (!isTimeValid) {
			setTimeValidationMsg('Waktu mulai harus lebih awal dari waktu selesai');
		} else {
			setTimeValidationMsg(null);
		}
	}, [startTime, endTime, isTimeValid]);

	// Fetch rooms on mount
	useEffect(() => {
		fetchRooms();
	}, []);

	const fetchRooms = async () => {
		try {
			setLoading(true);
			setError(null);
			console.log('Fetching rooms...');
			const data = await roomService.getRooms({ status: 'ACTIVE' });
			console.log('Rooms fetched:', data);
			setRooms(data);
			if (data.length > 0 && !selectedRoomId) {
				setSelectedRoomId(data[0].id);
			}
		} catch (err) {
			console.error('Failed to fetch rooms:', err);
			if (err instanceof AxiosError) {
				console.error('Error response:', err.response?.data);
				console.error('Error status:', err.response?.status);
				setError(err.response?.data?.message || 'Gagal memuat data ruangan');
			} else {
				setError('Gagal memuat data ruangan');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!selectedRoomId) {
			alert('Pilih ruangan terlebih dahulu');
			return;
		}

		try {
			setLoading(true);
			setError(null);
			setShowRoomDetails(true);

			// Get room details
			const roomData = await roomService.getRoom(selectedRoomId);
			setSelectedRoom(roomData.room);

			// Get room schedule for next 7 days
			const endDate = new Date();
			endDate.setDate(endDate.getDate() + 7);

			const scheduleData = await roomService.getRoomSchedule(
				selectedRoomId,
				new Date().toISOString().split('T')[0],
				endDate.toISOString().split('T')[0]
			);
			setBookings(scheduleData.bookings);
		} catch (err) {
			console.error('Failed to fetch room details:', err);
			if (err instanceof AxiosError) {
				setError(err.response?.data?.message || 'Gagal memuat detail ruangan');
			} else {
				setError('Terjadi kesalahan saat memuat data');
			}
		} finally {
			setLoading(false);
		}
	};

	const checkAvailability = async () => {
		if (!selectedRoomId || !bookingDate || !startTime || !endTime) {
			return;
		}

		try {
			setCheckingAvailability(true);
			setAvailabilityMessage(null);

			console.log('🔍 Checking availability:', {
				roomId: selectedRoomId,
				date: bookingDate,
				start_time: startTime,
				end_time: endTime
			});

			const result = await roomService.checkAvailability(
				selectedRoomId,
				bookingDate,
				startTime,
				endTime
			);

			console.log('📊 API Response:', result);
			console.log('📊 Detailed Response:', {
				available: result.available,
				conflictCount: result.conflicts?.length || 0,
				conflicts: result.conflicts
			});

			if (result.available) {
				setAvailabilityMessage('✓ Ruangan tersedia pada waktu yang dipilih');
			} else {
				const conflictCount = result.conflicts?.length || 0;
				setAvailabilityMessage(
					`✗ Ruangan tidak tersedia. Ada ${conflictCount} booking yang bentrok.`
				);
			}
		} catch (err) {
			console.error('Failed to check availability:', err);
			setAvailabilityMessage('Gagal mengecek ketersediaan ruangan');
		} finally {
			setCheckingAvailability(false);
		}
	};

	// Check availability when date/time changes
	useEffect(() => {
		if (selectedRoomId && bookingDate && startTime && endTime && showRoomDetails) {
			const timeoutId = setTimeout(() => {
				checkAvailability();
			}, 500);
			return () => clearTimeout(timeoutId);
		} else {
			// Reset message when room details hidden
			setAvailabilityMessage(null);
		}
	}, [selectedRoomId, bookingDate, startTime, endTime, showRoomDetails]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedRoomId || !bookingDate || !startTime || !endTime || !activity) {
			alert('Mohon lengkapi semua field wajib');
			return;
		}

		if (!ketuaPelaksanaNama || !ketuaPelaksanaNim || !ketuaPelaksanaHp) {
			alert('Mohon lengkapi data Ketua Pelaksana');
			return;
		}

		// Validasi NIM - harus 14 digit angka
		if (!/^\d{14}$/.test(ketuaPelaksanaNim)) {
			alert('NIM harus 14 digit angka');
			return;
		}

		// Validasi HP - harus 12-13 digit angka
		if (!/^\d{12,13}$/.test(ketuaPelaksanaHp)) {
			alert('Nomor HP harus 12-13 digit angka');
			return;
		}

		// Check availability first
		try {
			const availabilityResult = await roomService.checkAvailability(
				selectedRoomId,
				bookingDate,
				startTime,
				endTime
			);

			if (!availabilityResult.available) {
				alert('Ruangan tidak tersedia pada waktu yang dipilih. Silakan pilih waktu lain.');
				return;
			}

			// Create document for reservation
			setLoading(true);

			// Tentukan workflow_id berdasarkan unit category user
			const userUnitCategory = localStorage.getItem('userUnitCategory') || 'HMD';
			const workflowMap: Record<string, number> = {
				HMD: 1,
				BEM: 2,
				SENAT: 3,
				UKM: 4,
			};
			const workflowId = workflowMap[userUnitCategory] || 1;

			await documentService.createDocument({
				workflow_id: workflowId,
				title: `Peminjaman ${selectedRoom?.name || 'Ruangan'} - ${bookingDate}`,
				content: {
					room_id: selectedRoomId,
					room_code: selectedRoom?.code || '',
					room_name: selectedRoom?.name || '',
					booking_date: bookingDate,
					start_time: startTime,
					end_time: endTime,
					purpose: activity,
					ketua_pelaksana_nama: ketuaPelaksanaNama,
					ketua_pelaksana_nim: ketuaPelaksanaNim,
					ketua_pelaksana_hp: ketuaPelaksanaHp,
					peminjam_nama: localStorage.getItem('userName') || 'Pemohon',
				},
				meta_data: {
					type: 'room_reservation',
					step: 'reservation',
				},
			});

			// Reset form dan refresh data
			alert('Reservasi berhasil disimpan! Silakan cek di halaman Riwayat Pengajuan untuk melanjutkan.');
			
			// Reset form
			setStartTime('');
			setEndTime('');
			setBookingDate('');
			setActivity('');
			setKetuaPelaksanaNama(localStorage.getItem('userName') || '');
			setKetuaPelaksanaNim(localStorage.getItem('userNim') || '');
			setKetuaPelaksanaHp('');
			
			// Refresh booking list
			if (selectedRoomId) {
				await handleSearch();
			}
		} catch (err) {
			console.error('Failed to check availability:', err);
			if (err instanceof AxiosError) {
				alert(err.response?.data?.message || 'Gagal mengecek ketersediaan ruangan');
			} else {
				alert('Terjadi kesalahan saat membuat reservasi');
			}
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
			PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
			APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
			REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
			CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
		};
		const config = statusConfig[status] || statusConfig.PENDING;
		return (
			<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
				{config.label}
			</span>
		);
	};

	const filteredBookings = bookings.filter((item) =>
		[
			item.bookedBy?.name || '',
			item.booking_date,
			`${item.start_time} - ${item.end_time}`,
		]
			.join(' ')
			.toLowerCase()
			.includes(search.toLowerCase())
	);

	if (loading && !showRoomDetails) {
		return (
			<div className='p-6 flex justify-center items-center min-h-screen'>
				<div className='text-center'>
					<div className='text-lg font-semibold text-gray-700'>Memuat data...</div>
				</div>
			</div>
		);
	}

	if (error && !showRoomDetails) {
		return (
			<div className='p-6 flex justify-center items-center min-h-screen'>
				<div className='text-center'>
					<div className='text-lg font-semibold text-red-600 mb-4'>{error}</div>
					<Button onClick={fetchRooms}>Coba Lagi</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-3'>
				<div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center w-fit'>
					<Select
						value={selectedRoomId?.toString()}
						onValueChange={(value) => {
							setSelectedRoomId(Number(value));
							setShowRoomDetails(false);
						}}
					>
						<SelectTrigger className='w-full sm:w-64'>
							<SelectValue placeholder='Pilih ruangan...' />
						</SelectTrigger>
						<SelectContent>
							{rooms.map((room) => (
								<SelectItem key={room.id} value={room.id.toString()}>
									{room.code} - {room.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button onClick={handleSearch} disabled={!selectedRoomId || loading}>
						{loading ? 'Memuat...' : 'Cari'}
					</Button>
				</div>
			</div>

			{showRoomDetails && selectedRoom && (
				<div className='flex flex-col lg:flex-row gap-6'>
					<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 lg:w-[37.5%]'>
						<div>
							<h2 className='text-lg font-semibold text-gray-900'>
								Reservasi Ruang {selectedRoom.code}
							</h2>
							<p className='text-sm text-gray-600 mt-1'>
								Kapasitas: {selectedRoom.capacity} orang
							</p>
						</div>

						<form onSubmit={handleSubmit} className='space-y-5'>
							{/* Data Ketua Pelaksana */}
							<div className='space-y-3'>
								<p className='text-sm font-medium text-gray-700'>Data Ketua Pelaksana</p>

								<div className='space-y-2'>
									<label className='block text-sm text-gray-600'>
										Nama Ketua Pelaksana *
									</label>
									<Input
										placeholder='Masukkan nama ketua pelaksana'
										value={ketuaPelaksanaNama}
										onChange={(e) => setKetuaPelaksanaNama(e.target.value)}
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='block text-sm text-gray-600'>
										NIM (14 digit) *
									</label>
									<Input
										placeholder='Contoh: 20210801012345'
										value={ketuaPelaksanaNim}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, '');
											if (value.length <= 14) setKetuaPelaksanaNim(value);
										}}
										maxLength={14}
										required
									/>
									<p className='text-xs text-gray-500'>Hanya angka, 14 digit</p>
								</div>

								<div className='space-y-2'>
									<label className='block text-sm text-gray-600'>
										No HP (12-13 digit) *
									</label>
									<Input
										type='tel'
										placeholder='Contoh: 081234567890'
										value={ketuaPelaksanaHp}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, '');
											if (value.length <= 13) setKetuaPelaksanaHp(value);
										}}
										maxLength={13}
										required
									/>
									<p className='text-xs text-gray-500'>Hanya angka, 12-13 digit</p>
								</div>
							</div>

							<div className='space-y-3'>
								<p className='text-sm font-medium text-gray-700'>Waktu & Tanggal</p>

								<div className='space-y-3'>
									<div className='flex flex-col gap-2'>
										<div className='flex items-center gap-2 text-sm text-gray-600'>
											<Calendar className='w-4 h-4' />
											<span>Tanggal</span>
										</div>
										<Input
											type='date'
											value={bookingDate}
											onChange={(e) => setBookingDate(e.target.value)}
											min={new Date().toISOString().split('T')[0]}
											required
										/>
									{dateValidationMsg && (
										<div className='text-sm text-red-600 mt-1'>
											{dateValidationMsg}
										</div>
									)}
									<div className='flex items-center gap-2 w-full'>
										<Input
											type='time'
											value={startTime}
											onChange={(e) => setStartTime(e.target.value)}
											className='flex-1 min-w-0'
											required
										/>
										<span className='text-sm text-gray-500 shrink-0'>-</span>
										<Input
											type='time'
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
											className='flex-1 min-w-0'
											required
										/>
									</div>
									{timeValidationMsg && (
										<div className='text-sm text-red-600 mt-1'>
											{timeValidationMsg}
										</div>
									)}
									</div>
								</div>

								{/* Availability indicator */}
								{availabilityMessage && (
									<div
										className={`flex items-center gap-2 p-3 rounded-md text-sm ${availabilityMessage.startsWith('✓')
											? 'bg-green-50 text-green-700'
											: 'bg-red-50 text-red-700'
											}`}
									>
										<AlertCircle className='w-4 h-4' />
										<span>{availabilityMessage}</span>
									</div>
								)}
							</div>

							<div className='space-y-2'>
								<label className='block text-sm font-medium text-gray-700'>
									Nama Kegiatan
								</label>
								<Textarea
									placeholder='Jelaskan kegiatan yang akan dilakukan...'
									value={activity}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setActivity(e.target.value)
									}
									rows={4}
									className='resize-none'
									required
								/>
							</div>
							<div className='flex justify-end'>
								<Button
									type='submit'
									className='mt-2'
									disabled={loading || checkingAvailability || availabilityMessage?.startsWith('✗') || !isSaturday || !isTimeValid}
								>
									{loading ? 'Memproses...' : 'Reservasi'}
								</Button>
							</div>
						</form>
					</div>

					<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 lg:w-[62.5%]'>
						<div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
							<h2 className='text-lg font-semibold text-gray-900'>
								Jadwal Peminjaman Ruang {selectedRoom.code}
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
											<TableHead>Nama Peminjam</TableHead>
											<TableHead>Tanggal</TableHead>
											<TableHead>Waktu</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredBookings.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={5}
													className='text-center text-gray-500 py-8'
												>
													Tidak ada booking yang ditemukan
												</TableCell>
											</TableRow>
										) : (
											filteredBookings.map((item, index) => (
												<TableRow key={item.id}>
													<TableCell className='text-center'>
														{index + 1}
													</TableCell>
													<TableCell>
														{item.document?.content?.ketua_pelaksana_nama || item.bookedBy?.name || '-'}
													</TableCell>
													<TableCell>
														{new Date(item.booking_date).toLocaleDateString('id-ID')}
													</TableCell>
													<TableCell>
														{item.start_time} - {item.end_time}
													</TableCell>
													<TableCell>
														{getStatusBadge(item.status)}
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default RouteComponent;
