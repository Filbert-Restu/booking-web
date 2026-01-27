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
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { formData, updateFormData } = useBookingContext();

	const [rooms, setRooms] = useState<Room[]>([]);
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(formData.room_id || null);
	const [startTime, setStartTime] = useState(formData.start_time || '09:00');
	const [endTime, setEndTime] = useState(formData.end_time || '11:00');
	const [bookingDate, setBookingDate] = useState(formData.booking_date || (() => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split('T')[0];
	})());
	const [activity, setActivity] = useState(formData.purpose || '');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [checkingAvailability, setCheckingAvailability] = useState(false);
	const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

	const steps = [
		{ number: 1, title: 'Detail Tempat' },
		{ number: 2, title: 'Proposal' },
		{ number: 3, title: 'Tanda Tangan' },
	];

	useEffect(() => {
		fetchRooms();
	}, []);

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
			alert('Mohon lengkapi semua field');
			return;
		}

		// Check availability first
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
					booking_date: bookingDate,
					start_time: startTime,
					end_time: endTime,
					purpose: activity,
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
											required
										/>
										<span className='text-sm text-gray-500 flex-shrink-0'>-</span>
										<Input
											type='time'
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
											className='flex-1 min-w-0'
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
								required
							/>
						</div>

						<div className='flex justify-end gap-3 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => navigate({ to: '/peminjam/reservasi' })}
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
