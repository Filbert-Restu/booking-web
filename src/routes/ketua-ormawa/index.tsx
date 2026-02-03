import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  Clock,
  Users,
  CheckCircle,
  FilePlus,
  File,
  FileText,
} from 'lucide-react';
import { AxiosError } from 'axios';
import { StatCard } from '@/shared/components/common/StatCard';
import { Approval } from '@/features/approvals';
import type { ActorRole } from '@/features/approvals';
import type { DocActionPayload } from '@/features/approvals/Approval';
import { documentService, type Document } from '@/services/document.service';
import { signatureService } from '@/services/signature.service';
import {
  mapDocumentsToApprovalItems,
  type ApprovalItem,
} from '@/features/approvals/approval-utils';
import { Button } from '@/shared/components/ui/button/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import api from '@/lib/axios';

export const Route = createFileRoute('/ketua-ormawa/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      documentId: search.documentId as number | undefined,
      autoApprove: search.autoApprove as boolean | undefined,
    };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { documentId, autoApprove } = Route.useSearch();
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [processedItems, setProcessedItems] = useState<ApprovalItem[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const actorRole: ActorRole = 'ketua-ormawa';
  const [pdfPreview, setPdfPreview] = useState<{
    id: number;
    type: 'approval-sheet' | 'proposal';
    url: string;
  } | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Auto-approve after returning from signature page
  useEffect(() => {
    if (autoApprove && documentId) {
      const performAutoApprove = async () => {
        try {
          console.log('🔄 Auto-approving document:', documentId);
          await documentService.approveDocument(
            documentId,
            '',
            'Approved after signature upload',
          );
          alert(
            '✅ Dokumen berhasil disetujui!\n\nTanda tangan telah ditambahkan dan dokumen diteruskan ke step berikutnya.',
          );

          // Clear search params
          navigate({
            to: '/ketua-ormawa',
            replace: true,
          });

          // Refresh data
          await fetchDocuments();
        } catch (err) {
          console.error('Auto-approve failed:', err);
          if (err instanceof AxiosError) {
            alert(
              '❌ Gagal approve otomatis\n\n' +
                (err.response?.data?.message || err.message),
            );
          }
        }
      };

      performAutoApprove();
    }
  }, [autoApprove, documentId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getDocuments();

      // Get pending documents (documents waiting for this user's approval)
      const pendingDocs = data.pending_documents || [];
      const mappedItems = mapDocumentsToApprovalItems(pendingDocs);
      setApprovalItems(mappedItems);

      // Get processed documents (documents already processed by this user)
      const processedDocs = data.processed_documents || [];
      const mappedProcessed = mapDocumentsToApprovalItems(processedDocs);
      setProcessedItems(mappedProcessed);

      // Store all documents for table view
      const allDocs = [...pendingDocs, ...processedDocs];
      setAllDocuments(allDocs);
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
      value: String(approvalItems.filter((b) => b.status === 'waiting').length),
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
      value: String(
        approvalItems.filter((b) => b.status === 'approved').length,
      ),
      icon: CheckCircle,
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
  ];

  const processedStats = [
    {
      title: 'Total Diproses',
      value: String(processedItems.length),
      icon: CheckCircle,
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
  ];

  const handleApprove = async (id: number) => {
    try {
      // Check if user has signature
      const signature = await signatureService.getSignature();
      if (!signature) {
        const confirmSetup = confirm(
          '⚠️ Tanda Tangan Belum Diupload\n\n' +
            'Anda harus mengupload tanda tangan digital terlebih dahulu sebelum approve dokumen.\n\n' +
            'Apakah Anda ingin mengupload tanda tangan sekarang?',
        );
        if (confirmSetup) {
          navigate({
            to: '/tanda-tangan',
            search: {
              return: '/ketua-ormawa',
              documentId: id,
            },
          });
        }
        return;
      }

      const note = prompt('Masukkan catatan (opsional):') || '';

      // Backend will automatically use signature from database
      await documentService.approveDocument(id, '', note);
      alert(
        '✅ Dokumen berhasil disetujui!\n\nDokumen telah diteruskan ke step berikutnya.',
      );

      // Refresh data
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to approve document:', err);
      if (err instanceof AxiosError) {
        alert(
          '❌ Gagal menyetujui dokumen\n\n' +
            (err.response?.data?.message || err.message),
        );
      } else {
        alert('Terjadi kesalahan saat menyetujui dokumen');
      }
    }
  };

  const handleRevise = async (id: number) => {
    const note = prompt('Masukkan catatan revisi:');
    if (!note) return;

    try {
      // Get document to find creator
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

  // Download DOCX file
  const downloadDocxFile = async (
    docId: number,
    fileType: 'proposal' | 'executive-summary' | 'approval-sheet',
  ) => {
    try {
      const response = await api.get(`/documents/${docId}/file/${fileType}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const fileName = `${fileType}_${docId}.docx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      if ((error as any).response?.status === 403) {
        alert('Anda tidak memiliki akses untuk mengunduh file ini');
      } else if ((error as any).response?.status === 404) {
        alert('File tidak ditemukan');
      } else {
        alert(
          'Gagal mengunduh file: ' +
            ((error as any).response?.data?.message || (error as any).message),
        );
      }
    }
  };

  const handleOpenDoc = async (payload: DocActionPayload) => {
    console.log('handleOpenDoc called with:', payload);

    if (payload.mode === 'preview') {
      // Preview: open PDF in modal - always use approval-sheet for ketua-ormawa
      const documentId = payload.booking.id;
      const docType = 'approval-sheet'; // Always use approval-sheet

      console.log(
        'Opening preview for document:',
        documentId,
        'type:',
        docType,
      );

      try {
        const response = await api.get(
          `/documents/${documentId}/file/${docType}/pdf`,
          {
            responseType: 'blob',
          },
        );

        const blob = new Blob([response.data], {
          type: 'application/pdf',
        });
        const url = window.URL.createObjectURL(blob);

        setPdfPreview({ id: documentId, type: docType, url });
      } catch (error) {
        console.error('PDF preview failed:', error);
        const err = error as any;
        if (err.response?.status === 403) {
          alert(
            '❌ Akses Ditolak\n\nAnda tidak memiliki izin untuk melihat dokumen ini. Pastikan Anda sudah memproses dokumen ini.',
          );
        } else if (err.response?.status === 404) {
          alert(
            '❌ File Tidak Ditemukan\n\nLembar pengesahan belum tersedia untuk dokumen ini.',
          );
        } else if (err.response?.status === 500) {
          alert(
            '❌ Kesalahan Server\n\n' +
              (err.response?.data?.message ||
                'Terjadi kesalahan saat mengkonversi dokumen. Pastikan PHP GD extension sudah aktif.'),
          );
        } else {
          alert(
            'Gagal membuka preview PDF: ' +
              (err.response?.data?.message || err.message),
          );
        }
      }
    } else if (payload.mode === 'download') {
      // Download: download DOCX file - always use approval-sheet
      const documentId = payload.booking.id;
      const docType = 'approval-sheet';

      console.log('Downloading document:', documentId, 'type:', docType);

      await downloadDocxFile(documentId, docType);
    } else if (payload.mode === 'sign') {
      // Sign: navigate to signature page, then auto-approve on return
      navigate({
        to: '/tanda-tangan',
        search: {
          return: '/ketua-ormawa',
          documentId: payload.booking.id,
          autoApprove: true,
        } as any,
      });
    }
  };

  // Cleanup blob URL when modal closes
  const closePdfPreview = () => {
    if (pdfPreview?.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview(null);
  };

  // Helper functions for table display
  const getEventName = (doc: Document) => {
    const content = doc.content as any;
    return content?.event_name || 'Tidak ada nama';
  };

  const getKetuaPelaksanaNama = (doc: Document) => {
    const content = doc.content as any;
    return content?.ketua_pelaksana_nama || '-';
  };

  const getBookingDate = (doc: Document) => {
    const content = doc.content as any;
    if (content?.booking_date) {
      return new Date(content.booking_date).toLocaleDateString('id-ID');
    }
    return '-';
  };

  const getRoomInfo = (doc: Document) => {
    const content = doc.content as any;
    if (content?.room_id) {
      return `Ruang ${content.room_code || content.room_id}`;
    }
    return '-';
  };

  const getStatusBadge = (status: Document['status']) => {
    const statusConfig: Record<
      Document['status'],
      { bg: string; text: string; label: string }
    > = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      IN_PROGRESS: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Diproses',
      },
      APPROVED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Disetujui',
      },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
      REVISED: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: 'Perlu Revisi',
      },
    };
    const config = statusConfig[status];

    if (!config) {
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
          {status}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  // Open PDF preview for direct file access
  const openPdfPreview = async (
    docId: number,
    fileType: 'proposal' | 'approval-sheet',
  ) => {
    try {
      const response = await api.get(
        `/documents/${docId}/file/${fileType}/pdf`,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);

      setPdfPreview({
        id: docId,
        type: fileType,
        url,
      });
    } catch (error) {
      console.error('PDF preview failed:', error);
      alert('Gagal membuka preview PDF');
    }
  };

  // Download DOCX for direct file access
  const downloadDocxFileFromTable = async (
    docId: number,
    fileType: 'proposal' | 'approval-sheet',
  ) => {
    try {
      const response = await api.get(`/documents/${docId}/file/${fileType}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const fileName = `${fileType}_${docId}.docx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Gagal mengunduh file');
    }
  };

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
          Dashboard Ketua Ormawa
        </h1>
        <p className='text-gray-600 mt-1'>
          Ringkasan aktivitas organisasi Anda
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
            <p className='text-gray-500'>
              Tidak ada dokumen yang menunggu persetujuan
            </p>
          </div>
        ) : (
          <>
            <Approval
              bookings={approvalItems}
              onApprove={handleApprove}
              onRevise={handleRevise}
              actorRole={actorRole}
              onOpenDoc={handleOpenDoc}
              showOrganisasi={true}
              showProposal={true}
            />

            {/* Quick Access to Documents */}
            <div className='mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <h3 className='text-sm font-semibold text-blue-900 mb-3'>
                Akses Cepat Dokumen
              </h3>
              <div className='space-y-2'>
                {approvalItems.map((item) => {
                  const doc = allDocuments.find((d) => d.id === item.id);
                  if (!doc) return null;

                  return (
                    <div
                      key={item.id}
                      className='bg-white rounded border border-blue-200 p-3 flex items-center justify-between'
                    >
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                          {getEventName(doc)}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {getKetuaPelaksanaNama(doc)} - {getBookingDate(doc)}
                        </p>
                      </div>
                      <div className='flex gap-2 items-center ml-4'>
                        {doc.file_approval_sheet && (
                          <div className='flex gap-1'>
                            <button
                              onClick={() =>
                                downloadDocxFileFromTable(
                                  doc.id,
                                  'approval-sheet',
                                )
                              }
                              className='px-3 py-1.5 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors flex items-center gap-1'
                              title='Download Lembar Pengesahan (DOCX)'
                            >
                              <FilePlus className='w-3 h-3' />
                              Pengesahan
                            </button>
                            <button
                              onClick={() =>
                                openPdfPreview(doc.id, 'approval-sheet')
                              }
                              className='px-2 py-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors'
                              title='Preview PDF'
                            >
                              PDF
                            </button>
                          </div>
                        )}
                        {doc.file_proposal && (
                          <div className='flex gap-1'>
                            <button
                              onClick={() =>
                                downloadDocxFileFromTable(doc.id, 'proposal')
                              }
                              className='px-3 py-1.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors flex items-center gap-1'
                              title='Download Proposal (DOCX)'
                            >
                              <File className='w-3 h-3' />
                              Proposal
                            </button>
                            <button
                              onClick={() => openPdfPreview(doc.id, 'proposal')}
                              className='px-2 py-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors'
                              title='Preview PDF'
                            >
                              PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Riwayat Dokumen yang Sudah Diproses */}
      {processedItems.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-lg font-semibold mb-4'>
            Riwayat Dokumen yang Sudah Diproses
          </h2>
          <Approval
            bookings={processedItems}
            onApprove={handleApprove}
            onRevise={handleRevise}
            actorRole={actorRole}
            onOpenDoc={handleOpenDoc}
            showOrganisasi={true}
            showProposal={true}
          />
        </div>
      )}

      {/* Tabel Semua Dokumen dengan Preview */}
      {allDocuments.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-lg font-semibold mb-4'>Semua Dokumen</h2>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[5%] text-center'>No</TableHead>
                    <TableHead className='w-[10%]'>Tgl Pengajuan</TableHead>
                    <TableHead className='w-[20%]'>Nama Kegiatan</TableHead>
                    <TableHead className='w-[15%]'>Ketua Pelaksana</TableHead>
                    <TableHead className='w-[10%]'>Tgl Acara</TableHead>
                    <TableHead className='w-[10%]'>Ruangan</TableHead>
                    <TableHead className='w-[10%]'>Status</TableHead>
                    <TableHead className='w-[20%]'>Dokumen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDocuments.map((doc, index) => (
                    <TableRow key={doc.id}>
                      <TableCell className='text-center'>{index + 1}</TableCell>
                      <TableCell>
                        {new Date(doc.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className='font-medium'>
                        <div className='line-clamp-2'>{getEventName(doc)}</div>
                      </TableCell>
                      <TableCell>
                        <div className='line-clamp-1'>
                          {getKetuaPelaksanaNama(doc)}
                        </div>
                      </TableCell>
                      <TableCell>{getBookingDate(doc)}</TableCell>
                      <TableCell>{getRoomInfo(doc)}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <div className='flex gap-1 items-center justify-center flex-wrap'>
                          {(() => {
                            const hasProposal = doc.file_proposal;
                            const hasApproval = doc.file_approval_sheet;

                            return (
                              <>
                                {hasProposal && (
                                  <>
                                    <button
                                      onClick={() =>
                                        downloadDocxFileFromTable(
                                          doc.id,
                                          'proposal',
                                        )
                                      }
                                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                                      title='Download Proposal (DOCX)'
                                    >
                                      <File className='w-4 h-4 text-blue-600' />
                                    </button>
                                    <button
                                      onClick={() =>
                                        openPdfPreview(doc.id, 'proposal')
                                      }
                                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                                      title='Lihat PDF Proposal'
                                    >
                                      <FileText className='w-4 h-4 text-red-600' />
                                    </button>
                                  </>
                                )}
                                {hasApproval && (
                                  <>
                                    <button
                                      onClick={() =>
                                        downloadDocxFileFromTable(
                                          doc.id,
                                          'approval-sheet',
                                        )
                                      }
                                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                                      title='Download Lembar Pengesahan (DOCX)'
                                    >
                                      <FilePlus className='w-4 h-4 text-purple-600' />
                                    </button>
                                    <button
                                      onClick={() =>
                                        openPdfPreview(doc.id, 'approval-sheet')
                                      }
                                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                                      title='Lihat PDF Lembar Pengesahan'
                                    >
                                      <FileText className='w-4 h-4 text-red-600' />
                                    </button>
                                  </>
                                )}
                              </>
                            );
                          })()}
                          {!doc.file_proposal && !doc.file_approval_sheet && (
                            <span className='text-xs text-gray-400'>-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {pdfPreview && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col'>
            <div className='flex justify-between items-center p-4 border-b'>
              <h3 className='text-lg font-semibold'>Preview PDF</h3>
              <button
                onClick={closePdfPreview}
                className='text-gray-500 hover:text-gray-700'
              >
                ✕
              </button>
            </div>
            <div className='flex-1 overflow-hidden'>
              <iframe
                src={pdfPreview.url}
                className='w-full h-full border-0'
                title='PDF Preview'
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
