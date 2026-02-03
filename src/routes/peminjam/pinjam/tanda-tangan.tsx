import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Stepper } from '@/shared/components/common/Stepper';
import { Button } from '@/shared/components/ui/button/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FileText, Edit, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { documentService } from '@/services/document.service';
import { bookingService } from '@/services/booking.service';
import { signatureService } from '@/services/signature.service';
import { useBookingContext } from '@/contexts/BookingContext';
import { SignatureUpload } from '@/shared/components/common/SignatureUpload';
import type { Signature } from '@/services/signature.service';
import api from '@/lib/axios';

export const Route = createFileRoute('/peminjam/pinjam/tanda-tangan')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { formData, resetFormData } = useBookingContext();

  // Redirect if no document_id (user skipped previous steps)
  useEffect(() => {
    if (!formData.document_id) {
      navigate({
        to: '/peminjam/pinjam/detail-tempat',
        search: {
          editId: undefined,
          roomId: undefined,
          bookingDate: undefined,
          startTime: undefined,
          endTime: undefined,
          purpose: undefined,
          ketuaNama: undefined,
          ketuaNim: undefined,
          ketuaHp: undefined,
        },
      });
    }
  }, [formData.document_id, navigate]);

  // State untuk checkbox konfirmasi tanda tangan
  const [ttdExecutiveSummary, setTtdExecutiveSummary] = useState(false);
  const [ttdLembarPengesahan, setTtdLembarPengesahan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<Signature | null>(null);
  const [loadingSignature, setLoadingSignature] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [generatingDocs, setGeneratingDocs] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<{
    executiveSummary?: string;
    approvalSheet?: string;
  }>({});

  // Load user signature on mount
  useEffect(() => {
    const loadSignature = async () => {
      try {
        console.log('📥 [SIGNATURE] Loading signature...');
        const sig = await signatureService.getSignature();
        setSignature(sig);
        console.log('✅ [SIGNATURE] Signature loaded:', sig);
      } catch (error) {
        console.error('❌ [SIGNATURE] Failed to load signature:', error);
      } finally {
        setLoadingSignature(false);
      }
    };

    loadSignature();
  }, []);

  // Manual reload signature
  const handleReloadSignature = async () => {
    try {
      setLoadingSignature(true);
      console.log('🔄 [SIGNATURE] Manually reloading signature...');
      const sig = await signatureService.getSignature();
      setSignature(sig);
      console.log('✅ [SIGNATURE] Signature reloaded:', sig);
      if (sig) {
        alert(
          '✅ Tanda tangan berhasil dimuat!\n\nAnda bisa generate dokumen sekarang.',
        );
      } else {
        alert(
          '⚠️ Tanda tangan tidak ditemukan.\n\nSilakan upload tanda tangan terlebih dahulu.',
        );
      }
    } catch (error) {
      console.error('❌ [SIGNATURE] Failed to reload:', error);
      alert(
        '❌ Gagal memuat tanda tangan.\n\nSilakan refresh halaman atau coba lagi.',
      );
    } finally {
      setLoadingSignature(false);
    }
  };

  // Generate documents from templates
  const handleGenerateDocuments = async () => {
    if (!formData.document_id) {
      alert('Document ID tidak ditemukan');
      return;
    }

    // Validate signature exists
    if (!signature) {
      console.error('❌ [GENERATE] No signature found');
      console.error('📊 [GENERATE] Debug info:', {
        signature,
        loadingSignature,
        document_id: formData.document_id,
      });
      alert(
        '⚠️ Tanda Tangan Belum Diupload!\n\n' +
          'Anda harus mengupload tanda tangan terlebih dahulu sebelum generate dokumen.\n\n' +
          'Klik tombol "Refresh" untuk memuat ulang status tanda tangan, atau\n' +
          'Klik tombol "Upload Tanda Tangan" untuk mengupload tanda tangan Anda.',
      );
      return;
    }

    console.log('✅ [GENERATE] Signature found, proceeding with generation');
    console.log('📊 [GENERATE] Signature info:', {
      id: signature.id,
      user_id: signature.user_id,
      signature: signature.signature,
    });

    try {
      setGeneratingDocs(true);

      console.log('📄 [GENERATE] Generating documents from templates...');
      console.log('🔑 [GENERATE] User has signature:', signature.id);

      // Generate executive summary
      console.log('📄 [GENERATE] Generating executive summary...');
      const execSummary = await documentService.generateExecutiveSummary(
        formData.document_id,
      );
      console.log('✅ [GENERATE] Executive summary generated:', execSummary);

      // Generate approval sheet
      console.log('📄 [GENERATE] Generating approval sheet...');
      const approvalSheet = await documentService.generateApprovalSheet(
        formData.document_id,
      );
      console.log('✅ [GENERATE] Approval sheet generated:', approvalSheet);

      // Save URLs for download buttons
      setGeneratedUrls({
        executiveSummary: execSummary.download_url,
        approvalSheet: approvalSheet.download_url,
      });

      alert(
        'Dokumen berhasil digenerate!\n\n' +
          'Tanda tangan Anda telah otomatis tertanam di dokumen.\n' +
          'Silakan download dan verifikasi dokumen.',
      );
    } catch (error) {
      console.error('❌ [GENERATE] Failed to generate documents:', error);
      if (error instanceof AxiosError) {
        const errorMsg = error.response?.data?.message || error.message;
        alert(`❌ Gagal generate dokumen\n\n${errorMsg}`);
      } else {
        alert('Gagal generate dokumen');
      }
    } finally {
      setGeneratingDocs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if documents are generated
    if (!generatedUrls.executiveSummary || !generatedUrls.approvalSheet) {
      alert(
        '⚠️ Dokumen Belum Digenerate!\n\n' +
          'Anda harus generate dokumen terlebih dahulu:\n' +
          '1. Pastikan tanda tangan sudah diupload\n' +
          '2. Klik tombol "Generate Dokumen" (hijau)\n' +
          '3. Download dan verifikasi dokumen\n' +
          '4. Centang konfirmasi\n' +
          '5. Baru ajukan peminjaman',
      );
      return;
    }

    if (!ttdExecutiveSummary || !ttdLembarPengesahan) {
      alert(
        '⚠️ Konfirmasi Belum Lengkap!\n\n' +
          'Mohon centang kedua konfirmasi:\n' +
          '✓ Lembar Pengesahan sudah digenerate\n' +
          '✓ Executive Summary sudah digenerate\n\n' +
          'Pastikan Anda sudah download dan verifikasi bahwa tanda tangan muncul di dokumen.',
      );
      return;
    }

    try {
      setLoading(true);

      console.log('🚀 [SUBMIT] Starting submission process...');
      console.log('📋 [SUBMIT] formData:', formData);
      console.log('🔑 [SUBMIT] document_id:', formData.document_id);
      console.log('🏠 [SUBMIT] room_id:', formData.room_id);
      console.log('📅 [SUBMIT] booking_date:', formData.booking_date);
      console.log('⏰ [SUBMIT] start_time:', formData.start_time);
      console.log('⏰ [SUBMIT] end_time:', formData.end_time);

      // CRITICAL: Get booking data from document content if not in formData
      let bookingData;
      if (!formData.room_id || !formData.booking_date) {
        console.warn(
          '⚠️ [SUBMIT] Booking data not in context, fetching from document...',
        );
        const documentDetail = await documentService.getDocument(
          formData.document_id!,
        );
        const content = documentDetail.content as any;

        console.log('📄 [SUBMIT] Document content:', content);

        bookingData = {
          document_id: formData.document_id!,
          room_id: content.room_id || formData.room_id!,
          booking_date: content.booking_date || formData.booking_date!,
          start_time: content.start_time || formData.start_time!,
          end_time: content.end_time || formData.end_time!,
          purpose:
            content.purpose ||
            formData.purpose ||
            formData.event_name ||
            'Peminjaman Ruangan',
          special_requirements: content.equipment || formData.equipment,
          expected_participants: undefined,
        };
      } else {
        bookingData = {
          document_id: formData.document_id!,
          room_id: formData.room_id!,
          booking_date: formData.booking_date!,
          start_time: formData.start_time!,
          end_time: formData.end_time!,
          purpose:
            formData.purpose || formData.event_name || 'Peminjaman Ruangan',
          special_requirements: formData.equipment,
          expected_participants: undefined,
        };
      }

      console.log('📤 [SUBMIT] Final booking data:', bookingData);

      console.log('📤 [SUBMIT] Final booking data:', bookingData);

      // 1. Check document status first
      console.log('🔍 [SUBMIT] Checking document status...');
      const documentDetail = await documentService.getDocument(
        formData.document_id!,
      );
      console.log('📄 [SUBMIT] Document status:', documentDetail.status);

      // Only submit if document is still in DRAFT status
      if (documentDetail.status === 'DRAFT') {
        console.log('📤 [SUBMIT] Submitting document...');
        await documentService.submitDocument(formData.document_id!);
        console.log('✅ [SUBMIT] Document submitted successfully');
      } else {
        console.log(
          '⚠️ [SUBMIT] Document already submitted, skipping submit step',
        );
      }

      // 2. Create room booking with data from document content
      console.log('📤 [SUBMIT] Creating booking with data:', bookingData);
      await bookingService.createBooking(bookingData);
      console.log('✅ [SUBMIT] Booking created successfully');

      alert(
        'Peminjaman berhasil diajukan! Dokumen sedang dalam proses persetujuan.',
      );

      // Reset context
      resetFormData();

      // Navigate to peminjaman list
      navigate({ to: '/peminjam/pinjam' });
    } catch (err) {
      console.error('❌ [SUBMIT] Failed to submit:', err);
      if (err instanceof AxiosError) {
        console.error('❌ [SUBMIT] Error response:', err.response?.data);
        console.error(
          '❌ [SUBMIT] Error response (JSON):',
          JSON.stringify(err.response?.data, null, 2),
        );
        console.error('❌ [SUBMIT] Error status:', err.response?.status);
        console.error('❌ [SUBMIT] Error config:', err.config);
        console.error('❌ [SUBMIT] Request URL:', err.config?.url);
        console.error('❌ [SUBMIT] Request data:', err.config?.data);

        const errorMsg =
          err.response?.data?.message || 'Gagal mengajukan peminjaman';
        const validationErrors = err.response?.data?.errors;

        if (validationErrors) {
          console.error('❌ [SUBMIT] Validation errors:', validationErrors);
          const errorDetails = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages}`)
            .join('\n');
          alert(`${errorMsg}\n\nDetail:\n${errorDetails}`);
        } else {
          alert(errorMsg);
        }
      } else {
        alert('Terjadi kesalahan saat mengajukan peminjaman');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check apakah semua tanda tangan sudah dilengkapi
  const isAllSignaturesComplete = ttdExecutiveSummary && ttdLembarPengesahan;

  const handleBack = () => {
    navigate({ to: '/peminjam/pinjam/proposal' });
  };

  const handleDownloadFile = async (
    fileType: 'proposal' | 'executive-summary' | 'approval-sheet',
  ) => {
    if (!formData.document_id) return;

    try {
      setDownloadingFile(fileType);

      // Extract path from URL if it's a full URL
      const apiPath = `/documents/${formData.document_id}/file/${fileType}`;

      const response = await api.get(apiPath, {
        responseType: 'blob',
      });

      const blob = response.data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileType}-${formData.document_id}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      if (error instanceof AxiosError) {
        alert(
          `Gagal mengunduh file: ${error.response?.data?.message || error.message}`,
        );
      } else {
        alert('Gagal mengunduh file');
      }
    } finally {
      setDownloadingFile(null);
    }
  };

  // Download generated documents with authentication
  const handleDownloadGenerated = async (url: string, filename: string) => {
    try {
      setDownloadingFile(filename);

      // Extract API path from full URL (remove /api prefix since axios baseURL includes it)
      let apiPath = url;
      try {
        const urlObj = new URL(url);
        apiPath = urlObj.pathname.replace(/^\/api/, '');
      } catch {
        // Already a relative path
      }

      const response = await api.get(apiPath, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download generated file:', error);
      if (error instanceof AxiosError) {
        alert(
          `Gagal mengunduh file: ${error.response?.data?.message || error.message}`,
        );
      } else {
        alert('Gagal mengunduh file');
      }
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleEditSignature = () => {
    // Navigate to global signature management page
    navigate({
      to: '/tanda-tangan',
      search: {
        return: '/peminjam/pinjam/tanda-tangan',
      },
    });
  };

  // Reload signature when user returns to this page
  useEffect(() => {
    const reloadSignature = async () => {
      try {
        setLoadingSignature(true);
        const sig = await signatureService.getSignature();
        setSignature(sig);
        console.log('🔄 [SIGNATURE] Reloaded signature:', sig);
      } catch (error) {
        console.error('❌ [SIGNATURE] Failed to reload:', error);
      } finally {
        setLoadingSignature(false);
      }
    };

    // Listen for focus event (when user returns to this tab/page)
    window.addEventListener('focus', reloadSignature);

    return () => {
      window.removeEventListener('focus', reloadSignature);
    };
  }, []);

  const steps = [
    { number: 1, title: 'Detail Tempat' },
    { number: 2, title: 'Proposal' },
    { number: 3, title: 'Tanda Tangan' },
  ];

  return (
    <div className='space-y-6'>
      <Stepper steps={steps} currentStep={3} />

      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Tanda Tangan
          </h2>

          <div className='space-y-6'>
            {/* Generate Documents Button */}
            <div className='border border-green-200 rounded-lg p-6 bg-green-50'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-green-900 mb-1'>
                    Generate Dokumen dari Template
                  </h3>
                  <p className='text-xs text-green-700'>
                    Generate Executive Summary dan Lembar Pengesahan otomatis
                    dari template. Tanda tangan Anda sebagai pengaju akan
                    otomatis tertanam di dokumen.
                  </p>
                  {loadingSignature ? (
                    <p className='text-xs text-gray-500 mt-1'>
                      Memeriksa tanda tangan...
                    </p>
                  ) : signature ? (
                    <p className='text-xs text-green-600 mt-1 font-medium'>
                      ✅ Tanda tangan tersedia - Siap generate!
                    </p>
                  ) : (
                    <p className='text-xs text-red-600 mt-1 font-medium'>
                      ⚠️ Tanda tangan belum diupload - Upload dulu sebelum
                      generate!
                    </p>
                  )}
                </div>
                <Button
                  type='button'
                  onClick={handleGenerateDocuments}
                  disabled={
                    generatingDocs ||
                    !formData.document_id ||
                    loadingSignature ||
                    !signature
                  }
                  className='flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50'
                >
                  <FileText className='h-4 w-4' />
                  {generatingDocs ? 'Generating...' : 'Generate Dokumen'}
                </Button>
              </div>
              {generatedUrls.executiveSummary && (
                <div className='mt-4 pt-4 border-t border-green-300'>
                  <p className='text-xs text-green-900 font-medium mb-2'>
                    ✅ Dokumen berhasil digenerate!
                  </p>
                  <div className='flex gap-2'>
                    <button
                      onClick={() =>
                        handleDownloadGenerated(
                          generatedUrls.executiveSummary!,
                          `executive-summary-${formData.document_id}.docx`,
                        )
                      }
                      disabled={downloadingFile !== null}
                      className='text-xs text-green-700 underline hover:text-green-900 disabled:opacity-50'
                    >
                      {downloadingFile?.includes('executive')
                        ? 'Downloading...'
                        : 'Download Executive Summary'}
                    </button>
                    <span className='text-green-300'>|</span>
                    <button
                      onClick={() =>
                        handleDownloadGenerated(
                          generatedUrls.approvalSheet!,
                          `lembar-pengesahan-${formData.document_id}.docx`,
                        )
                      }
                      disabled={downloadingFile !== null}
                      className='text-xs text-green-700 underline hover:text-green-900 disabled:opacity-50'
                    >
                      {downloadingFile?.includes('lembar')
                        ? 'Downloading...'
                        : 'Download Lembar Pengesahan'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex gap-3'>
                <AlertCircle className='h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5' />
                <div className='text-sm text-blue-900'>
                  <p className='font-medium mb-2'>
                    Langkah-langkah Generate Dokumen dengan Tanda Tangan:
                  </p>
                  <ol className='list-decimal list-inside space-y-2 text-xs'>
                    <li>
                      <strong>Upload Tanda Tangan (WAJIB):</strong>
                      <br />
                      <span className='ml-5'>
                        • Klik tombol "{!signature ? 'Upload' : 'Kelola'} Tanda
                        Tangan" di bawah
                        <br />• Upload gambar tanda tangan Anda (PNG/JPG)
                        <br />• Klik Simpan
                        <br />• Kembali ke halaman ini (browser akan otomatis
                        reload status)
                      </span>
                    </li>
                    <li>
                      <strong>Verifikasi Tanda Tangan:</strong>
                      <br />
                      <span className='ml-5'>
                        • Pastikan muncul tanda "✅ Tanda tangan sudah diupload"
                        <br />• Jika belum muncul, klik tombol "Refresh"
                      </span>
                    </li>
                    <li>
                      <strong>Generate Dokumen:</strong>
                      <br />
                      <span className='ml-5'>
                        • Klik tombol "Generate Dokumen" (hijau)
                        <br />• Tanda tangan Anda akan otomatis tertanam di
                        dokumen
                      </span>
                    </li>
                    <li>
                      <strong>Download & Verifikasi:</strong>
                      <br />
                      <span className='ml-5'>
                        • Download dokumen yang sudah digenerate
                        <br />• Buka dengan Microsoft Word untuk verifikasi TTD
                        muncul
                      </span>
                    </li>
                    <li className='text-gray-600 italic'>
                      Catatan: Tanda tangan approver akan ditambahkan otomatis
                      setelah mereka menyetujui dokumen
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Signature Management Button */}
            <div
              className={`border rounded-lg p-6 ${
                !signature
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <h3
                    className={`text-sm font-medium mb-1 ${
                      !signature ? 'text-orange-900' : 'text-gray-900'
                    }`}
                  >
                    Tanda Tangan Digital
                    {!signature && ' - WAJIB'}
                  </h3>
                  <p
                    className={`text-xs ${
                      !signature ? 'text-orange-700' : 'text-gray-600'
                    }`}
                  >
                    {!signature
                      ? '⚠️ Anda harus mengupload tanda tangan sebelum generate dokumen'
                      : 'Kelola tanda tangan digital Anda yang akan digunakan untuk dokumen'}
                  </p>
                  {signature && (
                    <p className='text-xs text-green-600 mt-1 font-medium'>
                      ✅ Tanda tangan sudah diupload (ID: {signature.id})
                    </p>
                  )}
                </div>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleReloadSignature}
                    disabled={loadingSignature}
                    className='flex items-center gap-2'
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loadingSignature ? 'animate-spin' : ''}`}
                    />
                    {loadingSignature ? 'Loading...' : 'Refresh'}
                  </Button>
                  <Button
                    type='button'
                    variant={!signature ? 'default' : 'outline'}
                    onClick={handleEditSignature}
                    className={`flex items-center gap-2 ${
                      !signature ? 'bg-orange-600 hover:bg-orange-700' : ''
                    }`}
                  >
                    <Edit className='h-4 w-4' />
                    {!signature ? 'Upload Tanda Tangan' : 'Kelola Tanda Tangan'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview & Download Dokumen */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Download Lembar Pengesahan */}
              <div className='border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <FileText className='h-4 w-4 text-gray-600' />
                  <h3 className='text-sm font-medium text-gray-900'>
                    Lembar Pengesahan
                  </h3>
                </div>
                <div className='bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[200px] flex items-center justify-center'>
                  <div className='text-center text-gray-500'>
                    <FileText className='h-12 w-12 mx-auto mb-2 opacity-50' />
                    <p className='text-xs mb-3'>
                      {formData.event_name || 'Peminjaman Ruangan'}
                    </p>
                    {generatedUrls.approvalSheet ? (
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          handleDownloadGenerated(
                            generatedUrls.approvalSheet!,
                            `lembar-pengesahan-${formData.document_id}.docx`,
                          )
                        }
                        disabled={downloadingFile !== null}
                        className='text-xs bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                      >
                        <Download className='h-3 w-3 mr-1' />
                        {downloadingFile?.includes('lembar')
                          ? 'Downloading...'
                          : 'Download (Generated)'}
                      </Button>
                    ) : (
                      <div className='text-xs'>
                        <p className='text-gray-400 mb-2'>Belum digenerate</p>
                        <p className='text-orange-600 font-medium'>
                          ⬆️ Klik "Generate Dokumen" dulu
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Executive Summary */}
              <div className='border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <FileText className='h-4 w-4 text-gray-600' />
                  <h3 className='text-sm font-medium text-gray-900'>
                    Executive Summary
                  </h3>
                </div>
                <div className='bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[200px] flex items-center justify-center'>
                  <div className='text-center text-gray-500'>
                    <FileText className='h-12 w-12 mx-auto mb-2 opacity-50' />
                    <p className='text-xs mb-1'>Ruang: {formData.room_code}</p>
                    <p className='text-xs mb-3'>
                      Tanggal: {formData.booking_date}
                    </p>
                    {generatedUrls.executiveSummary ? (
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          handleDownloadGenerated(
                            generatedUrls.executiveSummary!,
                            `executive-summary-${formData.document_id}.docx`,
                          )
                        }
                        disabled={downloadingFile !== null}
                        className='text-xs bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                      >
                        <Download className='h-3 w-3 mr-1' />
                        {downloadingFile?.includes('executive')
                          ? 'Downloading...'
                          : 'Download (Generated)'}
                      </Button>
                    ) : (
                      <div className='text-xs'>
                        <p className='text-gray-400 mb-2'>Belum digenerate</p>
                        <p className='text-orange-600 font-medium'>
                          ⬆️ Klik "Generate Dokumen" dulu
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Konfirmasi Tanda Tangan */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <h3 className='text-sm font-medium text-gray-900 mb-4'>
                Konfirmasi Tanda Tangan
              </h3>
              <p className='text-xs text-gray-600 mb-4'>
                Centang kotak di bawah ini untuk mengkonfirmasi bahwa dokumen
                sudah digenerate dengan tanda tangan Anda tertanam di dalamnya:
              </p>

              <div className='space-y-3'>
                <div className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'>
                  <Checkbox
                    id='ttd-lembar-pengesahan'
                    checked={ttdLembarPengesahan}
                    onCheckedChange={(checked) =>
                      setTtdLembarPengesahan(checked as boolean)
                    }
                    disabled={!generatedUrls.approvalSheet}
                  />
                  <label
                    htmlFor='ttd-lembar-pengesahan'
                    className={`text-sm leading-relaxed cursor-pointer ${!generatedUrls.approvalSheet ? 'text-gray-400' : ''}`}
                  >
                    Lembar Pengesahan sudah digenerate dengan tanda tangan saya
                    {!generatedUrls.approvalSheet && (
                      <span className='block text-xs text-orange-600 mt-1'>
                        ⚠️ Generate dokumen terlebih dahulu
                      </span>
                    )}
                  </label>
                </div>

                <div className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'>
                  <Checkbox
                    id='ttd-executive-summary'
                    checked={ttdExecutiveSummary}
                    onCheckedChange={(checked) =>
                      setTtdExecutiveSummary(checked as boolean)
                    }
                    disabled={!generatedUrls.executiveSummary}
                  />
                  <label
                    htmlFor='ttd-executive-summary'
                    className={`text-sm leading-relaxed cursor-pointer ${!generatedUrls.executiveSummary ? 'text-gray-400' : ''}`}
                  >
                    Executive Summary sudah digenerate dengan tanda tangan saya
                    {!generatedUrls.executiveSummary && (
                      <span className='block text-xs text-orange-600 mt-1'>
                        ⚠️ Generate dokumen terlebih dahulu
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {!isAllSignaturesComplete && (
                <p className='text-xs text-red-600 mt-3'>
                  ⚠️ Harap centang kedua konfirmasi di atas sebelum mengajukan
                  peminjaman
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className='flex justify-between gap-4 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleBack}
                disabled={loading}
              >
                Kembali
              </Button>
              <Button
                type='submit'
                onClick={handleSubmit}
                disabled={!isAllSignaturesComplete || loading}
              >
                {loading ? 'Mengajukan...' : 'Ajukan Peminjaman'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
