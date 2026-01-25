import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
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

export const Route = createFileRoute('/sumber-daya/manajemen-ruang')({
	component: RouteComponent,
});

interface Room {
	id: number;
	nama: string;
	kuota: number;
	penunjukan: string;
	status: 'Available' | 'Disable';
	fasilitas: string;
	fotoUrl?: string;
}

function RouteComponent() {
	const [rooms, setRooms] = useState<Room[]>([
		{ id: 1, nama: 'A102', kuota: 60, penunjukan: 'ruang kelas', status: 'Available', fasilitas: 'AC, Proyektor, Whiteboard' },
		{ id: 2, nama: 'A101', kuota: 60, penunjukan: 'ruang kelas', status: 'Disable', fasilitas: 'AC, Proyektor' },
		{ id: 3, nama: 'A103', kuota: 60, penunjukan: 'ruang kelas', status: 'Available', fasilitas: 'AC, Whiteboard' },
		{ id: 4, nama: 'A104', kuota: 60, penunjukan: 'ruang kelas', status: 'Disable', fasilitas: 'Proyektor, Whiteboard' },
		{ id: 5, nama: 'A105', kuota: 60, penunjukan: 'ruang kelas', status: 'Available', fasilitas: 'AC, Proyektor, Sound System' },
	]);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingRoom, setEditingRoom] = useState<Room | null>(null);
	const [formData, setFormData] = useState({
		nama: '',
		kuota: 10,
		catatan: '',
		fasilitas: '',
		foto: null as File | null,
	});

	const [searchTerm, setSearchTerm] = useState('');

	const handleAddNew = () => {
		setEditingRoom(null);
		setFormData({ nama: '', kuota: 10, catatan: '', fasilitas: '', foto: null });
		setDialogOpen(true);
	};

	const handleEdit = (room: Room) => {
		setEditingRoom(room);
		setFormData({
			nama: room.nama,
			kuota: room.kuota,
			catatan: room.penunjukan,
			fasilitas: room.fasilitas,
			foto: null,
		});
		setDialogOpen(true);
	};

	const handleDelete = (id: number) => {
		if (confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
			setRooms((prev) => prev.filter((room) => room.id !== id));
		}
	};

	const handleSubmit = () => {
		if (!formData.nama.trim() || !formData.catatan.trim() || !formData.fasilitas.trim()) {
			alert('Nama Ruangan, Catatan, dan Fasilitas wajib diisi!');
			return;
		}

		if (editingRoom) {
			// Update existing room
			setRooms((prev) =>
				prev.map((room) =>
					room.id === editingRoom.id
						? {
								...room,
								nama: formData.nama,
								kuota: formData.kuota,
								penunjukan: formData.catatan,
								fasilitas: formData.fasilitas,
						  }
						: room,
				),
			);
		} else {
			// Add new room
			const newRoom: Room = {
				id: Math.max(...rooms.map((r) => r.id), 0) + 1,
				nama: formData.nama,
				kuota: formData.kuota,
				penunjukan: formData.catatan,
				status: 'Available',
				fasilitas: formData.fasilitas,
			};
			setRooms((prev) => [...prev, newRoom]);
		}

		setDialogOpen(false);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFormData({ ...formData, foto: e.target.files[0] });
		}
	};

	const filteredRooms = rooms.filter((room) =>
		room.nama.toLowerCase().includes(searchTerm.toLowerCase()),
	);

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
							<TableHead>Nama</TableHead>
							<TableHead>Kuota</TableHead>
							<TableHead>Penunjukan</TableHead>
							<TableHead>Fasilitas</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className='text-center'>Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredRooms.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className='h-24 text-center text-gray-500'>
									Tidak ada data ditemukan
								</TableCell>
							</TableRow>
						) : (
							filteredRooms.map((room, index) => (
								<TableRow key={room.id}>
									<TableCell className='font-medium'>{index + 1}</TableCell>
									<TableCell>{room.nama}</TableCell>
									<TableCell>{room.kuota}</TableCell>
									<TableCell>{room.penunjukan}</TableCell>
									<TableCell>{room.fasilitas}</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
												room.status === 'Available'
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
							<label className='text-sm font-medium text-gray-700'>Nama Ruangan</label>
							<Input
								placeholder='B101'
								value={formData.nama}
								onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Kuota Ruangan</label>
							<Input
								type='number'
								min='1'
								value={formData.kuota}
								onChange={(e) =>
									setFormData({ ...formData, kuota: parseInt(e.target.value) || 10 })
								}
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Catatan</label>
							<Textarea
								placeholder='ruang kelas'
								value={formData.catatan}
								onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
								rows={3}
								className='resize-none'
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Fasilitas</label>
							<Textarea
								placeholder='AC, Proyektor, Whiteboard'
								value={formData.fasilitas}
								onChange={(e) => setFormData({ ...formData, fasilitas: e.target.value })}
								rows={3}
								className='resize-none'
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>Foto Ruangan</label>
							<Input type='file' accept='image/*' onChange={handleFileChange} />
							{formData.foto && (
								<p className='text-sm text-gray-500'>{formData.foto.name}</p>
							)}
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
