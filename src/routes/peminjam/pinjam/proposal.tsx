import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosError } from 'axios';
import { Stepper } from '@/shared/components/common/Stepper';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button/button';
import { documentService } from '@/services/document.service';
import { useBookingContext } from '@/contexts/BookingContext';

export const Route = createFileRoute('/peminjam/pinjam/proposal')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useBookingContext();

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

  // Nama kegiatan TIDAK auto-fill (user harus isi manual)
  const [namaKegiatan, setNamaKegiatan] = useState(formData.event_name || '');
  const [sifat, setSifat] = useState(formData.event_nature || '');
  const [bentuk, setBentuk] = useState(formData.event_form || '');
  const [tujuan, setTujuan] = useState(formData.objectives || '');
  const [manfaat, setManfaat] = useState(formData.benefits || '');
  const [sasaran, setSasaran] = useState(formData.target_audience || '');
  const [tempat, setTempat] = useState(formData.location || '');
  const [alat, setAlat] = useState(formData.equipment || '');
  const [undangan, setUndangan] = useState(formData.invitations || '');
  const [proposalFile, setProposalFile] = useState<File | null>(
    formData.proposal_file || null,
  );

  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = [
    { number: 1, title: 'Detail Tempat' },
    { number: 2, title: 'Proposal' },
    { number: 3, title: 'Tanda Tangan' },
  ];

  // Autosave function
  const autoSave = useCallback(async () => {
    if (!formData.document_id) return;

    try {
      setAutoSaving(true);

      const data = new FormData();

      // Title
      if (namaKegiatan.trim()) {
        data.append('title', namaKegiatan);
      }

      const contentData: any = {};

      // Data dari step sebelumnya
      if (formData.ketua_pelaksana_nama)
        contentData.ketua_pelaksana_nama = formData.ketua_pelaksana_nama;
      if (formData.ketua_pelaksana_nim)
        contentData.ketua_pelaksana_nim = formData.ketua_pelaksana_nim;
      if (formData.ketua_pelaksana_hp)
        contentData.ketua_pelaksana_hp = formData.ketua_pelaksana_hp;
      if (formData.room_id !== undefined)
        contentData.room_id = formData.room_id;
      if (formData.room_code) contentData.room_code = formData.room_code;
      if (formData.booking_date)
        contentData.booking_date = formData.booking_date;
      if (formData.start_time) contentData.start_time = formData.start_time;
      if (formData.end_time) contentData.end_time = formData.end_time;
      if (formData.purpose) contentData.purpose = formData.purpose;

      // Data proposal (step 2)
      if (namaKegiatan.trim()) contentData.event_name = namaKegiatan;
      if (sifat.trim()) contentData.event_nature = sifat;
      if (bentuk.trim()) contentData.event_form = bentuk;
      if (tujuan.trim()) contentData.objectives = tujuan;
      if (manfaat.trim()) contentData.benefits = manfaat;
      if (sasaran.trim()) contentData.target_audience = sasaran;
      if (tempat.trim()) contentData.location = tempat;
      if (alat.trim()) contentData.equipment = alat;
      if (undangan.trim()) contentData.invitations = undangan;

      const userName = localStorage.getItem('userName');
      if (userName) contentData.peminjam_nama = userName;

      Object.keys(contentData).forEach((key) => {
        data.append(`content[${key}]`, contentData[key]);
      });

      data.append('meta_data[type]', 'room_reservation');
      data.append('meta_data[step]', 'proposal');

      await documentService.updateDocument(formData.document_id, data);

      // Update context
      updateFormData({
        event_name: namaKegiatan,
        event_nature: sifat,
        event_form: bentuk,
        objectives: tujuan,
        benefits: manfaat,
        target_audience: sasaran,
        location: tempat,
        equipment: alat,
        invitations: undangan,
      });

      console.log('✅ Autosave berhasil');
    } catch (err) {
      console.error('❌ Autosave gagal:', err);
    } finally {
      setAutoSaving(false);
    }
  }, [
    formData,
    namaKegiatan,
    sifat,
    bentuk,
    tujuan,
    manfaat,
    sasaran,
    tempat,
    alat,
    undangan,
    updateFormData,
  ]);

  // Debounced autosave effect
  useEffect(() => {
    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for autosave (2 seconds after user stops typing)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 60000);

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    namaKegiatan,
    sifat,
    bentuk,
    tujuan,
    manfaat,
    sasaran,
    tempat,
    alat,
    undangan,
    autoSave,
  ]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaKegiatan || !tujuan) {
      alert('Mohon isi minimal Nama Kegiatan dan Tujuan');
      return;
    }

    try {
      setLoading(true);

      // Update document with proposal data using FormData to support file upload
      const data = new FormData();
      data.append('title', namaKegiatan);

      // Content fields - kirim yang ada valuenya (termasuk angka 0)
      const contentData: any = {};

      // Ambil data dari step sebelumnya (detail tempat)
      if (
        formData.ketua_pelaksana_nama !== undefined &&
        formData.ketua_pelaksana_nama !== null &&
        formData.ketua_pelaksana_nama !== ''
      ) {
        contentData.ketua_pelaksana_nama = formData.ketua_pelaksana_nama;
      }
      if (
        formData.ketua_pelaksana_nim !== undefined &&
        formData.ketua_pelaksana_nim !== null &&
        formData.ketua_pelaksana_nim !== ''
      ) {
        contentData.ketua_pelaksana_nim = formData.ketua_pelaksana_nim;
      }
      if (
        formData.ketua_pelaksana_hp !== undefined &&
        formData.ketua_pelaksana_hp !== null &&
        formData.ketua_pelaksana_hp !== ''
      ) {
        contentData.ketua_pelaksana_hp = formData.ketua_pelaksana_hp;
      }
      if (formData.room_id !== undefined && formData.room_id !== null) {
        contentData.room_id = formData.room_id;
      }
      if (
        formData.room_code !== undefined &&
        formData.room_code !== null &&
        formData.room_code !== ''
      ) {
        contentData.room_code = formData.room_code;
      }
      if (
        formData.booking_date !== undefined &&
        formData.booking_date !== null &&
        formData.booking_date !== ''
      ) {
        contentData.booking_date = formData.booking_date;
      }
      if (
        formData.start_time !== undefined &&
        formData.start_time !== null &&
        formData.start_time !== ''
      ) {
        contentData.start_time = formData.start_time;
      }
      if (
        formData.end_time !== undefined &&
        formData.end_time !== null &&
        formData.end_time !== ''
      ) {
        contentData.end_time = formData.end_time;
      }
      if (
        formData.purpose !== undefined &&
        formData.purpose !== null &&
        formData.purpose !== ''
      ) {
        contentData.purpose = formData.purpose;
      }

      if (namaKegiatan.trim()) contentData.event_name = namaKegiatan;
      if (sifat.trim()) contentData.event_nature = sifat;
      if (bentuk.trim()) contentData.event_form = bentuk;
      if (tujuan.trim()) contentData.objectives = tujuan;
      if (manfaat.trim()) contentData.benefits = manfaat;
      if (sasaran.trim()) contentData.target_audience = sasaran;
      if (tempat.trim()) contentData.location = tempat;
      if (alat.trim()) contentData.equipment = alat;
      if (undangan.trim()) contentData.invitations = undangan;

      // Tambah info peminjam
      const userName = localStorage.getItem('userName');
      if (userName) contentData.peminjam_nama = userName;

      // Append content fields to FormData
      Object.keys(contentData).forEach((key) => {
        data.append(`content[${key}]`, contentData[key]);
      });

      // Append proposal file if exists
      if (proposalFile) {
        // Backend expects field name `proposal` (see DocumentController validation)
        data.append('proposal', proposalFile);
      }

      // Meta data
      data.append('meta_data[type]', 'room_reservation');
      data.append('meta_data[step]', 'proposal');

      await documentService.updateDocument(formData.document_id!, data);

      // Save to context
      updateFormData({
        event_name: namaKegiatan,
        event_nature: sifat,
        event_form: bentuk,
        objectives: tujuan,
        benefits: manfaat,
        target_audience: sasaran,
        location: tempat,
        equipment: alat,
        invitations: undangan,
        proposal_file: proposalFile,
      });

      // Navigate to next step
      navigate({ to: '/peminjam/pinjam/tanda-tangan' });
    } catch (err) {
      console.error('Failed to update document:', err);
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Gagal menyimpan proposal');
      } else {
        alert('Terjadi kesalahan saat menyimpan proposal');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Save current data to context before going back
    updateFormData({
      event_name: namaKegiatan,
      event_nature: sifat,
      event_form: bentuk,
      objectives: tujuan,
      benefits: manfaat,
      target_audience: sasaran,
      location: tempat,
      equipment: alat,
      invitations: undangan,
      proposal_file: proposalFile,
    });
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
  };

  return (
    <div className='space-y-6'>
      <Stepper steps={steps} currentStep={2} />

      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Proposal</h2>
            {autoSaving && (
              <span className='text-sm text-gray-500'>Menyimpan...</span>
            )}
          </div>

          <form onSubmit={handleNext} className='space-y-4'>
            {/* Form Fields */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nama Kegiatan <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={namaKegiatan}
                  onChange={(e) => setNamaKegiatan(e.target.value)}
                  placeholder='Masukkan nama kegiatan'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Sifat <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={sifat}
                  onChange={(e) => setSifat(e.target.value)}
                  placeholder='Masukkan sifat kegiatan (contoh: Internal, Eksternal)'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Bentuk <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={bentuk}
                  onChange={(e) => setBentuk(e.target.value)}
                  placeholder='Masukkan bentuk kegiatan (contoh: Seminar, Workshop)'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tujuan <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  placeholder='Masukkan tujuan kegiatan'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Manfaat <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={manfaat}
                  onChange={(e) => setManfaat(e.target.value)}
                  placeholder='Masukkan manfaat kegiatan'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Sasaran <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={sasaran}
                  onChange={(e) => setSasaran(e.target.value)}
                  placeholder='Masukkan sasaran kegiatan (contoh: Mahasiswa Informatika)'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tempat <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={tempat}
                  onChange={(e) => setTempat(e.target.value)}
                  placeholder='Masukkan tempat pelaksanaan'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Alat Yang Dibutuhkan <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={alat}
                  onChange={(e) => setAlat(e.target.value)}
                  placeholder='Masukkan alat yang dibutuhkan'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Undangan <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={undangan}
                  onChange={(e) => setUndangan(e.target.value)}
                  placeholder='Masukkan daftar undangan'
                  required
                />
              </div>
            </div>

            {/* Upload Proposal */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Unggah Proposal <span className='text-red-500'>*</span>
              </label>
              <Input
                required
                type='file'
                accept='.pdf'
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  if (file) {
                    // Validasi ukuran file (max 20MB)
                    if (file.size > 20 * 1024 * 1024) {
                      alert('Ukuran file maksimal 20MB');
                      e.target.value = '';
                      return;
                    }
                    // Validasi format file (PDF only as backend expects)
                    const validFormats = ['application/pdf'];
                    if (!validFormats.includes(file.type)) {
                      alert('Format file harus PDF');
                      e.target.value = '';
                      return;
                    }
                    setProposalFile(file);
                  } else {
                    setProposalFile(null);
                  }
                }}
              />
              <p className='text-xs text-gray-500'>Format: PDF (Max 20MB)</p>
              {proposalFile && (
                <p className='text-sm text-green-600'>
                  ✓ File terpilih: {proposalFile.name} (
                  {(proposalFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className='flex justify-between gap-3 pt-4'>
              <Button type='button' variant='outline' onClick={handleBack}>
                Kembali
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? 'Menyimpan...' : 'Selanjutnya'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
