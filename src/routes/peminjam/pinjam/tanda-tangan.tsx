import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Stepper } from '@/shared/components/common/Stepper';
import { Button } from '@/shared/components/ui/button/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Download, RefreshCw } from 'lucide-react';
import { documentService } from '@/services/document.service';
import { bookingService } from '@/services/booking.service';
import { signatureService } from '@/services/signature.service';
import { useBookingContext } from '@/contexts/BookingContext';
import type { Signature } from '@/services/signature.service';
import { SignatureUpload } from '@/shared/components/common/SignatureUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
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
        to: '/peminjam/pinjam',
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

  // Simplified preview state - single document type selector
  type DocumentType = 'proposal' | 'executive-summary' | 'approval-sheet';
  const [selectedDocType, setSelectedDocType] =
    useState<DocumentType>('proposal');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Load user signature on mount
  useEffect(() => {
    const loadSignature = async () => {
      try {
        const sig = await signatureService.getSignature();
        setSignature(sig);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 404) {
            setSignature(null);
          }
        }
      } finally {
        setLoadingSignature(false);
      }
    };

    loadSignature();
  }, []);

  // Load file as PDF blob URL with authentication
  const loadFilePreview = async (fileType: DocumentType) => {
    if (!formData.document_id) return;

    try {
      setPdfLoading(true);
      const apiPath = `/documents/${formData.document_id}/file/${fileType}/pdf`;

      const response = await api.get(apiPath, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          setPdfUrl(null);
        } else {
          alert(
            `Gagal memuat preview: ${error.response?.data?.message || error.message}`,
          );
        }
      }
    } finally {
      setPdfLoading(false);
    }
  };

  // Load preview when document type changes
  useEffect(() => {
    if (formData.document_id && selectedDocType) {
      loadFilePreview(selectedDocType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.document_id, selectedDocType]);

  // Reload signature when SignatureUpload component uploads/updates
  const handleSignatureUploaded = async (sig: Signature) => {
    setSignature(sig);
    setLoadingSignature(false);
  };

  // Generate documents from templates
  const handleGenerateDocuments = async () => {
    if (!formData.document_id) {
      alert('Document ID tidak ditemukan');
      return;
    }

    // Validate signature exists
    if (!signature) {
      alert(
        '⚠️ Tanda Tangan Belum Diupload!\n\n' +
        'Anda harus mengupload tanda tangan terlebih dahulu sebelum generate dokumen.\n\n' +
        'Klik tombol "Refresh" untuk memuat ulang status tanda tangan, atau\n' +
        'Klik tombol "Upload Tanda Tangan" untuk mengupload tanda tangan Anda.',
      );
      return;
    }

    try {
      setGeneratingDocs(true);

      const execSummary = await documentService.generateExecutiveSummary(
        formData.document_id,
      );

      const approvalSheet = await documentService.generateApprovalSheet(
        formData.document_id,
      );

      // Save URLs for download buttons
      setGeneratedUrls({
        executiveSummary: execSummary.download_url,
        approvalSheet: approvalSheet.download_url,
      });

      // Preview will be loaded automatically by useEffect watching generatedUrls

      alert(
        'Dokumen berhasil digenerate!\n\n' +
        'Tanda tangan Anda telah otomatis tertanam di dokumen.\n' +
        'Silakan lihat preview dan download dokumen.',
      );
    } catch (error) {
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

      // 1. Fetch latest document detail (fresh status & content)
      const documentDetail = await documentService.getDocument(
        formData.document_id!,
      );
      const content = (documentDetail.content as any) || {};

      // 2. Build complete booking data (merge context + DB content)
      const bookingData = {
        document_id: formData.document_id!,
        room_id: formData.room_id || content.room_id,
        booking_date: formData.booking_date || content.booking_date,
        start_time: formData.start_time || content.start_time,
        end_time: formData.end_time || content.end_time,
        purpose:
          formData.purpose ||
          formData.event_name ||
          content.purpose ||
          content.event_name ||
          'Peminjaman Ruangan',
        special_requirements: formData.equipment || content.equipment,
        expected_participants: undefined,
      };

      // 3. Update or Create Booking
      const existingBooking = await bookingService.getBookingByDocumentId(
        formData.document_id!,
      );

      if (existingBooking) {
        await bookingService.updateBooking(existingBooking.id, bookingData);
      } else {
        await bookingService.createBooking(bookingData);
      }

      // 4. Finally Submit document if status is DRAFT or REVISION
      if (
        documentDetail.status === 'DRAFT' ||
        documentDetail.status === 'REVISION'
      ) {
        try {
          await documentService.submitDocument(formData.document_id!);
        } catch (submitErr) {
          // If already submitted (e.g. race condition), ignore error and treat as success
          if (
            submitErr instanceof AxiosError &&
            submitErr.response?.status === 400 &&
            submitErr.response?.data?.message?.includes('status IN_PROGRESS')
          ) {
            console.log('Document already submitted, continuing as success...');
          } else {
            throw submitErr;
          }
        }
      }

      alert(
        'Peminjaman berhasil diajukan! 🎉\n\n' +
        'Status: Dokumen sedang dalam proses persetujuan.\n' +
        'Anda bisa memantau perkembangan di halaman "Daftar Peminjaman".',
      );

      // Reset context and navigate
      resetFormData();
      navigate({ to: '/peminjam/pinjam' });
    } catch (err) {
      if (err instanceof AxiosError) {
        const errorMsg =
          err.response?.data?.message || 'Gagal mengajukan peminjaman';
        const validationErrors = err.response?.data?.errors;

        if (validationErrors) {
          const errorDetails = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages}`)
            .join('\n');
          alert(`${errorMsg}\n\nDetail:\n${errorDetails}`);
        } else {
          // Special handling for specific error cases
          if (err.response?.status === 400) {
            alert(
              `❌ Gagal mengajukan dokumen\n\n${errorMsg}\n\n` +
              'Kemungkinan penyebab:\n' +
              '• Dokumen sudah dalam proses persetujuan\n' +
              '• Status dokumen tidak valid untuk diajukan\n' +
              '• Data dokumen belum lengkap\n\n' +
              'Silakan cek kembali atau hubungi administrator.',
            );
          } else {
            alert(`❌ Error: ${errorMsg}`);
          }
        }
      } else {
        alert('Terjadi kesalahan tidak dikenal saat mengajukan peminjaman');
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

  const steps = [
    { number: 1, title: 'Detail Tempat' },
    { number: 2, title: 'Proposal' },
    { number: 3, title: 'Tanda Tangan' },
  ];

  return (
    <div className='space-y-3'>
      <Stepper steps={steps} currentStep={3} />

      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Tanda Tangan
          </h2>

          <div className='space-y-6'>
            {/* Signature Upload Component */}
            <SignatureUpload
              onSignatureUploaded={handleSignatureUploaded}
              className='border border-gray-200 rounded-lg'
            />

            {/* Generate Documents Button */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex-1'>
                  <h3 className='text-sm font-medium text-gray-900'>
                    Generate Dokumen
                  </h3>
                  <p className='text-xs text-gray-600 mt-1'>
                    Generate Executive Summary dan Lembar Pengesahan dengan
                    tanda tangan
                  </p>
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
                  className='bg-green-600 hover:bg-green-700 disabled:opacity-50'
                >
                  {generatingDocs ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </div>

            {/* Preview Dokumen - Simplified like SignDocumentContent */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-sm font-medium text-gray-900'>
                  Preview Dokumen
                </h3>
                <Select
                  value={selectedDocType}
                  onValueChange={(val) =>
                    setSelectedDocType(val as DocumentType)
                  }
                >
                  <SelectTrigger className='w-50'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='proposal'>Proposal</SelectItem>
                    <SelectItem value='executive-summary'>
                      Executive Summary
                    </SelectItem>
                    <SelectItem value='approval-sheet'>
                      Lembar Pengesahan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview PDF */}
              {pdfLoading && (
                <div className='flex items-center justify-center h-150 border rounded-lg bg-gray-50'>
                  <div className='text-center text-gray-500'>
                    <RefreshCw className='h-8 w-8 mx-auto mb-2 animate-spin' />
                    <p className='text-sm'>Memuat dokumen...</p>
                  </div>
                </div>
              )}
              {!pdfLoading && pdfUrl && (
                <div className='border rounded-lg overflow-hidden'>
                  <iframe
                    src={pdfUrl}
                    className='w-full h-150'
                    title='Document Preview'
                  />
                </div>
              )}
              {!pdfLoading && !pdfUrl && (
                <div className='flex items-center justify-center h-150 border rounded-lg bg-gray-50'>
                  <p className='text-sm text-gray-500'>
                    {selectedDocType === 'proposal'
                      ? 'Proposal tidak tersedia'
                      : 'Dokumen belum digenerate'}
                  </p>
                </div>
              )}

              {/* Download Button */}
              {pdfUrl && (
                <div className='mt-4'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      if (selectedDocType === 'proposal') {
                        handleDownloadFile('proposal');
                      } else if (selectedDocType === 'executive-summary') {
                        if (generatedUrls.executiveSummary) {
                          handleDownloadGenerated(
                            generatedUrls.executiveSummary,
                            `executive-summary-${formData.document_id}.docx`,
                          );
                        }
                      } else if (selectedDocType === 'approval-sheet') {
                        if (generatedUrls.approvalSheet) {
                          handleDownloadGenerated(
                            generatedUrls.approvalSheet,
                            `lembar-pengesahan-${formData.document_id}.docx`,
                          );
                        }
                      }
                    }}
                    disabled={downloadingFile !== null}
                    className='w-full'
                  >
                    <Download className='h-4 w-4 mr-2' />
                    {downloadingFile !== null
                      ? 'Downloading...'
                      : `Download ${selectedDocType === 'proposal' ? 'Proposal' : selectedDocType === 'executive-summary' ? 'Executive Summary' : 'Lembar Pengesahan'}`}
                  </Button>
                </div>
              )}
            </div>

            {/* Konfirmasi Dokumen */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <h3 className='text-sm font-medium text-gray-900 mb-3'>
                Konfirmasi Dokumen
              </h3>

              <div className='space-y-2'>
                <div className='flex items-center space-x-3'>
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
                    className={`text-sm cursor-pointer ${!generatedUrls.approvalSheet ? 'text-gray-400' : ''}`}
                  >
                    Lembar Pengesahan sudah digenerate
                  </label>
                </div>

                <div className='flex items-center space-x-3'>
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
                    className={`text-sm cursor-pointer ${!generatedUrls.executiveSummary ? 'text-gray-400' : ''}`}
                  >
                    Executive Summary sudah digenerate
                  </label>
                </div>
              </div>
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
