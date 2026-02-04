import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { AxiosError } from 'axios';
import { StatCard } from '@/shared/components/common/StatCard';
import { Approval } from '@/features/approvals';
import type { ActorRole } from '@/features/approvals';
import { documentService } from '@/services/document.service';
import { mapDocumentsToApprovalItems, type ApprovalItem } from '@/features/approvals/approval-utils';
import { Button } from '@/shared/components/ui/button/button';

export const Route = createFileRoute('/dosen-pendamping/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const actorRole: ActorRole = 'dosen-pendamping';

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

  const stats = [
    {
      title: 'Antrean Approval',
      value: String(approvalItems.filter(b => b.status === 'waiting').length),
      icon: Clock,
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Total Pengaju',
      value: String(approvalItems.length),
      icon: Users,
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Total Diapprove',
      value: String(approvalItems.filter(b => b.status === 'approved').length),
      icon: CheckCircle,
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
  ];

  const handleApprove = async (id: number) => {
    try {
      await documentService.approveDocument(id, 'Disetujui oleh Dosen Pendamping');
      alert('Dokumen berhasil disetujui!');
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to approve document:', err);
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Gagal menyetujui dokumen');
      } else {
        alert('Terjadi kesalahan saat menyetujui dokumen');
      }
    }
  };

  const handleRevise = async (id: number) => {
    const note = prompt('Masukkan catatan revisi:');
    if (!note) return;

    try {
      const doc = await documentService.getDocument(id);
      await documentService.reviseDocument(id, doc.creator_id, note);
      alert('Dokumen dikembalikan untuk revisi!');
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to revise document:', err);
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Gagal mengembalikan dokumen');
      } else {
        alert('Terjadi kesalahan saat mengembalikan dokumen');
      }
    }
  };

  const handleOpenDoc = (documentId: number) => {
    navigate({
      to: '/dosen-pendamping/sign-document',
      search: { documentId }
    });
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
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Dashboard Dosen Pendamping
        </h1>
        <p className='text-gray-600 mt-1'>
          Review dan persetujuan peminjaman ruang oleh Dosen Pendamping
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
          />
        ))}
      </div>

      <div className='mt-6'>
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
    </>
  );
}
