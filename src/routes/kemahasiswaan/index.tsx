import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Clock, Users, CheckCircle, FileText } from 'lucide-react';
import { AxiosError } from 'axios';
import { StatCard } from '@/shared/components/common/StatCard';
import { Approval } from '@/features/approvals';
import type { ActorRole } from '@/features/approvals';
import { documentService } from '@/services/document.service';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { RevisionDialog } from '@/shared/components/common/RevisionDialog';
import {
  mapDocumentsToApprovalItems,
  type ApprovalItem,
} from '@/features/approvals/approval-utils';
import { Button } from '@/shared/components/ui/button/button';
import { documentTemplateService } from '@/services/document-template.service';

export const Route = createFileRoute('/kemahasiswaan/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [templateCount, setTemplateCount] = useState(0);
  const [uniqueSubmittersCount, setUniqueSubmittersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const actorRole: ActorRole = 'kemahasiswaan';
  const tableRef = useRef<HTMLDivElement>(null);

  // Dialog States
  const [dialogState, setDialogState] = useState<{
    type: 'approve' | 'revise' | null;
    id: number | null;
  }>({ type: null, id: null });

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getDocuments();
      const pendingDocs = data.pending_documents || [];
      const mappedItems = mapDocumentsToApprovalItems(pendingDocs);
      setApprovalItems(mappedItems);

      const submitterIds = new Set(pendingDocs.map((doc: any) => doc.creator_id));
      setUniqueSubmittersCount(submitterIds.size);

      const templates = await documentTemplateService.getTemplates();
      setTemplateCount(templates.length);
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
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const scrollToTable = useCallback(() => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
      title: 'Total Template',
      value: String(templateCount),
      icon: FileText,
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      onClick: () => navigate({ to: '/kemahasiswaan/template-dokumen' }),
    },
    {
      title: 'Total Diapprove',
      value: String(approvalItems.filter((b) => b.status === 'approved').length),
      icon: CheckCircle,
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
      onClick: () => navigate({ to: '/kemahasiswaan/riwayat-persetujuan' }),
    },
  ], [approvalItems, uniqueSubmittersCount, templateCount, navigate, scrollToTable]);

  const handleApprove = useCallback((id: number) => {
    setDialogState({ type: 'approve', id });
  }, []);

  const onConfirmApprove = useCallback(async () => {
    if (!dialogState.id) return;

    try {
      await documentService.approveDocument(dialogState.id, '', 'Approved by Kemahasiswaan');
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to approve document:', err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Gagal menyetujui dokumen');
      } else {
        setError('Terjadi kesalahan saat menyetujui dokumen');
      }
    } finally {
      setDialogState({ type: null, id: null });
    }
  }, [dialogState.id, fetchDocuments]);

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
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Gagal mengembalikan dokumen');
      } else {
        setError('Terjadi kesalahan saat mengembalikan dokumen');
      }
    } finally {
      setDialogState({ type: null, id: null });
    }
  }, [dialogState.id, fetchDocuments]);

  const handleOpenDoc = useCallback((documentId: number) => {
    navigate({
      to: '/preview-document',
      search: {
        documentId,
        return: '/kemahasiswaan',
      },
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className='p-6 flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='text-lg font-semibold text-gray-700'>
            Memuat data...
          </div>
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
          Dashboard Kemahasiswaan
        </h1>
        <p className='text-gray-600 mt-1'>
          Review dan persetujuan peminjaman ruang oleh Kemahasiswaan
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
            <p className='text-gray-500'>
              Tidak ada dokumen yang menunggu persetujuan
            </p>
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
        title='⚠️ Persetujuan Dokumen'
        description='Apakah Anda yakin ingin menyetujui dokumen ini? Tindakan ini tidak dapat dibatalkan.'
        confirmLabel='Setujui'
      />

      <RevisionDialog
        isOpen={dialogState.type === 'revise'}
        onClose={() => setDialogState({ type: null, id: null })}
        onConfirm={onConfirmRevise}
        variant='destructive'
      />
    </>
  );
}
