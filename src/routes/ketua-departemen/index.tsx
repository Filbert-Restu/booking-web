import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { AxiosError } from 'axios';
import { StatCard } from '@/shared/components/common/StatCard';
import { Approval } from '@/features/approvals';
import type { ActorRole } from '@/features/approvals';
import { documentService } from '@/services/document.service';
import { mapDocumentsToApprovalItems, type ApprovalItem } from '@/features/approvals/approval-utils';
import { Button } from '@/shared/components/ui/button/button';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { RevisionDialog } from '@/shared/components/common/RevisionDialog';

export const Route = createFileRoute('/ketua-departemen/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const actorRole: ActorRole = 'ketua-departemen';

  // Dialog States
  const [dialogState, setDialogState] = useState<{
    type: 'approve' | 'revise' | null;
    id: number | null;
  }>({ type: null, id: null });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getDocuments();
      const pendingDocs = data.pending_documents || [];
      const mappedItems = mapDocumentsToApprovalItems(pendingDocs);
      setApprovalItems(mappedItems);
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

  const tableRef = useRef<HTMLDivElement>(null);

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const uniqueSubmittersCount = useMemo(() => {
    const submitters = new Set(approvalItems.map((item) => item.namaPeminjam));
    return submitters.size;
  }, [approvalItems]);

  const stats = useMemo(() => [
    {
      title: 'Antrean Approval',
      value: String(approvalItems.filter((b) => b.status === 'waiting').length),
      icon: Clock,
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
      onClick: scrollToTable,
    },
    {
      title: 'Total Pengaju',
      value: String(uniqueSubmittersCount),
      icon: Users,
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      onClick: scrollToTable,
    },
    {
      title: 'Total Diapprove',
      value: String(approvalItems.filter((b) => b.status === 'approved').length),
      icon: CheckCircle,
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
      onClick: () => navigate({ to: '/ketua-departemen/riwayat-persetujuan' }),
    },
  ], [approvalItems, uniqueSubmittersCount, navigate]);

  const handleApprove = useCallback((id: number) => {
    setDialogState({ type: 'approve', id });
  }, []);

  const onConfirmApprove = useCallback(() => {
    if (dialogState.id) {
      navigate({
        to: '/ketua-departemen/sign-document',
        search: {
          documentId: dialogState.id,
        },
      });
    }
    setDialogState({ type: null, id: null });
  }, [dialogState.id, navigate]);

  const handleRevise = useCallback((id: number) => {
    setDialogState({ type: 'revise', id });
  }, []);

  const onConfirmRevise = useCallback(async (note: string) => {
    if (!dialogState.id) return;

    try {
      const id = dialogState.id;
      const doc = await documentService.getDocument(id);
      await documentService.reviseDocument(id, doc.creator_id, note);
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to revise document:', err);
    } finally {
      setDialogState({ type: null, id: null });
    }
  }, [dialogState.id]);

  const handleOpenDoc = useCallback((documentId: number) => {
    navigate({
      to: '/ketua-departemen/sign-document',
      search: { documentId }
    });
  }, [navigate]);

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
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Dashboard Ketua Departemen
        </h1>
        <p className='text-gray-600 mt-1'>
          Review dan persetujuan peminjaman ruang oleh Ketua Departemen
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            textColor={stat.textColor}
            bgLight={stat.bgLight}
            onClick={stat.onClick}
          />
        ))}
      </div>

      <div className='mt-6' ref={tableRef}>
        <h2 className='text-lg font-semibold mb-4'>Persetujuan Peminjaman</h2>
        {approvalItems.length === 0 ? (
          <div className='bg-white rounded-lg border border-gray-200 p-8 text-center'>
            <p className='text-gray-500'>Tidak ada dokumen yang menunggu persetujuan</p>
          </div>
        ) : (
          <Approval
            bookings={approvalItems}
            onApprove={handleApprove}
            onRevise={handleRevise}
            actorRole={actorRole}
            onOpenDoc={handleOpenDoc}
            showOrganisasi={true}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={dialogState.type === 'approve'}
        onClose={() => setDialogState({ type: null, id: null })}
        onConfirm={onConfirmApprove}
        title='✍️ Membubuhkan Tanda Tangan'
        description='Untuk menyetujui dokumen ini, Anda perlu membubuhkan tanda tangan digital. Anda akan diarahkan ke halaman tanda tangan.'
        confirmLabel='Lanjutkan'
      />

      <RevisionDialog
        isOpen={dialogState.type === 'revise'}
        onClose={() => setDialogState({ type: null, id: null })}
        onConfirm={onConfirmRevise}
      />
    </>
  );
}
