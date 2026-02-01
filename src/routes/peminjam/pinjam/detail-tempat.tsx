import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { AxiosError } from 'axios';
import { Stepper } from '@/shared/components/common/Stepper';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';
import { roomService, type Room } from '@/services/room.service';
import { documentService } from '@/services/document.service';
import { useBookingContext } from '@/contexts/BookingContext';

export const Route = createFileRoute('/peminjam/pinjam/detail-tempat')({
	validateSearch: (search: Record<string, unknown>) => {
		return {
			editId: Number(search.editId) || undefined,
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
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const searchParams = Route.useSearch();
	const { editId } = searchParams;
	const { formData, updateFormData } = useBookingContext();

	// Detect if this is from reservation (has document_id already)
	const [isFromReservation, setIsFromReservation] = useState(false);

	const [rooms, setRooms] = useState<Room[]>([]);
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
	const [startTime, setStartTime] = useState('09:00');
	const [endTime, setEndTime] = useState('11:00');
	const [bookingDate, setBookingDate] = useState(() => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split('T')[0];
	});
	const [activity, setActivity] = useState('');
	const [ketuaPelaksanaNama, setKetuaPelaksanaNama] = useState('');
	const [ketuaPelaksanaNim, setKetuaPelaksanaNim] = useState('');
	const [ketuaPelaksanaHp, setKetuaPelaksanaHp] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [checkingAvailability, setCheckingAvailability] = useState(false);
	const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

	// Auto-fill dari searchParams (dari link Ajukan Pinjam di kolom RESERVASI)
	useEffect(() => {
		// HANYA auto-fill jika ada roomId DAN bookingDate (dari reservasi)
		const isReservationLink = searchParams.roomId && searchParams.bookingDate;
		
		if (isReservationLink) {
			setIsFromReservation(true);
			// Auto-fill semua field dari reservation
			if (searchParams.roomId) setSelectedRoomId(searchParams.roomId);
			if (searchParams.bookingDate) setBookingDate(searchParams.bookingDate);
			if (searchParams.startTime) setStartTime(searchParams.startTime);
			if (searchParams.endTime) setEndTime(searchParams.endTime);
			if (searchParams.purpose) setActivity(searchParams.purpose);
			if (searchParams.ketuaNama) setKetuaPelaksanaNama(searchParams.ketuaNama);
			if (searchParams.ketuaNim) setKetuaPelaksanaNim(searchParams.ketuaNim);
			if (searchParams.ketuaHp) setKetuaPelaksanaHp(searchParams.ketuaHp);
		} else {
			// Button biru - form kosong
			setIsFromReservation(false);
		}
	}, [searchParams]);

	const steps = [
		{ number: 1, title: 'Detail Tempat' },
		{ number: 2, title: 'Proposal' },
		{ number: 3, title: 'Tanda Tangan' },
	];

	useEffect(() => {
		fetchRooms();

		const initializeData = async () => {
			if (editId) {
				try {
					setLoading(true);
					const doc = await documentService.getDocument(editId);
					const content = doc.content as any;

					const data = {
						document_id: doc.id,
						room_id: content.room_id,
						room_code: content.room_code,
						booking_date: content.booking_date,
						start_time: content.start_time,
						end_time: content.end_time,
						purpose: content.purpose,
						ketua_pelaksana_nama: content.ketua_pelaksana_nama,
						ketua_pelaksana_nim: content.ketua_pelaksana_nim,
						ketua_pelaksana_hp: content.ketua_pelaksana_hp,
						event_name: doc.title,
					};

					updateFormData(data);
					applyDataToLocalState(data);
					setIsFromReservation(true);
				} catch (err) {
					console.error('Failed to fetch document for edit:', err);
					setError('Gagal memuat data pengajuan');
				} finally {
					setLoading(false);
				}
			} else if (formData.document_id) {
				applyDataToLocalState(formData);
				setIsFromReservation(true);
			}
		};

		initializeData();
	}, [editId]);

	const applyDataToLocalState = (data: any) => {
		if (data.room_id) setSelectedRoomId(data.room_id);
		if (data.start_time) setStartTime(data.start_time);
		if (data.end_time) setEndTime(data.end_time);
		if (data.booking_date) setBookingDate(data.booking_date);
		if (data.purpose) setActivity(data.purpose);
		if (data.ketua_pelaksana_nama) setKetuaPelaksanaNama(data.ketua_pelaksana_nama);
		if (data.ketua_pelaksana_nim) setKetuaPelaksanaNim(data.ketua_pelaksana_nim);
		if (data.ketua_pelaksana_hp) setKetuaPelaksanaHp(data.ketua_pelaksana_hp);
	};

	const fetchRooms = async () => {
		try {
			setLoading(true);
			const data = await roomService.getRooms({ status: 'ACTIVE' });
			setRooms(data);
			if (data.length > 0 && !selectedRoomId) {
				setSelectedRoomId(data[0].id);
			}
		} catch (err) {
			console.error('Failed to fetch rooms:', err);
			if (err instanceof AxiosError) {
				setError(err.response?.data?.message || 'Gagal memuat data ruangan');
			} else {
				setError('Gagal memuat data ruangan');
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

			const result = await roomService.checkAvailability(
				selectedRoomId,
				bookingDate,
				startTime,
				endTime
			);

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
		if (selectedRoomId && bookingDate && startTime && endTime) {
			const timeoutId = setTimeout(() => {
				checkAvailability();
			}, 500);
			return () => clearTimeout(timeoutId);
		}
	}, [selectedRoomId, bookingDate, startTime, endTime]);

	const handleNext = async (e: React.FormEvent) => {
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

		// If from reservation, skip document creation and go directly to next step
		if (isFromReservation) {
			// Data already in context, just navigate
			navigate({ to: '/peminjam/pinjam/proposal' });
			return;
		}

		// Check availability first (only for new bookings)
		try {
			setLoading(true);
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

			// Create draft document
			const selectedRoom = rooms.find(r => r.id === selectedRoomId);
			const document = await documentService.createDocument({
				workflow_id: 1, // Assuming workflow_id 1 is for room booking
				title: `Peminjaman ${selectedRoom?.name || 'Ruangan'} - ${bookingDate}`,
				content: {
					room_id: selectedRoomId,
					room_code: selectedRoom?.code,
					room_name: selectedRoom?.name,
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
					step: 'detail_tempat',
				},
			});

			// Save to context
			updateFormData({
				document_id: document.id,
				room_id: selectedRoomId,
				room_code: selectedRoom?.code,
				booking_date: bookingDate,
				start_time: startTime,
				end_time: endTime,
				purpose: activity,
				ketua_pelaksana_nama: ketuaPelaksanaNama,
				ketua_pelaksana_nim: ketuaPelaksanaNim,
				ketua_pelaksana_hp: ketuaPelaksanaHp,
			});

			// Navigate to next step
			navigate({ to: '/peminjam/pinjam/proposal' });
		} catch (err) {
			console.error('Failed to create document:', err);
			if (err instanceof AxiosError) {
				alert(err.response?.data?.message || 'Gagal membuat dokumen');
			} else {
				alert('Terjadi kesalahan saat membuat dokumen');
			}
		} finally {
			setLoading(false);
		}
	};

	const selectedRoom = rooms.find(r => r.id === selectedRoomId);

	if (loading && rooms.length === 0) {
		return (
			<div className='p-6 flex justify-center items-center min-h-screen'>
				<div className='text-center'>
					<div className='text-lg font-semibold text-gray-700'>Memuat data...</div>
				</div>
			</div>
		);
	}

	if (error) {
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
			<Stepper steps={steps} currentStep={1} />

			<div className='max-w-2xl mx-auto'>
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
					<h2 className='text-xl font-semibold text-gray-900 mb-6'>
						Detail Tempat - {selectedRoom?.name || 'Pilih Ruangan'}
					</h2>

					<form onSubmit={handleNext} className='space-y-5'>
						<div className='space-y-2'>
							<label className='block text-sm font-medium text-gray-700'>
								Pilih Ruangan
							</label>
							<Select
								value={selectedRoomId?.toString()}
								onValueChange={(value) => setSelectedRoomId(Number(value))}
								disabled={isFromReservation}
							>
								<SelectTrigger>
									<SelectValue placeholder='Pilih ruangan...' />
								</SelectTrigger>
								<SelectContent>
									{rooms.map((room) => (
										<SelectItem key={room.id} value={room.id.toString()}>
											{room.code} - {room.name} (Kapasitas: {room.capacity})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{selectedRoom && (
								<p className='text-sm text-gray-600'>
									{selectedRoom.description}
								</p>
							)}
						</div>

						{/* Data Ketua Ormawa */}
						<div className='space-y-3'>
							<p className='text-sm font-medium text-gray-700'>Data Ketua Ormawa</p>

							<div className='space-y-2'>
								<label className='block text-sm text-gray-600'>
									Nama Ketua Pelaksana *
								</label>
								<Input
									placeholder='Masukkan nama ketua pelaksana'
									value={ketuaPelaksanaNama}
									onChange={(e) => setKetuaPelaksanaNama(e.target.value)}
									disabled={isFromReservation}
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
								const value = e.target.value.replace(/\D/g, ''); // Hanya angka
								if (value.length <= 14) setKetuaPelaksanaNim(value);
							}}
							disabled={isFromReservation}
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
								const value = e.target.value.replace(/\D/g, ''); // Hanya angka
								if (value.length <= 13) setKetuaPelaksanaHp(value);
							}}
							disabled={isFromReservation}
							maxLength={13}
							required
						/>
						<p className='text-xs text-gray-500'>Hanya angka, 12-13 digit</p>
					</div>
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
										disabled={isFromReservation}
										required
									/>
								</div>

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
											disabled={isFromReservation}
											required
										/>
										<span className='text-sm text-gray-500 flex-shrink-0'>-</span>
										<Input
											type='time'
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
											className='flex-1 min-w-0'
											disabled={isFromReservation}
											required
										/>
									</div>
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
								Aktivitas/Kegiatan
							</label>
							<Textarea
								placeholder='Jelaskan kegiatan yang akan dilakukan...'
								value={activity}
								onChange={(e) => setActivity(e.target.value)}
								rows={4}
								className='resize-none'
								disabled={isFromReservation}
								required
							/>
						</div>

						<div className='flex justify-end gap-3 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => navigate({ to: '/peminjam/pinjam' })}
							>
								Batal
							</Button>
							<Button
								type='submit'
								disabled={loading || checkingAvailability || availabilityMessage?.startsWith('✗')}
							>
								{loading ? 'Memproses...' : 'Selanjutnya'}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
