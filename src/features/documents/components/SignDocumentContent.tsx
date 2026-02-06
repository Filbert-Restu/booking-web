import { useState, useEffect } from 'react';
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
import { signatureService } from '@/services/signature.service';
import { documentService } from '@/services/document.service';
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

  useEffect(() => {
    loadSignature();
    if (documentId) {
      loadDocumentPreview(selectedDocType);
    }
  }, []);

  useEffect(() => {
    if (documentId && selectedDocType) {
      loadDocumentPreview(selectedDocType);
    }
  }, [selectedDocType, documentId]);

  const loadSignature = async () => {
    try {
      const sig = await signatureService.getSignature();
      if (sig) {
        // Revoke old blob URL before creating new one
        if (signature) {
          try {
            window.URL.revokeObjectURL(signature);
          } catch (e) {
            // Ignore errors
          }
        }

        // Get the signature file URL from backend with signature ID
        const url = await signatureService.getSignatureFileUrl(sig.id);
        setSignature(url);
      }
    } catch (err) {
      console.log('No signature found');
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
      await loadDocumentPreview(selectedDocType);
    } catch (err) {
      console.error('Failed to embed signature:', err);
      const error = err as AxiosError<any>;
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
        navigate({ to: returnPath as any });
      } else {
        navigate({ to: '/' as any });
      }
    } catch (err) {
      console.error('Failed to approve document:', err);
      const error = err as AxiosError<any>;
      alert(error.response?.data?.message || 'Gagal menyetujui dokumen');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
      if (signature) {
        window.URL.revokeObjectURL(signature);
      }
    };
  }, [pdfUrl, signature]);

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

            {/* Buttons: embed signature (no approve) + approve */}
            {signature && pdfUrl && (
              <div className='flex gap-2'>
                <Button
                  onClick={handleEmbedSignature}
                  disabled={loading}
                  variant='outline'
                  className='flex-1'
                >
                  {loading ? 'Memproses...' : 'Bubuhkan Tanda Tangan'}
                </Button>
                <Button
                  onClick={handleApproveDocument}
                  disabled={loading}
                  className='flex-1'
                  size='lg'
                >
                  {loading ? 'Memproses...' : 'Setujui dan Tandatangani'}
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
              navigate({ to: returnPath as any });
            } else {
              navigate({ to: '/' as any });
            }
          }}
          variant='outline'
        >
          Kembali
        </Button>
      </div>
    </div>
  );
}
