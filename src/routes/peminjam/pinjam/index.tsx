import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';
import { documentService, type Document } from '@/services/document.service';
import { AxiosError } from 'axios';

export const Route = createFileRoute('/peminjam/pinjam/')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [documents, setDocuments] = useState<Document[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchDocuments();
	}, []);

	const fetchDocuments = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await documentService.getDocuments();
			// Combine my_documents and processed_documents
			const allDocs = [
				...(data.my_documents || []),
				...(data.processed_documents || []),
			];
			setDocuments(allDocs);
		} catch (err) {
			console.error('Failed to fetch documents:', err);
			if (err instanceof AxiosError) {
				setError(err.response?.data?.message || 'Gagal memuat data dokumen');
			} else {
				setError('Terjadi kesalahan saat memuat data');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleAjukanPinjam = () => {
		navigate({ to: '/peminjam/pinjam/detail-tempat' });
	};

	const handleAjukanKembali = (documentId: number) => {
		// Navigate to stepper with existing document data
		navigate({ to: '/peminjam/pinjam/detail-tempat', search: { editId: documentId } as any });
	};

	const getStatusBadge = (status: Document['status']) => {
		const statusConfig: Record<Document['status'], { bg: string; text: string; label: string }> = {
			DRAFT: {
				bg: 'bg-gray-100',
				text: 'text-gray-800',
				label: 'Draft',
			},
			IN_PROGRESS: {
				bg: 'bg-yellow-100',
				text: 'text-yellow-800',
				label: 'Diproses',
			},
			APPROVED: {
				bg: 'bg-green-100',
				text: 'text-green-800',
				label: 'Disetujui',
			},
			REJECTED: {
				bg: 'bg-red-100',
				text: 'text-red-800',
				label: 'Ditolak',
			},
			REVISED: {
				bg: 'bg-orange-100',
				text: 'text-orange-800',
				label: 'Perlu Revisi',
			},
		};
		const config = statusConfig[status];
		return (
			<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
				{config.label}
			</span>
		);
	};

	const getRoomInfo = (doc: Document) => {
		const content = doc.content as any;
		if (content?.room_id) {
			return `Ruang ${content.room_code || content.room_id}`;
		}
		return '-';
	};

	const getBookingDate = (doc: Document) => {
		const content = doc.content as any;
		if (content?.booking_date) {
			return new Date(content.booking_date).toLocaleDateString('id-ID');
		}
		return '-';
	};

	const getCurrentHolder = (doc: Document) => {
		if (doc.status === 'IN_PROGRESS' && doc.currentHolder) {
			return doc.currentHolder.role?.name || doc.currentHolder.name;
		}
		return '-';
	};

	if (loading) {
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
					<Button onClick={fetchDocuments}>Coba Lagi</Button>
				</div>
			</div>
		);
	}

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
						{documents.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className='text-center text-gray-500 py-8'>
									Belum ada pengajuan peminjaman
								</TableCell>
							</TableRow>
						) : (
							documents.map((doc, index) => (
								<TableRow key={doc.id}>
									<TableCell>{index + 1}</TableCell>
									<TableCell className='font-medium'>{doc.title}</TableCell>
									<TableCell>{getBookingDate(doc)}</TableCell>
									<TableCell>{getRoomInfo(doc)}</TableCell>
									<TableCell>{getStatusBadge(doc.status)}</TableCell>
									<TableCell>
										{doc.status === 'IN_PROGRESS' ? (
											<span className='text-sm text-gray-700'>
												{getCurrentHolder(doc)}
											</span>
										) : doc.status === 'REVISED' ? (
											<div className='space-y-2'>
												<p className='text-sm text-gray-700'>
													Perlu revisi - silakan ajukan kembali
												</p>
												<button
													onClick={() => handleAjukanKembali(doc.id)}
													className='text-sm text-blue-600 underline hover:text-blue-800'
												>
													Ajukan Kembali
												</button>
											</div>
										) : doc.status === 'DRAFT' ? (
											<div className='space-y-2'>
												<p className='text-sm text-gray-700'>
													Belum disubmit
												</p>
												<button
													onClick={() => handleAjukanKembali(doc.id)}
													className='text-sm text-blue-600 underline hover:text-blue-800'
												>
													Lanjutkan
												</button>
											</div>
										) : (
											<span className='text-sm text-gray-400'>-</span>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
