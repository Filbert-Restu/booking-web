import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
import { signatureService } from '@/services/signature.service';
import { documentService, type Document } from '@/services/document.service';
import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { SignatureUpload } from '@/shared/components/common/SignatureUpload';

type DocumentType = 'proposal' | 'approval-sheet' | 'executive-summary';

interface SignDocumentContentProps {
  documentId: number | undefined;
  returnPath: string;
}

export function SignDocumentContent({
  documentId,
  returnPath,
}: SignDocumentContentProps) {
  const navigate = useNavigate();

  const [signature, setSignature] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] =
    useState<DocumentType>('approval-sheet');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviseDialogOpen, setReviseDialogOpen] = useState(false);
  const [reviseNote, setReviseNote] = useState('');
  const [document, setDocument] = useState<Document | null>(null);

  // Refs to track blob URLs for cleanup
  const pdfUrlRef = useRef<string | null>(null);
  const signatureUrlRef = useRef<string | null>(null);

  const loadDocument = useCallback(async () => {
    if (!documentId) return;

    try {
      const doc = await documentService.getDocument(documentId);
      setDocument(doc);
    } catch (err) {
      console.error('Failed to load document:', err);
    }
  }, [documentId]);

  const loadSignature = useCallback(async () => {
    try {
      const sig = await signatureService.getSignature();
      if (sig) {
        // Get the signature file URL from backend with signature ID
        const url = await signatureService.getSignatureFileUrl(sig.id);

        // Revoke old blob URL before setting new one
        if (
          signatureUrlRef.current &&
          signatureUrlRef.current.startsWith('blob:')
        ) {
          try {
            window.URL.revokeObjectURL(signatureUrlRef.current);
          } catch {
            // Ignore errors
          }
        }

        signatureUrlRef.current = url;
        setSignature(url);
      }
    } catch {
      console.log('No signature found');
    }
  }, []);

  const loadDocumentPreview = useCallback(
    async (docType: DocumentType) => {
      if (!documentId) return;

      try {
        setLoading(true);

        // Clean up previous URL before creating new one
        if (pdfUrlRef.current) {
          try {
            window.URL.revokeObjectURL(pdfUrlRef.current);
          } catch {
            // Ignore cleanup errors
          }
        }

        const response = await api.get(
          `/documents/${documentId}/file/${docType}/pdf`,
          {
            responseType: 'blob',
          },
        );

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        pdfUrlRef.current = url;
        setPdfUrl(url);
      } catch (err) {
        console.error('Failed to load document preview:', err);
        const error = err as AxiosError<{ message?: string }>;
        if (error.response?.status === 404) {
          pdfUrlRef.current = null;
          setPdfUrl(null);
          alert(`Dokumen ${docType} belum tersedia`);
        } else {
          alert('Gagal memuat preview dokumen');
        }
      } finally {
        setLoading(false);
      }
    },
    [documentId],
  );

  useEffect(() => {
    loadSignature();
    if (documentId) {
      loadDocument();
      loadDocumentPreview(selectedDocType);
    }
  }, [
    documentId,
    selectedDocType,
    loadDocument,
    loadDocumentPreview,
    loadSignature,
  ]);

  const handleEmbedSignature = async () => {
    if (!signature) {
      alert('Silakan upload atau gambar tanda tangan terlebih dahulu');
      return;
    }

    if (!documentId) {
      alert('Document ID tidak ditemukan');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/documents/${documentId}/apply-signature`, {
        type: selectedDocType,
      });
      alert('Tanda tangan berhasil dibubuhkan ke dokumen (belum disetujui)');
      // Reload the document preview to show updated signature
      loadDocumentPreview(selectedDocType);
    } catch (err) {
      console.error('Failed to embed signature:', err);
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || 'Gagal membubuhkan tanda tangan');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async () => {
    if (!signature) {
      alert('Silakan upload atau gambar tanda tangan terlebih dahulu');
      return;
    }

    if (!documentId) {
      alert('Document ID tidak ditemukan');
      return;
    }

    try {
      setLoading(true);
      // Call approve API which will auto-apply signature
      await documentService.approveDocument(
        documentId,
        '',
        'Approved with signature',
      );
      alert('✅ Dokumen berhasil ditandatangani dan disetujui!');

      if (returnPath) {
        navigate({ to: returnPath });
      } else {
        navigate({ to: '/' });
      }
    } catch (err) {
      console.error('Failed to approve document:', err);
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || 'Gagal menyetujui dokumen');
    } finally {
      setLoading(false);
    }
  };

  const handleReviseDocument = () => {
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
      setLoading(true);
      await documentService.reviseDocument(
        documentId,
        document.creator_id,
        reviseNote,
      );

      alert('📝 Dokumen berhasil dikembalikan untuk revisi!');
      setReviseDialogOpen(false);
      setReviseNote('');

      if (returnPath) {
        navigate({ to: returnPath });
      } else {
        navigate({ to: '/' });
      }
    } catch (err) {
      console.error('Failed to revise document:', err);
      const error = err as AxiosError<{ message?: string }>;
      alert(
        error.response?.data?.message ||
          'Gagal mengembalikan dokumen untuk revisi',
      );
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup using refs to get latest values
      if (pdfUrlRef.current) {
        try {
          window.URL.revokeObjectURL(pdfUrlRef.current);
        } catch {
          // Ignore cleanup errors
        }
      }
      if (
        signatureUrlRef.current &&
        signatureUrlRef.current.startsWith('blob:')
      ) {
        try {
          window.URL.revokeObjectURL(signatureUrlRef.current);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []); // Empty dependency array - cleanup runs only on unmount

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Tanda Tangani Dokumen
        </h1>
        <p className='text-gray-600 mt-1'>
          Upload atau gambar tanda tangan Anda, lalu pilih dokumen untuk
          ditandatangani
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-8 gap-6 items-start'>
        {/* Card Kiri: Tanda Tangan */}
        <SignatureUpload
          className='lg:col-span-3 self-start sticky top-24 z-10'
          onSignatureUploaded={loadSignature}
        />

        {/* Card Kanan: Preview Dokumen */}
        <Card className='lg:col-span-5 relative z-0'>
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
              <div className='flex items-center justify-center h-150 border rounded-lg bg-gray-50'>
                <p className='text-gray-500'>Memuat dokumen...</p>
              </div>
            )}
            {!loading && pdfUrl && (
              <div className='border rounded-lg overflow-hidden'>
                <iframe
                  src={pdfUrl}
                  className='w-full h-150'
                  title='Document Preview'
                />
              </div>
            )}
            {!loading && !pdfUrl && (
              <div className='flex items-center justify-center h-150 border rounded-lg bg-gray-50'>
                <p className='text-gray-500'>Dokumen tidak tersedia</p>
              </div>
            )}

            {/* Buttons: embed signature (no approve) + approve + revise */}
            {signature && pdfUrl && (
              <div className='flex gap-2 flex-wrap'>
                <Button
                  onClick={handleEmbedSignature}
                  disabled={loading}
                  variant='outline'
                  className='flex-1 min-w-40'
                >
                  {loading ? 'Memproses...' : 'Bubuhkan Tanda Tangan'}
                </Button>
                <Button
                  onClick={handleApproveDocument}
                  disabled={loading}
                  className='flex-1 min-w-40'
                  size='lg'
                >
                  {loading ? 'Memproses...' : 'Setujui dan Tandatangani'}
                </Button>
                <Button
                  onClick={handleReviseDocument}
                  disabled={loading}
                  variant='destructive'
                  className='flex-1 min-w-40'
                >
                  {loading ? 'Memproses...' : 'Kembalikan untuk Revisi'}
                </Button>
              </div>
            )}
            {!signature && (
              <div className='text-center text-sm text-gray-500 p-4 bg-yellow-50 rounded-lg'>
                Silakan upload atau gambar tanda tangan terlebih dahulu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='mt-6 flex justify-end'>
        <Button
          onClick={() => {
            if (returnPath) {
              navigate({ to: returnPath });
            } else {
              navigate({ to: '/' });
            }
          }}
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
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitRevise}
              disabled={!reviseNote.trim() || loading}
              variant='destructive'
            >
              {loading ? 'Memproses...' : 'Kembalikan untuk Revisi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
