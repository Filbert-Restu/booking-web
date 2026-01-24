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

export type ApprovalStatus = 'waiting' | 'approved' | 'rejected';

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
	kegiatan: string;
	noHp: string;
	namaPeminjam: string;
	organisasiMahasiswa?: string;
	namaRuang: string;
	tanggal: string;
	waktu: string;
	proposalUrl?: string;
	status: ApprovalStatus;
}

interface ApprovalProps {
	bookings: ApprovalItem[];
	onApprove?: (id: number) => void;
	onRevise?: (id: number) => void;
	showOrganisasi?: boolean;
	showProposal?: boolean;
	actorRole: ActorRole;
	onOpenDoc?: (payload: DocActionPayload) => void;
}

function statusBadge(status: ApprovalStatus) {
	const base =
		'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide';
	if (status === 'approved') {
		return `${base} bg-green-100 text-green-700`;
	}
	if (status === 'rejected') {
		return `${base} bg-red-100 text-red-700`;
	}
	return `${base} bg-yellow-100 text-yellow-700`;
}

export function Approval({
	bookings,
	onApprove,
	onRevise,
	showOrganisasi = true,
	showProposal = true,
	actorRole,
	onOpenDoc,
}: ApprovalProps) {
	const [items, setItems] = useState<ApprovalItem[]>(bookings);
	const [searchTerm, setSearchTerm] = useState('');
	const isKemahasiswaan = actorRole === 'kemahasiswaan';
	const canSignExecutiveSummary = actorRole === 'wadek1';
	const canSignLembarPengesahan = actorRole !== 'kemahasiswaan';
	const totalColumns = useMemo(() => {
		const optionalColumns =
			(showOrganisasi ? 1 : 0) +
			(showProposal ? 1 : 0) +
			(isKemahasiswaan ? 1 : 0);
		return 10 + optionalColumns;
	}, [isKemahasiswaan, showOrganisasi, showProposal]);

	const handleApproveLocal = (id: number) => {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item)),
		);
		onApprove?.(id);
	};

	const handleRejectLocal = (id: number) => {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item)),
		);
		onRevise?.(id);
	};

	const handleActionSelect = (id: number, value: ApprovalStatus) => {
		if (value === 'approved') {
			handleApproveLocal(id);
			return;
		}
		if (value === 'rejected') {
			handleRejectLocal(id);
		}
	};

	const handleDocumentPreview = (booking: ApprovalItem, doc: DocumentType) => {
		onOpenDoc?.({ booking, doc, role: actorRole, mode: 'preview' });
	};

	const handleDocumentSign = (booking: ApprovalItem, doc: DocumentType) => {
		if (doc === 'executive-summary' && !canSignExecutiveSummary) {
			return;
		}
		if (doc === 'lembar-pengesahan' && !canSignLembarPengesahan) {
			return;
		}
		onOpenDoc?.({ booking, doc, role: actorRole, mode: 'sign' });
		if (!isKemahasiswaan) {
			handleApproveLocal(booking.id);
		}
	};

	const renderDocActions = (
		item: ApprovalItem,
		docType: DocumentType,
		canSign: boolean,
	) => (
		<div className='flex items-center justify-center gap-2'>
			<Button
				variant='outline'
				size='sm'
				onClick={() => handleDocumentPreview(item, docType)}
				className='h-8'
			>
				Preview
			</Button>
			{canSign && (
				<Button
					variant='default'
					size='sm'
					onClick={() => handleDocumentSign(item, docType)}
					className='h-8'
				>
					Tanda Tangan
				</Button>
			)}
		</div>
	);

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
							<TableHead>Kegiatan</TableHead>
							<TableHead>No. HP</TableHead>
							<TableHead>Nama Peminjam</TableHead>
							{showOrganisasi && <TableHead>Organisasi</TableHead>}
							<TableHead>Ruang</TableHead>
							<TableHead>Tanggal</TableHead>
							<TableHead>Waktu</TableHead>
							{showProposal && <TableHead>Proposal</TableHead>}
							<TableHead className='text-center'>Executive Summary</TableHead>
							<TableHead className='text-center'>Lembar Pengesahan</TableHead>
							{isKemahasiswaan && <TableHead className='text-center'>Approve</TableHead>}
							<TableHead className='text-center'>Aksi</TableHead>
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
									<TableCell>{item.kegiatan}</TableCell>
									<TableCell>{item.noHp}</TableCell>
									<TableCell>{item.namaPeminjam}</TableCell>
									{showOrganisasi && <TableCell>{item.organisasiMahasiswa || '-'}</TableCell>}
									<TableCell>{item.namaRuang}</TableCell>
									<TableCell>{item.tanggal}</TableCell>
									<TableCell>{item.waktu}</TableCell>
									{showProposal && (
										<TableCell>
											{item.proposalUrl ? (
												<a
													href={item.proposalUrl}
													target='_blank'
													rel='noopener noreferrer'
													className='text-blue-600 underline'
												>
													Lihat PDF
												</a>
											) : (
												'-'
											)}
										</TableCell>
									)}
									<TableCell>
										{renderDocActions(item, 'executive-summary', canSignExecutiveSummary)}
									</TableCell>
									<TableCell>
										{renderDocActions(item, 'lembar-pengesahan', canSignLembarPengesahan)}
									</TableCell>
									{isKemahasiswaan && (
										<TableCell>
											<div className='flex items-center justify-center gap-2'>
												<Button
													variant='default'
													size='sm'
													onClick={() => handleApproveLocal(item.id)}
													className='h-8 gap-1 bg-green-600 hover:bg-green-700'
												>
													<CheckCircle2 className='h-3.5 w-3.5' />
													<span className='sr-only sm:not-sr-only'>Approve</span>
												</Button>
												<Button
													variant='destructive'
													size='sm'
													onClick={() => handleRejectLocal(item.id)}
													className='h-8 gap-1'
												>
													<XCircle className='h-3.5 w-3.5' />
													<span className='sr-only sm:not-sr-only'>Revisi</span>
												</Button>
											</div>
										</TableCell>
									)}
									<TableCell>
										<div className='flex items-center justify-center'>
											{item.status === 'waiting' && !isKemahasiswaan ? (
												<Select onValueChange={(value) => handleActionSelect(item.id, value as ApprovalStatus)}>
													<SelectTrigger className='min-w-[140px] justify-center rounded-full data-[placeholder]:text-center'>
														<SelectValue placeholder='Aksi' />
													</SelectTrigger>
													<SelectContent className='rounded-lg'>
														<SelectItem value='approved'>
															<CheckCircle2 className='h-3.5 w-3.5 text-green-600' />
															<span>Setuju</span>
														</SelectItem>
														<SelectItem value='rejected'>
															<XCircle className='h-3.5 w-3.5 text-red-600' />
															<span>Revisi</span>
														</SelectItem>
													</SelectContent>
												</Select>
											) : (
												<span className={statusBadge(item.status)}>{item.status.toUpperCase()}</span>
											)}
										</div>
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
