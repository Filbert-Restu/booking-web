import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Stepper } from '@/shared/components/common/Stepper';
import { Button } from '@/shared/components/ui/button/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FileText, Edit, AlertCircle, Download } from 'lucide-react';
import { documentService } from '@/services/document.service';
import { bookingService } from '@/services/booking.service';
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
          roomCode: undefined,
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
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ttdExecutiveSummary || !ttdLembarPengesahan) {
      alert(
        'Mohon centang konfirmasi bahwa kedua dokumen sudah ditandatangani',
      );
      return;
    }

    try {
      setLoading(true);

      // 1. Submit document to start workflow
      await documentService.submitDocument(formData.document_id!);

      // 2. Create room booking
      await bookingService.createBooking({
        document_id: formData.document_id!,
        room_id: formData.room_id!,
        booking_date: formData.booking_date!,
        start_time: formData.start_time!,
        end_time: formData.end_time!,
        purpose:
          formData.purpose || formData.event_name || 'Peminjaman Ruangan',
        special_requirements: formData.equipment,
        expected_participants: undefined, // Could be added to form if needed
      });

      alert(
        'Peminjaman berhasil diajukan! Dokumen sedang dalam proses persetujuan.',
      );

      // Reset context
      resetFormData();

      // Navigate to peminjaman list
      navigate({ to: '/peminjam/pinjam' });
    } catch (err) {
      console.error('Failed to submit:', err);
      if (err instanceof AxiosError) {
        const errorMsg =
          err.response?.data?.message || 'Gagal mengajukan peminjaman';
        alert(errorMsg);
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
      const response = await api.get(
        `/documents/${formData.document_id}/file/${fileType}`,
        {
          responseType: 'blob',
        },
      );

      const blob = response.data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileType}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Gagal mengunduh file');
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
            {/* Info Box */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex gap-3'>
                <AlertCircle className='h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5' />
                <div className='text-sm text-blue-900'>
                  <p className='font-medium mb-2'>
                    Cara Menandatangani Dokumen:
                  </p>
                  <ol className='list-decimal list-inside space-y-1 text-xs'>
                    <li>
                      Klik "Kelola Tanda Tangan" untuk upload tanda tangan
                      digital Anda
                    </li>
                    <li>
                      Download file Executive Summary dan Lembar Pengesahan
                    </li>
                    <li>
                      Buka file dengan Adobe Acrobat atau aplikasi PDF editor
                    </li>
                    <li>Tambahkan tanda tangan ke dokumen</li>
                    <li>Simpan file yang sudah ditandatangani</li>
                    <li>
                      Upload kembali file yang sudah ditandatangani di halaman
                      Proposal
                    </li>
                    <li>
                      Centang konfirmasi di bawah bahwa dokumen sudah
                      ditandatangani
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Signature Management Button */}
            <div className='border border-gray-200 rounded-lg p-6 bg-gray-50'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900 mb-1'>
                    Tanda Tangan Digital
                  </h3>
                  <p className='text-xs text-gray-600'>
                    Kelola tanda tangan digital Anda yang akan digunakan untuk
                    dokumen
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleEditSignature}
                  className='flex items-center gap-2'
                >
                  <Edit className='h-4 w-4' />
                  Kelola Tanda Tangan
                </Button>
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
                    {formData.document_id && (
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => handleDownloadFile('approval-sheet')}
                        disabled={downloadingFile === 'approval-sheet'}
                        className='text-xs'
                      >
                        <Download className='h-3 w-3 mr-1' />
                        {downloadingFile === 'approval-sheet'
                          ? 'Downloading...'
                          : 'Download'}
                      </Button>
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
                    {formData.document_id && (
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => handleDownloadFile('executive-summary')}
                        disabled={downloadingFile === 'executive-summary'}
                        className='text-xs'
                      >
                        <Download className='h-3 w-3 mr-1' />
                        {downloadingFile === 'executive-summary'
                          ? 'Downloading...'
                          : 'Download'}
                      </Button>
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
                Centang kotak di bawah ini untuk mengkonfirmasi bahwa Anda telah
                menambahkan tanda tangan yang diperlukan:
              </p>

              <div className='space-y-3'>
                <div className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'>
                  <Checkbox
                    id='ttd-lembar-pengesahan'
                    checked={ttdLembarPengesahan}
                    onCheckedChange={(checked) =>
                      setTtdLembarPengesahan(checked as boolean)
                    }
                  />
                  <label
                    htmlFor='ttd-lembar-pengesahan'
                    className='text-sm leading-relaxed cursor-pointer'
                  >
                    Lembar Pengesahan sudah ditandatangani
                  </label>
                </div>

                <div className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'>
                  <Checkbox
                    id='ttd-executive-summary'
                    checked={ttdExecutiveSummary}
                    onCheckedChange={(checked) =>
                      setTtdExecutiveSummary(checked as boolean)
                    }
                  />
                  <label
                    htmlFor='ttd-executive-summary'
                    className='text-sm leading-relaxed cursor-pointer'
                  >
                    Executive Summary sudah ditandatangani
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
