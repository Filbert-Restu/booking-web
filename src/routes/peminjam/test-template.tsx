import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button/button';
import {
  FileText,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { documentService } from '@/services/document.service';
import { AxiosError } from 'axios';
import api from '@/lib/axios';

export const Route = createFileRoute('/peminjam/test-template')({
  component: RouteComponent,
});

interface TemplateStatus {
  executive_summary: {
    exists: boolean;
    name?: string;
    version?: number;
  };
}

function RouteComponent() {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(false);
  const [checkingTemplates, setCheckingTemplates] = useState(false);
  const [templateStatus, setTemplateStatus] = useState<TemplateStatus>({
    executive_summary: { exists: false },
  });

  const [testData, setTestData] = useState({
    // Room & Booking
    room_code: 'LT1',
    booking_date: '2026-02-15',
    start_time: '08:00',
    end_time: '12:00',
    purpose: 'Peminjaman untuk kegiatan workshop',

    // Ketua Pelaksana
    ketua_pelaksana_nama: 'Ahmad Fauzi',
    ketua_pelaksana_nim: '12345678901234',
    ketua_pelaksana_hp: '628123456789',

    // Event
    event_name: 'Workshop Mobile Development dengan Flutter',
    event_nature: 'Teknologi & Pendidikan',
    event_form: 'Workshop',
    objectives:
      'Meningkatkan skill mahasiswa dalam pengembangan aplikasi mobile menggunakan Flutter framework',
    benefits:
      'Mahasiswa mendapat pengetahuan praktis tentang Flutter dan dapat membuat aplikasi mobile sederhana',
    target_audience: 'Mahasiswa Teknik Informatika semester 3-7',
    schedule:
      '08:00-10:00 Materi Dasar Flutter\n10:00-12:00 Praktik Membuat Aplikasi\n13:00-16:00 Project Challenge',
    location: 'Laboratorium Komputer Lantai 3',
    equipment:
      'Proyektor, Sound system, Whiteboard, Laptop (30 unit), Koneksi Internet',
    committee_head:
      'Ahmad Fauzi (Ketua Panitia)\nBudi Santoso (Sekretaris)\nSiti Rahmawati (Bendahara)',
    invitations:
      'Dekan Fakultas Teknik\nKetua Departemen Informatika\nDosen Pembimbing\nKetua Senat Mahasiswa',
  });

  const [documentId, setDocumentId] = useState<number | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [step, setStep] = useState<
    'check' | 'input' | 'create' | 'generate' | 'done'
  >('check');

  // Check templates on mount
  useEffect(() => {
    checkTemplateStatus();
  }, []);

  // Check if templates are uploaded
  const checkTemplateStatus = async () => {
    try {
      setCheckingTemplates(true);
      const response = await api.get('/document-templates/active');
      const templates = response.data.data;

      console.log('📋 Active templates:', templates);

      const status: TemplateStatus = {
        executive_summary: { exists: false },
      };

      templates.forEach((template: any) => {
        if (template.template_type === 'executive_summary') {
          status.executive_summary = {
            exists: true,
            name: template.template_name,
            version: template.version,
          };
        }
      });

      setTemplateStatus(status);

      // Check if executive summary template exists
      if (status.executive_summary.exists) {
        console.log('✅ Executive summary template ready');
      } else {
        console.log('⚠️ Executive summary template missing');
      }
    } catch (error) {
      console.error('❌ Failed to check templates:', error);
    } finally {
      setCheckingTemplates(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setTestData((prev) => ({ ...prev, [field]: value }));
  };

  // Proceed to input step
  const proceedToInput = () => {
    setStep('input');
  };

  // Step 1: Create test document
  const handleCreateDocument = async () => {
    try {
      setLoading(true);
      setStep('create');

      console.log('📝 Creating test document...');

      const response = await api.post('/documents', {
        workflow_id: 1, // HMD workflow
        title: `[TEST] ${testData.event_name}`,
        content: {
          room_id: 1,
          room_code: testData.room_code,
          booking_date: testData.booking_date,
          start_time: testData.start_time,
          end_time: testData.end_time,
          purpose: testData.purpose,
          ketua_pelaksana_nama: testData.ketua_pelaksana_nama,
          ketua_pelaksana_nim: testData.ketua_pelaksana_nim,
          ketua_pelaksana_hp: testData.ketua_pelaksana_hp,
          event_name: testData.event_name,
          event_nature: testData.event_nature,
          event_form: testData.event_form,
          objectives: testData.objectives,
          benefits: testData.benefits,
          target_audience: testData.target_audience,
          schedule: testData.schedule,
          location: testData.location,
          equipment: testData.equipment,
          committee_head: testData.committee_head,
          invitations: testData.invitations,
        },
      });

      const docId = response.data.data.id;
      setDocumentId(docId);
      console.log('✅ Document created:', docId);

      alert(`Dokumen test berhasil dibuat! ID: ${docId}`);
      setStep('generate');
    } catch (error) {
      console.error('❌ Failed to create document:', error);
      if (error instanceof AxiosError) {
        alert(
          `Gagal membuat dokumen: ${error.response?.data?.message || error.message}`,
        );
      }
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate documents from template
  const handleGenerateDocuments = async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      console.log('📄 Generating documents from templates...');

      // Generate executive summary only
      console.log('📄 Generating executive summary...');
      const execSummary =
        await documentService.generateExecutiveSummary(documentId);
      console.log('✅ Executive summary generated:', execSummary);

      setGeneratedUrl(execSummary.download_url);

      setStep('done');
      alert(
        '✅ Executive Summary berhasil digenerate!\n\nSilakan download untuk melihat hasilnya.',
      );
    } catch (error) {
      console.error('❌ Failed to generate documents:', error);
      if (error instanceof AxiosError) {
        const errorMsg = error.response?.data?.message || error.message;
        alert(
          `Gagal generate dokumen: ${errorMsg}\n\nPastikan template sudah diupload terlebih dahulu.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Download with authentication
  const handleDownload = async (url: string, filename: string) => {
    try {
      setLoading(true);
      console.log('📥 Downloading from:', url);

      // Extract API path from full URL
      // URL format: http://localhost:8000/api/documents/123/file/executive-summary
      // We need: /documents/123/file/executive-summary (without /api prefix since axios baseURL already includes it)
      let apiPath = url;

      try {
        const urlObj = new URL(url);
        // Get pathname and remove /api prefix if exists
        apiPath = urlObj.pathname.replace(/^\/api/, '');
        console.log('📥 Extracted API path:', apiPath);
      } catch {
        // If it's already a relative path, use as is
        console.log('📥 Using relative path:', apiPath);
      }

      // Fetch file with authentication via axios instance
      const response = await api.get(apiPath, {
        responseType: 'blob',
      });

      console.log('✅ File fetched, size:', response.data.size, 'bytes');

      // Create blob URL
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const blobUrl = window.URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      console.log('✅ Download completed:', filename);
    } catch (error) {
      console.error('❌ Download failed:', error);
      if (error instanceof AxiosError) {
        const errorMsg = error.response?.data?.message || error.message;
        alert(
          `Gagal mendownload file: ${errorMsg}\n\nPastikan file sudah digenerate dengan benar.`,
        );
      } else {
        alert('Gagal mendownload file. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setDocumentId(null);
    setGeneratedUrl(null);
    setStep('check');
    checkTemplateStatus();
  };

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Test Executive Summary Generation
            </h1>
            <p className='text-sm text-gray-600 mt-1'>
              Halaman percobaan untuk mengisi dan generate Executive Summary
              dari template DOCX dengan autofill
            </p>
          </div>
          <Button
            variant='outline'
            onClick={() => navigate({ to: '/peminjam/pinjam' })}
          >
            Kembali
          </Button>
        </div>

        {/* Progress Steps */}
        <div className='flex items-center gap-4 mt-6'>
          <div
            className={`flex items-center gap-2 ${step === 'check' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'check'
                  ? 'bg-blue-100 text-blue-600'
                  : ['input', 'create', 'generate', 'done'].includes(step)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {['input', 'create', 'generate', 'done'].includes(step) ? (
                <CheckCircle className='w-5 h-5' />
              ) : (
                '1'
              )}
            </div>
            <span className='text-sm font-medium'>Cek Template</span>
          </div>

          <div className='flex-1 h-px bg-gray-300' />

          <div
            className={`flex items-center gap-2 ${step === 'input' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'input'
                  ? 'bg-blue-100 text-blue-600'
                  : ['create', 'generate', 'done'].includes(step)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {['create', 'generate', 'done'].includes(step) ? (
                <CheckCircle className='w-5 h-5' />
              ) : (
                '2'
              )}
            </div>
            <span className='text-sm font-medium'>Input Data</span>
          </div>

          <div className='flex-1 h-px bg-gray-300' />

          <div
            className={`flex items-center gap-2 ${step === 'create' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'create'
                  ? 'bg-blue-100 text-blue-600'
                  : ['generate', 'done'].includes(step)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {['generate', 'done'].includes(step) ? (
                <CheckCircle className='w-5 h-5' />
              ) : (
                '3'
              )}
            </div>
            <span className='text-sm font-medium'>Buat Dokumen</span>
          </div>

          <div className='flex-1 h-px bg-gray-300' />

          <div
            className={`flex items-center gap-2 ${step === 'generate' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'generate'
                  ? 'bg-blue-100 text-blue-600'
                  : step === 'done'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step === 'done' ? <CheckCircle className='w-5 h-5' /> : '4'}
            </div>
            <span className='text-sm font-medium'>Generate</span>
          </div>

          <div className='flex-1 h-px bg-gray-300' />

          <div
            className={`flex items-center gap-2 ${step === 'done' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'done'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step === 'done' ? <CheckCircle className='w-5 h-5' /> : '5'}
            </div>
            <span className='text-sm font-medium'>Download</span>
          </div>
        </div>
      </div>

      {/* Step 0: Check Templates */}
      {step === 'check' && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Status Template
            </h2>
            <Button
              variant='outline'
              size='sm'
              onClick={checkTemplateStatus}
              disabled={checkingTemplates}
              className='flex items-center gap-2'
            >
              <RefreshCw
                className={`w-4 h-4 ${checkingTemplates ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>

          <div className='space-y-4'>
            {/* Executive Summary Template */}
            <div
              className={`border rounded-lg p-4 ${
                templateStatus.executive_summary.exists
                  ? 'border-green-200 bg-green-50'
                  : 'border-orange-200 bg-orange-50'
              }`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3'>
                  {templateStatus.executive_summary.exists ? (
                    <CheckCircle className='w-5 h-5 text-green-600 mt-0.5' />
                  ) : (
                    <AlertCircle className='w-5 h-5 text-orange-600 mt-0.5' />
                  )}
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Executive Summary Template
                    </h3>
                    {templateStatus.executive_summary.exists ? (
                      <div className='text-sm text-gray-600 mt-1'>
                        <p className='font-medium text-green-700'>
                          {templateStatus.executive_summary.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Version: {templateStatus.executive_summary.version}
                        </p>
                      </div>
                    ) : (
                      <p className='text-sm text-orange-700 mt-1'>
                        Template belum diupload. Upload template terlebih dahulu
                        via API atau Postman.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-start gap-2'>
              <Info className='w-5 h-5 text-blue-600 mt-0.5' />
              <div>
                <h4 className='text-sm font-medium text-blue-900 mb-2'>
                  Cara Upload Template:
                </h4>
                <ol className='text-xs text-blue-800 space-y-1 list-decimal list-inside'>
                  <li>Buka Postman atau tools API testing lainnya</li>
                  <li>
                    POST ke{' '}
                    <code className='bg-blue-100 px-1 rounded'>
                      /api/document-templates
                    </code>
                  </li>
                  <li>
                    Form data:
                    <ul className='ml-6 mt-1 space-y-0.5 list-disc list-inside'>
                      <li>
                        <code className='bg-blue-100 px-1 rounded'>
                          template_type
                        </code>
                        : executive_summary atau lembar_pengesahan
                      </li>
                      <li>
                        <code className='bg-blue-100 px-1 rounded'>
                          template_name
                        </code>
                        : Nama template
                      </li>
                      <li>
                        <code className='bg-blue-100 px-1 rounded'>file</code>:
                        File DOCX dengan placeholder
                      </li>
                      <li>
                        <code className='bg-blue-100 px-1 rounded'>
                          set_as_active
                        </code>
                        : true
                      </li>
                    </ul>
                  </li>
                  <li>
                    Placeholder format:{' '}
                    <code className='bg-blue-100 px-1 rounded'>
                      ${`{field_name}`}
                    </code>
                  </li>
                  <li>
                    Contoh fields: event_name, booking_date,
                    ketua_pelaksana_nama, dll
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className='mt-6 flex justify-between items-center'>
            <p className='text-sm text-gray-600'>
              {templateStatus.executive_summary.exists ? (
                <span className='text-green-700 font-medium'>
                  ✅ Executive summary template siap digunakan
                </span>
              ) : (
                <span className='text-orange-700 font-medium'>
                  ⚠️ Upload executive summary template terlebih dahulu sebelum
                  melanjutkan
                </span>
              )}
            </p>
            <Button
              onClick={proceedToInput}
              disabled={!templateStatus.executive_summary.exists}
              className='flex items-center gap-2'
            >
              Lanjut ke Input Data
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Input Data */}
      {step === 'input' && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Data Test
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Room & Booking */}
            <div className='space-y-3'>
              <h3 className='text-sm font-medium text-gray-700'>
                Booking Info
              </h3>

              <div>
                <label className='block text-xs text-gray-600 mb-1'>
                  Kode Ruangan
                </label>
                <input
                  type='text'
                  value={testData.room_code}
                  onChange={(e) =>
                    handleInputChange('room_code', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                />
              </div>

              <div>
                <label className='block text-xs text-gray-600 mb-1'>
                  Tanggal
                </label>
                <input
                  type='date'
                  value={testData.booking_date}
                  onChange={(e) =>
                    handleInputChange('booking_date', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    Jam Mulai
                  </label>
                  <input
                    type='time'
                    value={testData.start_time}
                    onChange={(e) =>
                      handleInputChange('start_time', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    Jam Selesai
                  </label>
                  <input
                    type='time'
                    value={testData.end_time}
                    onChange={(e) =>
                      handleInputChange('end_time', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                  />
                </div>
              </div>
            </div>

            {/* Ketua Pelaksana */}
            <div className='space-y-3'>
              <h3 className='text-sm font-medium text-gray-700'>
                Ketua Pelaksana
              </h3>

              <div>
                <label className='block text-xs text-gray-600 mb-1'>Nama</label>
                <input
                  type='text'
                  value={testData.ketua_pelaksana_nama}
                  onChange={(e) =>
                    handleInputChange('ketua_pelaksana_nama', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                />
              </div>

              <div>
                <label className='block text-xs text-gray-600 mb-1'>NIM</label>
                <input
                  type='text'
                  value={testData.ketua_pelaksana_nim}
                  onChange={(e) =>
                    handleInputChange('ketua_pelaksana_nim', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                />
              </div>

              <div>
                <label className='block text-xs text-gray-600 mb-1'>
                  No. HP
                </label>
                <input
                  type='text'
                  value={testData.ketua_pelaksana_hp}
                  onChange={(e) =>
                    handleInputChange('ketua_pelaksana_hp', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className='mt-6 space-y-3'>
            <h3 className='text-sm font-medium text-gray-700'>
              Detail Kegiatan
            </h3>

            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Nama Kegiatan
              </label>
              <input
                type='text'
                value={testData.event_name}
                onChange={(e) =>
                  handleInputChange('event_name', e.target.value)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs text-gray-600 mb-1'>
                  Sifat Kegiatan
                </label>
                <input
                  type='text'
                  value={testData.event_nature}
                  onChange={(e) =>
                    handleInputChange('event_nature', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                />
              </div>
              <div>
                <label className='block text-xs text-gray-600 mb-1'>
                  Bentuk Kegiatan
                </label>
                <input
                  type='text'
                  value={testData.event_form}
                  onChange={(e) =>
                    handleInputChange('event_form', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                />
              </div>
            </div>

            <div>
              <label className='block text-xs text-gray-600 mb-1'>Tujuan</label>
              <textarea
                value={testData.objectives}
                onChange={(e) =>
                  handleInputChange('objectives', e.target.value)
                }
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>

            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Manfaat
              </label>
              <textarea
                value={testData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>

            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Target Peserta
              </label>
              <input
                type='text'
                value={testData.target_audience}
                onChange={(e) =>
                  handleInputChange('target_audience', e.target.value)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>

            <div>
              <label className='block text-xs text-gray-600 mb-1'>Jadwal</label>
              <textarea
                value={testData.schedule}
                onChange={(e) => handleInputChange('schedule', e.target.value)}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>

            <div>
              <label className='block text-xs text-gray-600 mb-1'>Lokasi</label>
              <input
                type='text'
                value={testData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>

            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Peralatan
              </label>
              <textarea
                value={testData.equipment}
                onChange={(e) => handleInputChange('equipment', e.target.value)}
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>

            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Susunan Panitia
              </label>
              <textarea
                value={testData.committee_head}
                onChange={(e) =>
                  handleInputChange('committee_head', e.target.value)
                }
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>

            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Undangan
              </label>
              <textarea
                value={testData.invitations}
                onChange={(e) =>
                  handleInputChange('invitations', e.target.value)
                }
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>
          </div>

          <div className='mt-6 flex justify-end'>
            <Button
              onClick={handleCreateDocument}
              disabled={loading}
              className='flex items-center gap-2'
            >
              <FileText className='w-4 h-4' />
              {loading ? 'Creating...' : 'Buat Dokumen Test'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 & 3: Generate */}
      {(step === 'create' || step === 'generate') && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Generate Dokumen
          </h2>

          {documentId && (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-4'>
              <p className='text-sm text-green-900'>
                ✅ Dokumen test berhasil dibuat dengan ID:{' '}
                <span className='font-mono font-bold'>{documentId}</span>
              </p>
            </div>
          )}

          <p className='text-sm text-gray-600 mb-4'>
            Klik tombol di bawah untuk generate Executive Summary dari template.
          </p>

          <Button
            onClick={handleGenerateDocuments}
            disabled={loading || !documentId}
            className='flex items-center gap-2'
          >
            <Upload className='w-4 h-4' />
            {loading ? 'Generating...' : 'Generate Executive Summary'}
          </Button>
        </div>
      )}

      {/* Step 4: Download */}
      {step === 'done' && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Hasil Generate
          </h2>

          <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center gap-2 text-green-900 mb-2'>
              <CheckCircle className='w-5 h-5' />
              <span className='font-medium'>
                Executive Summary berhasil digenerate!
              </span>
            </div>
            <p className='text-sm text-green-700'>
              Silakan download dokumen di bawah untuk melihat hasil pengisian
              template.
            </p>
          </div>

          {/* Executive Summary */}
          <div className='border border-gray-200 rounded-lg p-6 max-w-md mx-auto'>
            <div className='flex items-center gap-2 mb-3'>
              <FileText className='w-6 h-6 text-blue-600' />
              <h3 className='font-medium text-gray-900 text-lg'>
                Executive Summary
              </h3>
            </div>
            <p className='text-sm text-gray-600 mb-6'>
              Ringkasan eksekutif kegiatan dengan semua detail yang sudah diisi
              dari data test.
            </p>
            {generatedUrl && (
              <Button
                onClick={() =>
                  handleDownload(
                    generatedUrl,
                    `executive_summary_${documentId}.docx`,
                  )
                }
                disabled={loading}
                className='flex items-center justify-center gap-2 w-full'
              >
                <Download className='w-4 h-4' />
                {loading
                  ? 'Downloading...'
                  : 'Download Executive Summary (DOCX)'}
              </Button>
            )}
          </div>

          <div className='mt-6 flex justify-end'>
            <Button variant='outline' onClick={handleReset}>
              Test Lagi
            </Button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h3 className='text-sm font-medium text-blue-900 mb-2 flex items-center gap-2'>
          <Info className='w-4 h-4' />
          Field yang Tersedia untuk Template
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs text-blue-800'>
          <div>
            <p className='font-medium mb-1'>Room & Booking:</p>
            <ul className='space-y-0.5 list-disc list-inside ml-2'>
              <li>room_code</li>
              <li>room_name</li>
              <li>booking_date</li>
              <li>start_time</li>
              <li>end_time</li>
              <li>purpose</li>
            </ul>
          </div>
          <div>
            <p className='font-medium mb-1'>Ketua Pelaksana:</p>
            <ul className='space-y-0.5 list-disc list-inside ml-2'>
              <li>ketua_pelaksana_nama</li>
              <li>ketua_pelaksana_nim</li>
              <li>ketua_pelaksana_hp</li>
            </ul>
          </div>
          <div>
            <p className='font-medium mb-1'>Event Details:</p>
            <ul className='space-y-0.5 list-disc list-inside ml-2'>
              <li>event_name</li>
              <li>event_nature</li>
              <li>event_form</li>
              <li>objectives</li>
              <li>benefits</li>
              <li>target_audience</li>
              <li>schedule</li>
              <li>location</li>
              <li>equipment</li>
              <li>committee_head</li>
              <li>invitations</li>
            </ul>
          </div>
        </div>
        <p className='text-xs text-blue-700 mt-3'>
          💡 Gunakan format{' '}
          <code className='bg-blue-100 px-1 rounded'>${`{field_name}`}</code> di
          template DOCX Anda
        </p>
      </div>
    </div>
  );
}
