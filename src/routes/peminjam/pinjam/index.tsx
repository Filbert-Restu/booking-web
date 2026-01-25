import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/shared/components/ui/button/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';

export const Route = createFileRoute('/peminjam/pinjam/')({
	component: RouteComponent,
});

// Dummy data untuk history pengajuan
const submissionHistory = [
	{
		id: 1,
		namaKegiatan: 'Seminar Nasional Teknologi',
		tanggal: '2026-02-15',
		ruang: 'Auditorium Utama',
		status: 'diproses' as const,
		keterangan: 'Ketua Prodi',
	},
	{
		id: 2,
		namaKegiatan: 'Workshop AI & Machine Learning',
		tanggal: '2026-02-10',
		ruang: 'Lab Komputer 1',
		status: 'revisi' as const,
		revisiNotes: 'Mohon lengkapi proposal dengan detail anggaran dan susunan acara',
	},
	{
		id: 3,
		namaKegiatan: 'Rapat Koordinasi BEM',
		tanggal: '2026-01-20',
		ruang: 'Ruang Rapat 2',
		status: 'selesai' as const,
	},
	{
		id: 4,
		namaKegiatan: 'Kuliah Tamu Industri',
		tanggal: '2026-01-15',
		ruang: 'Auditorium Utama',
		status: 'ditolak' as const,
	},
	{
		id: 5,
		namaKegiatan: 'Pelatihan Leadership',
		tanggal: '2026-02-20',
		ruang: 'Aula Lantai 3',
		status: 'diproses' as const,
		keterangan: 'Senat Mahasiswa',
	},
];

function RouteComponent() {
	const navigate = useNavigate();

	const handleAjukanPinjam = () => {
		navigate({ to: '/peminjam/pinjam/detail-tempat' });
	};

	const handleAjukanKembali = (id: number) => {
		// Navigate to stepper with existing data
		navigate({ to: '/peminjam/pinjam/detail-tempat', search: { editId: id } as any });
	};

	const getStatusBadge = (status: 'diproses' | 'selesai' | 'ditolak' | 'revisi') => {
		switch (status) {
			case 'diproses':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
						Diproses
					</span>
				);
			case 'selesai':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
						Selesai
					</span>
				);
			case 'ditolak':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
						Ditolak
					</span>
				);
			case 'revisi':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
						Perlu Revisi
					</span>
				);
		}
	};

	return (
		<div className='space-y-6'>
			{/* Header dengan Button */}
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-gray-900'>Peminjaman Ruang</h1>
				<Button onClick={handleAjukanPinjam} size='lg'>
					Ajukan Pinjam
				</Button>
			</div>

			{/* Tabel History Pengajuan */}
			<div className='bg-white rounded-lg shadow-sm border border-gray-200'>
				<div className='px-6 py-4 border-b border-gray-200'>
					<h2 className='text-lg font-semibold text-gray-900'>
						History Pengajuan
					</h2>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>No</TableHead>
							<TableHead>Nama Kegiatan</TableHead>
							<TableHead>Tanggal</TableHead>
							<TableHead>Ruang</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Keterangan</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{submissionHistory.map((item, index) => (
							<TableRow key={item.id}>
								<TableCell>{index + 1}</TableCell>
								<TableCell className='font-medium'>
									{item.namaKegiatan}
								</TableCell>
								<TableCell>{item.tanggal}</TableCell>
								<TableCell>{item.ruang}</TableCell>
								<TableCell>{getStatusBadge(item.status)}</TableCell>
								<TableCell>
									{item.status === 'diproses' ? (
										<span className='text-sm text-gray-700'>
											{item.keterangan}
										</span>
									) : item.status === 'revisi' ? (
										<div className='space-y-2'>
											<p className='text-sm text-gray-700'>
												{(item as any).revisiNotes}
											</p>
											<button
												onClick={() => handleAjukanKembali(item.id)}
												className='text-sm text-blue-600 underline hover:text-blue-800'
											>
												Ajukan Kembali
											</button>
										</div>
									) : (
										<span className='text-sm text-gray-400'>-</span>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
