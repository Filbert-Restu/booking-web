import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button/button';
import { ArrowLeft, Upload, Pen, Eraser, Check, AlertCircle } from 'lucide-react';
import { signatureService } from '@/services/signature.service';
import { documentService } from '@/services/document.service';
import api from '@/lib/axios';
import { AxiosError } from 'axios';

export const Route = createFileRoute('/sign-document')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      documentId: search.documentId as number | undefined,
      return: search.return as string | undefined,
      autoApprove: search.autoApprove as boolean | undefined,
    };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { documentId, return: returnPath, autoApprove } = Route.useSearch();
  
  // Canvas for drawing signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [uploadedSignature, setUploadedSignature] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  
  // Document preview
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewWithSignature, setPreviewWithSignature] = useState<string>('');

  useEffect(() => {
    if (!documentId) {
      setError('Document ID tidak ditemukan');
      return;
    }
    loadDocumentPreview();
  }, [documentId]);

  useEffect(() => {
    // Setup canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    // Set drawing styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Update preview when signature changes
  useEffect(() => {
    if (signatureDataUrl || uploadedSignature) {
      updatePreviewWithSignature();
    }
  }, [signatureDataUrl, uploadedSignature, pdfUrl]);

  const loadDocumentPreview = async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError('');
      
      // Load PDF preview
      const response = await api.get(
        `/documents/${documentId}/file/approval-sheet/pdf`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Failed to load document:', err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Gagal memuat dokumen');
      } else {
        setError('Terjadi kesalahan saat memuat dokumen');
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePreviewWithSignature = async () => {
    const currentSignature = activeTab === 'draw' ? signatureDataUrl : uploadedSignature;
    if (!currentSignature || !pdfUrl) return;

    // For now, just show the original PDF
    // In production, you would overlay the signature on the PDF
    setPreviewWithSignature(pdfUrl);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save canvas as data URL
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (PNG, JPG, etc.)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedSignature(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSignature = async () => {
    const currentSignature = activeTab === 'draw' ? signatureDataUrl : uploadedSignature;
    
    if (!currentSignature) {
      alert('Silakan buat atau upload tanda tangan terlebih dahulu');
      return;
    }

    if (!documentId) {
      alert('Document ID tidak ditemukan');
      return;
    }

    try {
      setSaving(true);
      
      // Convert data URL to blob
      const response = await fetch(currentSignature);
      const blob = await response.blob();
      
      // Create File from Blob
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      
      // Upload signature
      await signatureService.uploadSignature(file);
      
      // Approve document with signature
      await documentService.approveDocument(documentId, '', 'Approved with signature');
      
      alert('✅ Tanda tangan berhasil disimpan dan dokumen disetujui!');
      
      // Navigate back
      if (returnPath) {
        navigate({ to: returnPath as any, search: { autoApprove: autoApprove } as any });
      } else {
        navigate({ to: '/' as any });
      }
    } catch (err) {
      console.error('Failed to save signature:', err);
      if (err instanceof AxiosError) {
        alert('❌ ' + (err.response?.data?.message || 'Gagal menyimpan tanda tangan'));
      } else {
        alert('Terjadi kesalahan saat menyimpan tanda tangan');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (returnPath) {
      navigate({ to: returnPath as any });
    } else {
      navigate({ to: '/' as any });
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
      if (previewWithSignature && previewWithSignature !== pdfUrl) {
        window.URL.revokeObjectURL(previewWithSignature);
      }
    };
  }, [pdfUrl, previewWithSignature]);

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' onClick={handleCancel}>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Kembali
            </Button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Tanda Tangan Dokumen</h1>
              <p className='text-gray-600 mt-1'>
                Buat atau upload tanda tangan Anda
              </p>
            </div>
          </div>
          <Button onClick={handleSaveSignature} disabled={saving}>
            {saving ? (
              <>
                <div className='w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className='w-4 h-4 mr-2' />
                Simpan & Setujui
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
            {error}
          </div>
        )}

        {/* Main Content - Split View */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Panel - Signature Editor */}
          <div className='lg:col-span-1 space-y-6'>
            <div className='bg-white border rounded-lg p-6'>
              <h2 className='text-lg font-semibold mb-4'>Editor Tanda Tangan</h2>

            {/* Tab Buttons */}
            <div className='flex gap-2 mb-6'>
              <Button
                variant={activeTab === 'draw' ? 'default' : 'outline'}
                onClick={() => setActiveTab('draw')}
                className='flex-1 gap-2'
              >
                <Pen className='w-4 h-4' />
                Gambar
              </Button>
              <Button
                variant={activeTab === 'upload' ? 'default' : 'outline'}
                onClick={() => setActiveTab('upload')}
                className='flex-1 gap-2'
              >
                <Upload className='w-4 h-4' />
                Upload
              </Button>
            </div>

            {/* Draw Tab */}
            {activeTab === 'draw' && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium block'>
                    Gambar Tanda Tangan Anda
                  </label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg bg-white'>
                    <canvas
                      ref={canvasRef}
                      className='w-full cursor-crosshair'
                      style={{ height: '300px' }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <p className='text-xs text-gray-500'>
                    Gunakan mouse atau touchpad untuk menggambar tanda tangan Anda
                  </p>
                </div>

                <Button
                  variant='outline'
                  onClick={clearCanvas}
                  className='w-full gap-2'
                >
                  <Eraser className='w-4 h-4' />
                  Hapus
                </Button>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium block'>
                    Upload Gambar Tanda Tangan
                  </label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white'>
                    {uploadedSignature ? (
                      <div className='space-y-4'>
                        <img
                          src={uploadedSignature}
                          alt='Uploaded Signature'
                          className='max-h-50 mx-auto'
                        />
                        <Button
                          variant='outline'
                          onClick={() => setUploadedSignature('')}
                          className='w-full gap-2'
                        >
                          <Upload className='w-4 h-4' />
                          Ganti Gambar
                        </Button>
                      </div>
                    ) : (
                      <label className='cursor-pointer block'>
                        <div className='flex flex-col items-center gap-2 text-gray-500'>
                          <Upload className='w-8 h-8' />
                          <span className='text-sm font-medium'>
                            Klik untuk upload gambar
                          </span>
                          <span className='text-xs'>PNG, JPG (Max. 2MB)</span>
                        </div>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={handleFileUpload}
                          className='hidden'
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className='bg-white border rounded-lg p-6'>
            <div className='flex gap-3'>
              <AlertCircle className='w-5 h-5 text-blue-600 shrink-0 mt-0.5' />
              <div className='text-sm'>
                <p className='font-semibold mb-2'>Tips:</p>
                <ul className='space-y-1 text-gray-600 text-xs'>
                  <li>• Pastikan tanda tangan jelas dan mudah dibaca</li>
                  <li>• Gunakan latar belakang putih untuk hasil terbaik</li>
                  <li>• Tanda tangan akan disimpan dan digunakan untuk dokumen ini</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Document Preview */}
        <div className='lg:col-span-2'>
          <div className='bg-white border rounded-lg p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold'>Preview Dokumen</h2>
            </div>

            {loading ? (
              <div className='flex items-center justify-center h-150 bg-gray-100 rounded-lg'>
                <div className='text-center'>
                  <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
                  <p className='text-gray-600'>Memuat dokumen...</p>
                </div>
              </div>
            ) : pdfUrl ? (
              <div className='space-y-4'>
                <div className='bg-gray-100 rounded-lg overflow-hidden border' style={{ height: '700px' }}>
                  <iframe
                    src={previewWithSignature || pdfUrl}
                    className='w-full h-full'
                    title='Document Preview'
                  />
                </div>
                {(signatureDataUrl || uploadedSignature) && (
                  <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                    <div className='flex items-center gap-2 text-green-800'>
                      <Check className='w-4 h-4' />
                      <span className='text-sm font-medium'>
                        Tanda tangan siap diterapkan pada dokumen
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center justify-center h-150 bg-gray-100 rounded-lg'>
                <p className='text-gray-500'>Tidak ada preview tersedia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
