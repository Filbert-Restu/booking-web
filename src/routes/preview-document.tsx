import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { documentService, type Document } from '@/services/document.service';

export const Route = createFileRoute('/preview-document')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      documentId: search.documentId as number | undefined,
      return: search.return as string | undefined,
    };
  },
});

type DocumentType = 'proposal' | 'approval-sheet' | 'executive-summary';

export function DocumentPreviewContent({
  documentId,
  returnPath,
}: {
  documentId: number | undefined;
  returnPath: string;
}) {
  const navigate = useNavigate();

  const [selectedDocType, setSelectedDocType] =
    useState<DocumentType>('approval-sheet');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [reviseDialogOpen, setReviseDialogOpen] = useState(false);
  const [reviseNote, setReviseNote] = useState('');
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (documentId) {
      loadDocumentPreview(selectedDocType);
      loadDocument();
    }
  }, [documentId, selectedDocType]);

  const loadDocument = async () => {
    if (!documentId) return;

    try {
      const doc = await documentService.getDocument(documentId);
      setDocument(doc);
    } catch (err) {
      console.error('Failed to load document:', err);
    }
  };

  const loadDocumentPreview = async (docType: DocumentType) => {
    if (!documentId) return;

    try {
      setLoading(true);
      // Clean up previous URL
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }

      const response = await api.get(
        `/documents/${documentId}/file/${docType}/pdf`,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Failed to load document preview:', err);
      const error = err as AxiosError<any>;
      if (error.response?.status === 404) {
        setPdfUrl(null);
        alert(`Dokumen ${docType} belum tersedia`);
      } else {
        alert('Gagal memuat preview dokumen');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!documentId) {
      alert('Document ID tidak ditemukan');
      return;
    }

    const note = prompt('Masukkan catatan (opsional):') || '';

    try {
      setApproveLoading(true);
      await documentService.approveDocument(
        documentId,
        '',
        note || 'Disetujui',
      );
      alert(
        '✅ Dokumen berhasil disetujui!\n\nDokumen telah diteruskan ke step berikutnya.',
      );
      navigate({ to: returnPath as any });
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
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRevise = () => {
    setReviseDialogOpen(true);
  };

  const handleSubmitRevise = async () => {
    if (!reviseNote.trim()) {
      alert('Silakan masukkan catatan revisi');
      return;
    }

    if (!documentId || !document) {
      alert('Document ID tidak ditemukan');
      return;
    }

    try {
      setApproveLoading(true);
      await documentService.reviseDocument(
        documentId,
        document.creator_id,
        reviseNote,
      );
      alert('📝 Dokumen berhasil dikembalikan untuk revisi!');
      setReviseDialogOpen(false);
      setReviseNote('');
      navigate({ to: returnPath as any });
    } catch (err) {
      console.error('Failed to revise document:', err);
      const error = err as AxiosError<{ message?: string }>;
      alert(
        error.response?.data?.message ||
          'Gagal mengembalikan dokumen untuk revisi',
      );
    } finally {
      setApproveLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Preview Dokumen</h1>
        <p className='text-gray-600 mt-1'>Lihat dokumen yang telah diajukan</p>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Preview Dokumen</CardTitle>
            <Select
              value={selectedDocType}
              onValueChange={(val) => setSelectedDocType(val as DocumentType)}
            >
              <SelectTrigger className='w-50'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='proposal'>Proposal</SelectItem>
                <SelectItem value='approval-sheet'>
                  Lembar Pengesahan
                </SelectItem>
                <SelectItem value='executive-summary'>
                  Executive Summary
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Preview PDF */}
          {loading && (
            <div className='flex items-center justify-center h-[800px] border rounded-lg bg-gray-50'>
              <p className='text-gray-500'>Memuat dokumen...</p>
            </div>
          )}
          {!loading && pdfUrl && (
            <div className='border rounded-lg overflow-hidden'>
              <iframe
                src={pdfUrl}
                className='w-full h-[800px]'
                title='Document Preview'
              />
            </div>
          )}
          {!loading && !pdfUrl && (
            <div className='flex items-center justify-center h-[800px] border rounded-lg bg-gray-50'>
              <p className='text-gray-500'>Dokumen tidak tersedia</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {documentId && (
        <div className='mt-6 flex gap-3 justify-center w-full'>
          <Button
            onClick={handleRevise}
            disabled={loading || approveLoading}
            variant='destructive'
            className='flex-1'
          >
            {approveLoading ? 'Memproses...' : 'Kembalikan untuk Revisi'}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading || approveLoading}
            className='flex-1'
          >
            {approveLoading ? 'Memproses...' : 'Setujui Dokumen'}
          </Button>
        </div>
      )}

      <div className='mt-6 flex justify-end'>
        <Button
          onClick={() => navigate({ to: returnPath as any })}
          variant='outline'
        >
          Kembali
        </Button>
      </div>

      {/* Dialog untuk Catatan Revisi */}
      <Dialog open={reviseDialogOpen} onOpenChange={setReviseDialogOpen}>
        <DialogContent className='sm:max-w-125'>
          <DialogHeader>
            <DialogTitle>Kembalikan Dokumen untuk Revisi</DialogTitle>
            <DialogDescription>
              Masukkan catatan revisi untuk dokumen ini. Dokumen akan
              dikembalikan ke pembuat dengan catatan Anda.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Textarea
              placeholder='Masukkan alasan pengembalian dan saran perbaikan...'
              value={reviseNote}
              onChange={(e) => setReviseNote(e.target.value)}
              rows={5}
              className='resize-none'
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setReviseDialogOpen(false);
                setReviseNote('');
              }}
              disabled={approveLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitRevise}
              disabled={!reviseNote.trim() || approveLoading}
              variant='destructive'
            >
              {approveLoading ? 'Memproses...' : 'Kembalikan untuk Revisi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RouteComponent() {
  const { documentId, return: returnPath } = Route.useSearch();
  return (
    <DocumentPreviewContent
      documentId={documentId}
      returnPath={returnPath || '/'}
    />
  );
}
