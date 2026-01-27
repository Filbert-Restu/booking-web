import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/shared/components/ui/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { roomService, type Room } from '@/services/room.service';

export const Route = createFileRoute('/sumber-daya/manajemen-ruang')({
	component: RouteComponent,
});

function RouteComponent() {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingRoom, setEditingRoom] = useState<Room | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		code: '',
		capacity: 10,
		description: '',
		facilities: '',
		status: 'ACTIVE' as 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE',
	});
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		fetchRooms();
	}, []);

	const fetchRooms = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await roomService.getRooms();
			setRooms(data);
		} catch (err) {
			console.error('Failed to fetch rooms:', err);
			if (err instanceof AxiosError) {
				setError(err.response?.data?.message || 'Gagal memuat data ruangan');
			} else {
				setError('Terjadi kesalahan saat memuat data');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleAddNew = () => {
		setEditingRoom(null);
		setFormData({
			name: '',
			code: '',
			capacity: 10,
			description: '',
			facilities: '',
			status: 'ACTIVE'
		});
		setDialogOpen(true);
	};

	const handleEdit = (room: Room) => {
		setEditingRoom(room);
		setFormData({
			name: room.name,
			code: room.code,
			capacity: room.capacity || 10,
			description: room.description || '',
			facilities: Array.isArray(room.facilities) ? room.facilities.join(', ') : '',
			status: room.status,
		});
		setDialogOpen(true);
	};

	const handleDelete = async (id: number) => {
		if (!confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
			return;
		}

		try {
			await roomService.deleteRoom(id);
			alert('Ruangan berhasil dihapus!');
			await fetchRooms();
		} catch (err) {
			console.error('Failed to delete room:', err);
			if (err instanceof AxiosError) {
				alert(err.response?.data?.message || 'Gagal menghapus ruangan');
			} else {
				alert('Terjadi kesalahan saat menghapus ruangan');
			}
		}
	};

	const handleSubmit = async () => {
		if (!formData.name.trim() || !formData.code.trim() || !formData.facilities.trim()) {
			alert('Nama Ruangan, Kode Ruangan, dan Fasilitas wajib diisi!');
			return;
		}

		try {
			const facilitiesArray = formData.facilities
				.split(',')
				.map(f => f.trim())
				.filter(f => f.length > 0);

			const roomData = {
				name: formData.name,
				code: formData.code,
				capacity: formData.capacity,
				description: formData.description,
				facilities: facilitiesArray,
				status: formData.status,
			};

			if (editingRoom) {
				await roomService.updateRoom(editingRoom.id, roomData);
				alert('Ruangan berhasil diupdate!');
			} else {
				await roomService.createRoom(roomData);
				alert('Ruangan berhasil ditambahkan!');
			}

			setDialogOpen(false);
			await fetchRooms();
		} catch (err) {
			console.error('Failed to save room:', err);
			if (err instanceof AxiosError) {
				alert(err.response?.data?.message || 'Gagal menyimpan ruangan');
			} else {
				alert('Terjadi kesalahan saat menyimpan ruangan');
			}
		}
	};

	const filteredRooms = rooms.filter((room) =>
		room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		room.code.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return (
			<div className='space-y-6 p-6'>
				<div className='text-center'>
					<div className='text-lg font-semibold text-gray-700'>Memuat data...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='space-y-6 p-6'>
				<div className='text-center'>
					<div className='text-lg font-semibold text-red-600 mb-4'>{error}</div>
					<Button onClick={fetchRooms}>Coba Lagi</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>Manajemen Ruang</h1>
				<Button onClick={handleAddNew} className='bg-indigo-600 hover:bg-indigo-700'>
					Tambah Ruang Baru
				</Button>
			</div>

			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<span className='text-sm text-gray-600'>Show</span>
					<select className='border rounded px-2 py-1 text-sm'>
						<option>10</option>
						<option>25</option>
						<option>50</option>
					</select>
					<span className='text-sm text-gray-600'>entries</span>
				</div>
				<Input
					type='text'
					placeholder='Search:'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='max-w-xs'
				/>
			</div>

			<div className='rounded-lg border bg-white shadow-sm'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-12'>No</TableHead>
							<TableHead>Kode</TableHead>
							<TableHead>Nama</TableHead>
							<TableHead>Kapasitas</TableHead>
							<TableHead>Deskripsi</TableHead>
							<TableHead>Fasilitas</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className='text-center'>Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredRooms.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} className='h-24 text-center text-gray-500'>
									Tidak ada data ditemukan
								</TableCell>
							</TableRow>
						) : (
							filteredRooms.map((room, index) => (
								<TableRow key={room.id}>
									<TableCell className='font-medium'>{index + 1}</TableCell>
									<TableCell>{room.code}</TableCell>
									<TableCell>{room.name}</TableCell>
									<TableCell>{room.capacity || '-'}</TableCell>
									<TableCell>{room.description || '-'}</TableCell>
									<TableCell>
										{Array.isArray(room.facilities)
											? room.facilities.join(', ')
											: '-'}
									</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${room.status === 'ACTIVE'
													? 'bg-green-100 text-green-700'
													: room.status === 'MAINTENANCE'
														? 'bg-yellow-100 text-yellow-700'
														: 'bg-red-100 text-red-700'
												}`}
										>
											{room.status}
										</span>
									</TableCell>
									<TableCell>
										<div className='flex items-center justify-center gap-2'>
											<Button
												variant='default'
												size='sm'
												onClick={() => handleEdit(room)}
												className='h-8 w-8 p-0 bg-yellow-500 hover:bg-yellow-600'
											>
												<Pencil className='h-4 w-4' />
											</Button>
											<Button
												variant='destructive'
												size='sm'
												onClick={() => handleDelete(room.id)}
												className='h-8 w-8 p-0'
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className='sm:max-w-[500px]'>
					<DialogHeader>
						<DialogTitle>
							{editingRoom ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
						</DialogTitle>
						<DialogDescription>
							{editingRoom
								? 'Perbarui informasi ruangan di bawah ini'
								: 'Isi informasi ruangan baru di bawah ini'}
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Kode Ruangan</label>
							<Input
								placeholder='A101'
								value={formData.code}
								onChange={(e) => setFormData({ ...formData, code: e.target.value })}
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Nama Ruangan</label>
							<Input
								placeholder='Ruang Kelas A101'
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Kapasitas</label>
							<Input
								type='number'
								min='1'
								value={formData.capacity}
								onChange={(e) =>
									setFormData({ ...formData, capacity: parseInt(e.target.value) || 10 })
								}
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Deskripsi</label>
							<Textarea
								placeholder='Ruang kelas untuk kuliah umum'
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								rows={3}
								className='resize-none'
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Fasilitas (pisahkan dengan koma)</label>
							<Textarea
								placeholder='AC, Proyektor, Whiteboard'
								value={formData.facilities}
								onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
								rows={3}
								className='resize-none'
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Status</label>
							<select
								className='w-full border rounded px-3 py-2'
								value={formData.status}
								onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
							>
								<option value='ACTIVE'>ACTIVE</option>
								<option value='MAINTENANCE'>MAINTENANCE</option>
								<option value='INACTIVE'>INACTIVE</option>
							</select>
						</div>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setDialogOpen(false)}>
							Tutup
						</Button>
						<Button onClick={handleSubmit} className='bg-indigo-600 hover:bg-indigo-700'>
							{editingRoom ? 'Update' : 'Tambah'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
