import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Upload, Pen } from 'lucide-react';
import { signatureService } from '@/services/signature.service';
import { documentService } from '@/services/document.service';
import api from '@/lib/axios';
import SignatureCanvas from 'react-signature-canvas';
import { AxiosError } from 'axios';

export const Route = createFileRoute('/sign-document')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      documentId: search.documentId as number | undefined,
      return: search.return as string | undefined,
    };
  },
});

type DocumentType = 'proposal' | 'approval-sheet' | 'executive-summary';

export function SignDocumentContent({ documentId, returnPath }: { documentId: number | undefined; returnPath: string }) {
  const navigate = useNavigate();
  
  const [signature, setSignature] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('approval-sheet');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDrawMode, setShowDrawMode] = useState(false);
  const [showUploadMode, setShowUploadMode] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSignature();
    if (documentId) {
      loadDocumentPreview(selectedDocType);
      // Auto-show draw mode when coming from approve flow
      setShowDrawMode(true);
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
        // Get the signature file URL from backend
        const url = await signatureService.getSignatureFileUrl();
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

  const handleClearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSaveDrawnSignature = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert('Silakan buat tanda tangan terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      // Convert canvas to blob
      const canvas = sigCanvas.current.getCanvas();
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      
      // Check if user already has signature, update or create
      const existingSig = await signatureService.getSignature();
      if (existingSig) {
        await signatureService.updateSignature(existingSig.id, file);
      } else {
        await signatureService.uploadSignature(file);
      }
      
      // Reload signature from database
      await loadSignature();
      setShowDrawMode(false);
      alert('Tanda tangan berhasil disimpan!');
    } catch (err) {
      console.error('Failed to save signature:', err);
      alert('Gagal menyimpan tanda tangan');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Format file harus PNG, JPG, atau JPEG');
      return;
    }

    try {
      setLoading(true);
      // Check if user already has signature, update or create
      const existingSig = await signatureService.getSignature();
      if (existingSig) {
        await signatureService.updateSignature(existingSig.id, file);
      } else {
        await signatureService.uploadSignature(file);
      }
      
      // Reload signature from database
      await loadSignature();
      setShowUploadMode(false);
      alert('Tanda tangan berhasil diupload!');
    } catch (err) {
      console.error('Failed to upload signature:', err);
      alert('Gagal mengupload tanda tangan');
    } finally {
      setLoading(false);
    }
  };

  const handleSignDocument = async () => {
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
      await documentService.approveDocument(documentId, '', 'Approved with signature');
      alert('✅ Dokumen berhasil ditandatangani dan disetujui!');
      
      if (returnPath) {
        navigate({ to: returnPath as any });
      } else {
        navigate({ to: '/' as any });
      }
    } catch (err) {
      console.error('Failed to sign document:', err);
      const error = err as AxiosError<any>;
      alert(error.response?.data?.message || 'Gagal menandatangani dokumen');
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
        <h1 className='text-2xl font-bold text-gray-900'>Tanda Tangani Dokumen</h1>
        <p className='text-gray-600 mt-1'>
          Upload atau gambar tanda tangan Anda, lalu pilih dokumen untuk ditandatangani
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-8 gap-6'>
        {/* Card Kiri: Tanda Tangan */}
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>Tanda Tangan Anda</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Preview tanda tangan yang tersimpan */}
            {signature && !showDrawMode && !showUploadMode && (
              <div className='border rounded-lg p-4 bg-gray-50'>
                <p className='text-sm text-gray-600 mb-2'>Tanda tangan tersimpan:</p>
                <img src={signature} alt='Signature' className='max-h-32 mx-auto' />
              </div>
            )}

            {/* Mode Gambar */}
            {showDrawMode && (
              <div className='space-y-4'>
                <div className='border-2 border-gray-300 rounded-lg bg-white'>
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      className: 'w-full h-48',
                    }}
                  />
                </div>
                <div className='flex gap-2'>
                  <Button onClick={handleClearSignature} variant='outline' className='flex-1'>
                    Hapus
                  </Button>
                  <Button onClick={handleSaveDrawnSignature} className='flex-1'>
                    Simpan
                  </Button>
                  <Button onClick={() => setShowDrawMode(false)} variant='outline'>
                    Batal
                  </Button>
                </div>
              </div>
            )}

            {/* Mode Upload */}
            {showUploadMode && (
              <div className='space-y-4'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleUploadSignature}
                  className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                />
                <Button onClick={() => setShowUploadMode(false)} variant='outline' className='w-full'>
                  Batal
                </Button>
              </div>
            )}

            {/* Tombol Aksi */}
            {!showDrawMode && !showUploadMode && (
              <div className='space-y-2'>
                <Button
                  onClick={() => setShowDrawMode(true)}
                  variant='outline'
                  className='w-full flex items-center justify-center gap-2'
                >
                  <Pen className='w-4 h-4' />
                  {signature ? 'Ubah dengan Gambar' : 'Gambar Tanda Tangan'}
                </Button>
                <Button
                  onClick={() => setShowUploadMode(true)}
                  variant='outline'
                  className='w-full flex items-center justify-center gap-2'
                >
                  <Upload className='w-4 h-4' />
                  {signature ? 'Ubah dengan Upload' : 'Upload Tanda Tangan'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Kanan: Preview Dokumen */}
        <Card className='lg:col-span-5'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Preview Dokumen</CardTitle>
              <Select value={selectedDocType} onValueChange={(val) => setSelectedDocType(val as DocumentType)}>
                <SelectTrigger className='w-50'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='proposal'>Proposal</SelectItem>
                  <SelectItem value='approval-sheet'>Lembar Pengesahan</SelectItem>
                  <SelectItem value='executive-summary'>Executive Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Preview PDF */}
            {loading && (
              <div className='flex items-center justify-center h-[600px] border rounded-lg bg-gray-50'>
                <p className='text-gray-500'>Memuat dokumen...</p>
              </div>
            )}
            {!loading && pdfUrl && (
              <div className='border rounded-lg overflow-hidden'>
                <iframe
                  src={pdfUrl}
                  className='w-full h-[600px]'
                  title='Document Preview'
                />
              </div>
            )}
            {!loading && !pdfUrl && (
              <div className='flex items-center justify-center h-[600px] border rounded-lg bg-gray-50'>
                <p className='text-gray-500'>Dokumen tidak tersedia</p>
              </div>
            )}

            {/* Button Bubuhkan Tanda Tangan */}
            {signature && pdfUrl && (
              <Button
                onClick={handleSignDocument}
                disabled={loading}
                className='w-full'
                size='lg'
              >
                {loading ? 'Memproses...' : 'Bubuhkan Tanda Tangan'}
              </Button>
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

function RouteComponent() {
  const { documentId, return: returnPath } = Route.useSearch();
  return <SignDocumentContent documentId={documentId} returnPath={returnPath || '/'} />;
}
