import type { ApprovalItem } from '@/features/approvals';

interface BaseBooking {
	id: number;
	token: string;
	kegiatanOrmawa: string;
	namaPengaju: string;
	noHp: string;
	ormawa: string;
	ruangan: string;
	tanggal: string;
	waktu: string;
	fileProposal: string;
}

const BASE_DATA: BaseBooking[] = [
	{
		id: 1,
		token: 'TKN-2025-001',
		kegiatanOrmawa: 'Turnamen Futsal Antar Fakultas 2025',
		namaPengaju: 'Ahmad Zaki Rahman',
		noHp: '081234567890',
		ormawa: 'UKM Olahraga',
		ruangan: 'Lapangan Futsal',
		tanggal: '2025-02-15',
		waktu: '08:00 - 17:00',
		fileProposal: 'proposal-futsal-2025.pdf',
	},
	{
		id: 2,
		token: 'TKN-2025-002',
		kegiatanOrmawa: 'Pameran Seni dan Budaya Nusantara',
		namaPengaju: 'Siti Nurhaliza',
		noHp: '082345678901',
		ormawa: 'UKM Seni',
		ruangan: 'Aula Utama',
		tanggal: '2025-02-20',
		waktu: '09:00 - 16:00',
		fileProposal: 'proposal-pameran-seni.pdf',
	},
	{
		id: 3,
		token: 'TKN-2025-003',
		kegiatanOrmawa: 'Konser Musik Akustik Mahasiswa',
		namaPengaju: 'Budi Santoso Wijaya',
		noHp: '083456789012',
		ormawa: 'UKM Musik',
		ruangan: 'Auditorium B101',
		tanggal: '2025-02-25',
		waktu: '18:00 - 21:00',
		fileProposal: 'proposal-konser-akustik.pdf',
	},
	{
		id: 4,
		token: 'TKN-2025-004',
		kegiatanOrmawa: 'Workshop Kepemimpinan dan Organisasi',
		namaPengaju: 'Dewi Kartika',
		noHp: '084567890123',
		ormawa: 'BEM Fakultas',
		ruangan: 'Ruang Seminar A303',
		tanggal: '2025-03-01',
		waktu: '13:00 - 17:00',
		fileProposal: 'proposal-workshop-leadership.pdf',
	},
	{
		id: 5,
		token: 'TKN-2025-005',
		kegiatanOrmawa: 'Bakti Sosial dan Donor Darah',
		namaPengaju: 'Rina Melati',
		noHp: '085678901234',
		ormawa: 'PMI Kampus',
		ruangan: 'Hall Lt. 1',
		tanggal: '2025-03-10',
		waktu: '08:00 - 15:00',
		fileProposal: 'proposal-donor-darah.pdf',
	},
];

export function mapBookingsToApprovalItems(bookings: BaseBooking[]): ApprovalItem[] {
	return bookings.map((booking) => ({
		id: booking.id,
		token: booking.token,
		kegiatanOrmawa: booking.kegiatanOrmawa,
		kegiatan: booking.kegiatanOrmawa,
		noHp: booking.noHp,
		namaPeminjam: booking.namaPengaju,
		organisasiMahasiswa: booking.ormawa,
		namaRuang: booking.ruangan,
		tanggal: booking.tanggal,
		waktu: booking.waktu,
		proposalUrl: booking.fileProposal,
		status: 'waiting' as const,
		tanggalPersetujuan: undefined, // Will be set when approved
	}));
}

export function getMockBookings(): BaseBooking[] {
	return BASE_DATA;
}

export type ApprovalDocType = 'executive-summary' | 'lembar-pengesahan';
export type ApprovalModeType = 'preview' | 'sign';

export const APPROVAL_DOC_OPTIONS: ApprovalDocType[] = ['executive-summary', 'lembar-pengesahan'];
export const APPROVAL_MODE_OPTIONS: ApprovalModeType[] = ['preview', 'sign'];
