import type { ApprovalItem } from '@/features/approvals';

interface BaseBooking {
	id: number;
	token: string;
	namaPengaju: string;
	ormawa: string;
	ruangan: string;
	tanggal: string;
	waktu: string;
	fileProposal: string;
}

const BASE_DATA: BaseBooking[] = [
	{
		id: 1,
		token: '47e11d6a',
		namaPengaju: 'Ahmad Zaki',
		ormawa: 'UKM Olahraga',
		ruangan: 'B101',
		tanggal: '2025-12-20',
		waktu: '11:30:00 - 13:30:00',
		fileProposal: 'file-560205B01.pdf',
	},
	{
		id: 2,
		token: '33f00ec5',
		namaPengaju: 'Siti Nurhaliza',
		ormawa: 'UKM Seni',
		ruangan: 'A303',
		tanggal: '2025-12-20',
		waktu: '12:00:00 - 13:00:00',
		fileProposal: 'file-313125991.pdf',
	},
	{
		id: 3,
		token: 'd7b9fec6',
		namaPengaju: 'Budi Santoso',
		ormawa: 'UKM Musik',
		ruangan: 'B101',
		tanggal: '2025-12-21',
		waktu: '09:00:00 - 11:00:00',
		fileProposal: 'file-396352416.pdf',
	},
];

export function mapBookingsToApprovalItems(bookings: BaseBooking[]): ApprovalItem[] {
	return bookings.map((booking) => ({
		id: booking.id,
		kegiatan: booking.token,
		noHp: '',
		namaPeminjam: booking.namaPengaju,
		organisasiMahasiswa: booking.ormawa,
		namaRuang: booking.ruangan,
		tanggal: booking.tanggal,
		waktu: booking.waktu,
		proposalUrl: booking.fileProposal,
		status: 'waiting' as const,
	}));
}

export function getMockBookings(): BaseBooking[] {
	return BASE_DATA;
}

export type ApprovalDocType = 'executive-summary' | 'lembar-pengesahan';
export type ApprovalModeType = 'preview' | 'sign';

export const APPROVAL_DOC_OPTIONS: ApprovalDocType[] = ['executive-summary', 'lembar-pengesahan'];
export const APPROVAL_MODE_OPTIONS: ApprovalModeType[] = ['preview', 'sign'];
