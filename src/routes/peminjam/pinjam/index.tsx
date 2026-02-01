import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Plus, FilePlus, File, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { documentService, type Document } from '@/services/document.service';
import { AxiosError } from 'axios';

export const Route = createFileRoute('/peminjam/pinjam/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    
    // Auto-refresh setiap 30 detik
    const interval = setInterval(() => {
      fetchDocuments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getDocuments();
      // Combine my_documents and processed_documents
      const allDocs = [
        ...(data.my_documents || []),
        ...(data.processed_documents || []),
      ];
      setDocuments(allDocs);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Gagal memuat data dokumen');
      } else {
        setError('Terjadi kesalahan saat memuat data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAjukanPinjam = () => {
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
  };

  const handleAjukanPinjamWithData = (doc: Document) => {
    const content = doc.content as any;
    navigate({
      to: '/peminjam/pinjam/detail-tempat',
      search: {
        editId: undefined,
        roomId: content?.room_id,
        roomCode: content?.room_code,
        bookingDate: content?.booking_date,
        startTime: content?.start_time,
        endTime: content?.end_time,
        purpose: content?.purpose,
        ketuaNama: content?.ketua_pelaksana_nama,
        ketuaNim: content?.ketua_pelaksana_nim,
        ketuaHp: content?.ketua_pelaksana_hp,
      },
    });
  };

  const getStatusBadge = (status: Document['status'], doc: Document) => {
    // Check if this is a DRAFT document
    if (status === 'DRAFT') {
      const metaData = doc.meta_data as any;
      // RESERVASI: from halaman reservasi (step = 'reservation')
      // DRAFT: from button Ajukan Pinjam (step = 'detail_tempat' or other)
      const isReservation = metaData?.step === 'reservation';
      
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isReservation ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isReservation ? 'Reservasi' : 'Draft'}
        </span>
      );
    }

    const statusConfig: Record<
      Document['status'],
      { bg: string; text: string; label: string }
    > = {
      DRAFT: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Draft',
      },
      IN_PROGRESS: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Diproses',
      },
      APPROVED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Disetujui',
      },
      REJECTED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Ditolak',
      },
      REVISED: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: 'Perlu Revisi',
      },
    };
    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getRoomInfo = (doc: Document) => {
    const content = doc.content as any;
    if (content?.room_id) {
      return `Ruang ${content.room_code || content.room_id}`;
    }
    return '-';
  };

  const getBookingDate = (doc: Document) => {
    const content = doc.content as any;
    if (content?.booking_date) {
      return new Date(content.booking_date).toLocaleDateString('id-ID');
    }
    return '-';
  };

  const getCurrentHolder = (doc: Document) => {
    if (doc.status === 'IN_PROGRESS' && doc.currentHolder) {
      return doc.currentHolder.role?.name || doc.currentHolder.name;
    }
    return '-';
  };

  const getKetuaPelaksanaNama = (doc: Document) => {
    const content = doc.content as any;
    return content?.ketua_pelaksana_nama || '-';
  };

  const getKetuaPelaksanaNim = (doc: Document) => {
    const content = doc.content as any;
    return content?.ketua_pelaksana_nim || '-';
  };

  const getKetuaPelaksanaHp = (doc: Document) => {
    const content = doc.content as any;
    return content?.ketua_pelaksana_hp || '-';
  };

  const getEventName = (doc: Document) => {
    const content = doc.content as any;
    return content?.purpose || doc.title;
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div className='h-8 w-48 bg-gray-200 rounded animate-pulse'></div>
          <div className='h-10 w-36 bg-gray-200 rounded animate-pulse'></div>
        </div>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='space-y-3'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='flex gap-4'>
                <div className='h-12 w-12 bg-gray-200 rounded animate-pulse'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-200 rounded animate-pulse w-3/4'></div>
                  <div className='h-3 bg-gray-200 rounded animate-pulse w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='text-lg font-semibold text-red-600 mb-4'>{error}</div>
          <Button onClick={fetchDocuments}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 md:space-y-6 p-2 md:p-0'>
      {/* Header dengan Button */}
      <div className='flex justify-between items-center gap-3'>
        <h1 className='text-xl md:text-2xl font-bold text-gray-900'>Riwayat Pengajuan</h1>
        <Button onClick={handleAjukanPinjam} size='lg' className='gap-2'>
          <Plus className='w-4 h-4 md:w-5 md:h-5' />
          <span className='text-sm md:text-base'>Ajukan Pinjam</span>
        </Button>
      </div>

      {/* Tabel History Pengajuan */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[4%] text-center'>No</TableHead>
                <TableHead className='w-[8%]'>Tgl Pengajuan</TableHead>
                <TableHead className='w-[18%]'>Nama Kegiatan</TableHead>
                <TableHead className='w-[12%]'>Ketua Pelaksana</TableHead>
                <TableHead className='w-[8%]'>NIM</TableHead>
                <TableHead className='w-[9%]'>No HP</TableHead>
                <TableHead className='w-[8%]'>Tgl Acara</TableHead>
                <TableHead className='w-[7%]'>Ruangan</TableHead>
                <TableHead className='w-[8%]'>Status</TableHead>
                <TableHead className='w-[7%]'>Dokumen</TableHead>
                <TableHead className='w-[11%]'>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className='py-12'>
                    <div className='text-center'>
                      <FilePlus className='w-16 h-16 mx-auto text-gray-300 mb-4' />
                      <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                        Belum Ada Pengajuan
                      </h3>
                      <p className='text-sm text-gray-500 mb-4'>
                        Mulai ajukan peminjaman ruangan untuk kegiatan Anda
                      </p>
                      <Button onClick={handleAjukanPinjam} className='gap-2'>
                        <Plus className='w-4 h-4' />
                        Ajukan Sekarang
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                documents
                  .map((doc, index) => (
                    <TableRow key={doc.id}>
                      <TableCell className='text-center'>{index + 1}</TableCell>
                      <TableCell>
                        {new Date(doc.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className='font-medium'>
                        <div className='line-clamp-2'>{getEventName(doc)}</div>
                      </TableCell>
                      <TableCell>
                        <div className='line-clamp-1'>{getKetuaPelaksanaNama(doc)}</div>
                      </TableCell>
                      <TableCell>{getKetuaPelaksanaNim(doc)}</TableCell>
                      <TableCell>{getKetuaPelaksanaHp(doc)}</TableCell>
                      <TableCell>{getBookingDate(doc)}</TableCell>
                      <TableCell>{getRoomInfo(doc)}</TableCell>
                      <TableCell>{getStatusBadge(doc.status, doc)}</TableCell>
                      <TableCell>
                        <div className='flex gap-1 items-center justify-center'>
                          {doc.file_proposal && (
                            <button
                              onClick={() => window.open(doc.file_proposal, '_blank')}
                              className='p-1 hover:bg-gray-100 rounded transition-colors'
                              title='Lihat Proposal'
                            >
                              <File className='w-4 h-4 text-blue-600' />
                            </button>
                          )}
                          {doc.file_executive_summary && (
                            <button
                              onClick={() => window.open(doc.file_executive_summary, '_blank')}
                              className='p-1 hover:bg-gray-100 rounded transition-colors'
                              title='Lihat Executive Summary'
                            >
                              <FileText className='w-4 h-4 text-green-600' />
                            </button>
                          )}
                          {doc.file_approval_sheet && (
                            <button
                              onClick={() => window.open(doc.file_approval_sheet, '_blank')}
                              className='p-1 hover:bg-gray-100 rounded transition-colors'
                              title='Lihat Lembar Pengesahan'
                            >
                              <FilePlus className='w-4 h-4 text-purple-600' />
                            </button>
                          )}
                          {!doc.file_proposal && !doc.file_executive_summary && !doc.file_approval_sheet && (
                            <span className='text-xs text-gray-400'>-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.status === 'IN_PROGRESS' ? (
                          <span className='text-sm text-gray-700'>
                            {getCurrentHolder(doc)}
                          </span>
                        ) : doc.status === 'DRAFT' ? (
                          <button
                            onClick={() => handleAjukanPinjamWithData(doc)}
                            className='text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium'
                          >
                            Ajukan Pinjam
                          </button>
                        ) : doc.status === 'REVISED' ? (
                          <span className='text-sm text-orange-600'>Perlu revisi</span>
                        ) : (
                          <span className='text-sm text-gray-400'>-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
