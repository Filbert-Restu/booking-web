import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { ApprovalHistory } from '@/features/approvals';
import type { ActorRole } from '@/features/approvals';
import { documentService } from '@/services/document.service';
import { mapDocumentsToApprovalItems, type ApprovalItem } from '@/features/approvals/approval-utils';
import { Button } from '@/shared/components/ui/button/button';

export const Route = createFileRoute('/ketua-ormawa/riwayat-persetujuan')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const actorRole: ActorRole = 'ketua-ormawa';

  useEffect(() => {
    fetchProcessedDocuments();
  }, []);

  const fetchProcessedDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getDocuments();
      const processedDocs = data.processed_documents || [];
      const mappedItems = mapDocumentsToApprovalItems(processedDocs);
      setApprovalItems(mappedItems);
    } catch (err) {
      console.error('Failed to fetch processed documents:', err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Gagal memuat riwayat persetujuan');
      } else {
        setError('Terjadi kesalahan saat memuat data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDoc = (payload: any) => {
    navigate({
      to: '/preview-dokumen',
      search: { doc: payload.doc, id: payload.booking.id, return: '/ketua-ormawa/riwayat-persetujuan' } as any
    });
  };

  if (loading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='text-center'>
          <div className='text-lg font-semibold text-gray-700'>Memuat riwayat...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto py-6'>
        <div className='text-center'>
          <div className='text-lg font-semibold text-red-600 mb-4'>{error}</div>
          <Button onClick={fetchProcessedDocuments}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Riwayat Persetujuan</h1>
        <p className='text-muted-foreground'>
          Daftar peminjaman yang sudah diproses oleh Ketua Ormawa
        </p>
      </div>

      {approvalItems.length === 0 ? (
        <div className='bg-white rounded-lg border border-gray-200 p-8 text-center'>
          <p className='text-gray-500'>Belum ada riwayat persetujuan</p>
        </div>
      ) : (
        <ApprovalHistory
          bookings={approvalItems}
          actorRole={actorRole}
          onOpenDoc={handleOpenDoc}
          showOrganisasi={true}
          showProposal={true}
        />
      )}
    </div>
  );
}
