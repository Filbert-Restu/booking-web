import { type Document } from '@/services/document.service';
import type { ApprovalItem } from '@/features/approvals/Approval';

// Re-export ApprovalItem for convenience
export type { ApprovalItem };

/**
 * Map Document from backend to ApprovalItem for frontend
 */
export function mapDocumentToApprovalItem(doc: Document): ApprovalItem {
  const content = doc.content ?? {}; // Use default empty object if content is undefined

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
  // Build keterangan from logs
  const actionLabels: Record<string, string> = {
    APPROVED: 'Disetujui',
    RETURNED: 'Revisi',
    REVISION: 'Revisi',
    REJECTED: 'Ditolak',
  };
  const relevantLog = (doc.logs ?? [])
    .filter((l) => ['APPROVED', 'RETURNED', 'REVISION', 'REJECTED'].includes(l.action as string))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  [0];
  const keterangan = relevantLog
    ? `${actionLabels[relevantLog.action as string] ?? relevantLog.action} oleh ${relevantLog.user?.role?.name ?? relevantLog.user?.name ?? '-'}`
    : '-';

  return {
    id: doc.id,
    token: `DOC-${doc.id}`,
    kegiatanOrmawa: String(content?.event_type || '-') || '-',
    kegiatan:
      String(content?.event_name || content?.purpose || doc.title) || '-',
    noHp: String(content?.ketua_pelaksana_hp || '-'),
    namaPeminjam: String(
      content?.ketua_pelaksana_nama || doc.creator?.name || '-',
    ),
    organisasiMahasiswa: String(doc.unit?.name || '-'),
    namaRuang: String(content?.room_name || '-'),
    tanggal: formatDate(String(content?.booking_date) || ''),
    waktu:
      content?.start_time && content?.end_time
        ? `${formatTime(String(content.start_time))} - ${formatTime(String(content.end_time))}`
        : '-',
    proposalUrl: doc.id ? `/documents/${doc.id}/file/proposal/pdf` : undefined,
    status: mapDocumentStatus(doc.status),
    tanggalPersetujuan: doc.completed_at
      ? formatDate(doc.completed_at)
      : undefined,
    executiveSummarySigned: doc.status === 'APPROVED',
    lembarPengesahanSigned: doc.status === 'APPROVED',
    revisiNotes: undefined,
    hasProposal: !!doc.file_proposal,
    hasExecutiveSummary: !!doc.file_executive_summary,
    hasApprovalSheet: !!doc.file_approval_sheet,
    tanggalMasuk: relevantLog ? formatDate(relevantLog.created_at) : formatDate(doc.updated_at || doc.created_at),
    keterangan,
  };
}

/**
 * Map Document status to ApprovalItem status
 */
export function mapDocumentStatus(
  status: Document['status'],
): ApprovalItem['status'] {
  switch (status) {
    case 'IN_PROGRESS':
      return 'waiting';
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'REVISION':
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
export const mapDocumentsToApprovalItems = (
  documents: Document[],
): ApprovalItem[] => {

  return documents.map((doc) => mapDocumentToApprovalItem(doc));
};
