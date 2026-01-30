import { type Document } from '@/services/document.service';
import type { ApprovalItem } from '@/features/approvals/Approval';

// Re-export ApprovalItem for convenience
export type { ApprovalItem };

/**
 * Map Document from backend to ApprovalItem for frontend
 */
export function mapDocumentToApprovalItem(doc: Document): ApprovalItem {
    const content = doc.content as any;

    // Format date from ISO to DD/MM/YYYY
    const formatDate = (isoDate: string) => {
        if (!isoDate) return '-';
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Format time from HH:MM:SS to HH:MM
    const formatTime = (time: string) => {
        if (!time) return '-';
        return time.substring(0, 5);
    };

    // Helper to get absolute file URL
    const getFileUrl = (path: string | undefined) => {
        if (!path) return undefined;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const host = baseUrl.replace('/api', '');
        // Ensure path starts with /
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${host}${normalizedPath}`;
    };

    return {
        id: doc.id,
        token: `DOC-${doc.id}`,
        kegiatanOrmawa: content?.event_type || '-',
        kegiatan: content?.event_name || content?.purpose || doc.title,
        noHp: content?.ketua_pelaksana_hp || content?.phone_number || content?.contact || '-',
        namaPeminjam: content?.ketua_pelaksana_nama || content?.name || 'Unknown',
        organisasiMahasiswa: doc.unit?.name || content?.organization || '-',
        namaRuang: content?.room_name || content?.room_code || '-',
        tanggal: formatDate(content?.booking_date || content?.start_date),
        waktu: content?.start_time && content?.end_time
            ? `${formatTime(content.start_time)} - ${formatTime(content.end_time)}`
            : '-',
        proposalUrl: getFileUrl(doc.file_proposal || doc.attachment_path),
        status: mapDocumentStatus(doc.status),
        tanggalPersetujuan: doc.completed_at ? formatDate(doc.completed_at) : undefined,
        executiveSummarySigned: doc.status === 'APPROVED',
        lembarPengesahanSigned: doc.status === 'APPROVED',
        revisiNotes: undefined,
    };
}

/**
 * Map Document status to ApprovalItem status
 */
export function mapDocumentStatus(status: Document['status']): ApprovalItem['status'] {
    switch (status) {
        case 'IN_PROGRESS':
            return 'waiting';
        case 'APPROVED':
            return 'approved';
        case 'REJECTED':
            return 'approved'; // Map rejected to approved for display (will show in history)
        case 'REVISED':
            return 'revisi';
        case 'DRAFT':
            return 'waiting';
        default:
            return 'waiting';
    }
}

/**
 * Map array of Documents to ApprovalItems
 */
export function mapDocumentsToApprovalItems(docs: Document[]): ApprovalItem[] {
    return docs.map(mapDocumentToApprovalItem);
}
