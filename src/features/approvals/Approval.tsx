import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';
import { CheckCircle2, XCircle, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';

export type ApprovalStatus = 'waiting' | 'approved' | 'revisi';

export type ActorRole =
	| 'ketua-ormawa'
	| 'ketua-departemen'
	| 'kemahasiswaan'
	| 'senat'
	| 'wadek1'
	| 'dosen-pendamping'
	| 'sumber-daya';

type DocumentType = 'executive-summary' | 'lembar-pengesahan';

export interface DocActionPayload {
	booking: ApprovalItem;
	role: ActorRole;
	doc: DocumentType;
	mode: 'preview' | 'sign';
}

export interface ApprovalItem {
	id: number;
	token?: string;
	kegiatanOrmawa?: string;
	kegiatan: string;
	noHp: string;
	namaPeminjam: string;
	organisasiMahasiswa?: string;
	namaRuang: string;
	tanggal: string;
	waktu: string;
	proposalUrl?: string;
	status: ApprovalStatus;
	tanggalPersetujuan?: string;
	executiveSummarySigned?: boolean;
	lembarPengesahanSigned?: boolean;
	revisiNotes?: string;
}

interface ApprovalProps {
	bookings: ApprovalItem[];
	onApprove?: (id: number) => void;
	onRevise?: (id: number) => void;
	showOrganisasi?: boolean;
	actorRole: ActorRole;
	onOpenDoc?: (documentId: number) => void;
}

function statusBadge(status: ApprovalStatus) {
	const base =
		'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide';
	if (status === 'approved') {
		return `${base} bg-green-100 text-green-700`;
	}
	if (status === 'revisi') {
		return `${base} bg-yellow-100 text-yellow-700`;
	}
	return `${base} bg-blue-100 text-blue-700`;
}

export function Approval({
	bookings,
	onApprove,
	onRevise,
	showOrganisasi = true,
	actorRole,
	onOpenDoc,
}: ApprovalProps) {
	const [items, setItems] = useState<ApprovalItem[]>(bookings);
	const [searchTerm, setSearchTerm] = useState('');
	const [revisiDialogOpen, setRevisiDialogOpen] = useState(false);
	const [revisiNotes, setRevisiNotes] = useState('');
	const [currentRevisiId, setCurrentRevisiId] = useState<number | null>(null);
	const isKemahasiswaan = actorRole === 'kemahasiswaan';
	const totalColumns = useMemo(() => {
		const optionalColumns =
			(showOrganisasi ? 1 : 0) +
			(isKemahasiswaan ? 1 : 0);
		// Changed from 10 to 7 after consolidating all document columns into one
		return 7 + optionalColumns;
	}, [isKemahasiswaan, showOrganisasi]);

	const handleApproveLocal = (id: number) => {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item)),
		);
		onApprove?.(id);
	};

	const handleRejectLocal = (id: number, notes: string) => {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, status: 'revisi', revisiNotes: notes } : item)),
		);
		onRevise?.(id);
	};

	const handleActionSelect = (id: number, value: ApprovalStatus) => {
		if (value === 'approved') {
			handleApproveLocal(id);
			return;
		}
		if (value === 'revisi') {
			// Open dialog untuk catatan revisi
			setCurrentRevisiId(id);
			setRevisiNotes('');
			setRevisiDialogOpen(true);
		}
	};

	const handleSubmitRevisi = () => {
		if (currentRevisiId !== null && revisiNotes.trim()) {
			handleRejectLocal(currentRevisiId, revisiNotes);
			setRevisiDialogOpen(false);
			setCurrentRevisiId(null);
			setRevisiNotes('');
		}
	};

	const filteredItems = items.filter(
		(item) =>
			item.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.namaPeminjam.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.namaRuang.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(item.organisasiMahasiswa &&
				item.organisasiMahasiswa.toLowerCase().includes(searchTerm.toLowerCase())),
	);

	return (
		<div className='w-full space-y-6 p-6'>
			<div className='relative max-w-md'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
				<Input
					type='text'
					placeholder='Cari kegiatan, peminjam, atau ruang...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='pl-10'
				/>
			</div>

			<div className='rounded-lg border bg-white shadow-sm'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-12'>No</TableHead>
							<TableHead>Token</TableHead>
							<TableHead>Kegiatan</TableHead>
							<TableHead>No. HP</TableHead>
							<TableHead>Nama Peminjam</TableHead>
							{showOrganisasi && <TableHead>Organisasi</TableHead>}
							<TableHead>Ruang</TableHead>
							<TableHead>Tanggal</TableHead>
							<TableHead>Waktu</TableHead>
							<TableHead className='text-center'>Dokumen</TableHead>
							{isKemahasiswaan && <TableHead className='text-center'>Aksi</TableHead>}
							{!isKemahasiswaan && <TableHead className='text-center'>Status</TableHead>}
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredItems.length === 0 ? (
							<TableRow>
								<TableCell colSpan={totalColumns} className='h-24 text-center text-gray-500'>
									Tidak ada data ditemukan
								</TableCell>
							</TableRow>
						) : (
							filteredItems.map((item, index) => (
								<TableRow key={item.id}>
									<TableCell className='font-medium'>{index + 1}</TableCell>
									<TableCell>{item.token || '-'}</TableCell>
									<TableCell>{item.kegiatan}</TableCell>
									<TableCell>{item.noHp}</TableCell>
									<TableCell>{item.namaPeminjam}</TableCell>
									{showOrganisasi && <TableCell>{item.organisasiMahasiswa || '-'}</TableCell>}
									<TableCell>{item.namaRuang}</TableCell>
									<TableCell>{item.tanggal}</TableCell>
									<TableCell>{item.waktu}</TableCell>
									<TableCell className='text-center'>
										<button
											onClick={() => onOpenDoc?.(item.id)}
											className='text-blue-600 hover:text-blue-800 underline font-medium'
										>
											Lihat Dokumen
										</button>
									</TableCell>
									{isKemahasiswaan && (
										<TableCell>
											<div className='flex items-center justify-center'>
												{item.status === 'waiting' ? (
													<Select onValueChange={(value) => handleActionSelect(item.id, value as ApprovalStatus)}>
														<SelectTrigger className='min-w-[140px] justify-center rounded-full data-[placeholder]:text-center'>
															<SelectValue placeholder='Aksi' />
														</SelectTrigger>
														<SelectContent className='rounded-lg'>
															<SelectItem value='approved'>
																<CheckCircle2 className='h-3.5 w-3.5 text-green-600' />
																<span>Setuju</span>
															</SelectItem>
															<SelectItem value='revisi'>
																<XCircle className='h-3.5 w-3.5 text-yellow-600' />
																<span>Revisi</span>
															</SelectItem>
														</SelectContent>
													</Select>
												) : (
													<span className={statusBadge(item.status)}>{item.status.toUpperCase()}</span>
												)}
											</div>
										</TableCell>
									)}
									{!isKemahasiswaan && (
										<TableCell>
											<div className='flex items-center justify-center'>
												{item.status === 'waiting' ? (
													<Select onValueChange={(value) => handleActionSelect(item.id, value as ApprovalStatus)}>
														<SelectTrigger className='min-w-[140px] justify-center rounded-full data-[placeholder]:text-center'>
															<SelectValue placeholder='Aksi' />
														</SelectTrigger>
														<SelectContent className='rounded-lg'>
															<SelectItem value='approved'>
																<CheckCircle2 className='h-3.5 w-3.5 text-green-600' />
																<span>Setuju</span>
															</SelectItem>
															<SelectItem value='revisi'>
																<XCircle className='h-3.5 w-3.5 text-yellow-600' />
																<span>Revisi</span>
															</SelectItem>
														</SelectContent>
													</Select>
												) : (
													<span className={statusBadge(item.status)}>{item.status.toUpperCase()}</span>
												)}
											</div>
										</TableCell>
									)}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<Dialog open={revisiDialogOpen} onOpenChange={setRevisiDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Catatan Revisi</DialogTitle>
						<DialogDescription>
							Masukkan catatan revisi untuk pengajuan ini. Catatan akan dikirim ke peminjam.
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<Textarea
							placeholder='Tuliskan catatan revisi di sini...'
							value={revisiNotes}
							onChange={(e) => setRevisiNotes(e.target.value)}
							rows={5}
							className='resize-none'
						/>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setRevisiDialogOpen(false)}
						>
							Batal
						</Button>
						<Button
							onClick={handleSubmitRevisi}
							disabled={!revisiNotes.trim()}
						>
							Kirim Revisi
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
