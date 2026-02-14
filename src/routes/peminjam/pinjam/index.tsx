import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo, useCallback } from 'react'; // Tambah useMemo
import { Plus, FilePlus, AlertCircle, MessageCircle, Clock, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button/button';

// --- IMPORTS CUSTOM ---
import { documentService } from '@/services/document.service';
import FileActions from '@/components/FileActions';
import { DocumentStatusBadge } from '@/components/DocumentStatusBadge';
import { documentHelpers } from '@/utils/documentUtils';
import type { BookingContent, Document } from '@/types/document';

// --- IMPORT TABLE BARU ---
import { DataTable, type ColumnDef } from '@/shared/components/ui/data-table';

export const Route = createFileRoute('/peminjam/pinjam/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [pdfPreview, setPdfPreview] = useState<{
    id: number;
    type: 'executive-summary' | 'approval-sheet' | 'proposal';
    url: string;
  } | null>(null);

  // --- 1. DATA FETCHING ---
  const {
    data: documents = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getDocuments(),
    refetchInterval: 30000,
    select: (res) => {
      const myDocs = res.my_documents || [];
      console.log('📄 My documents from API:', myDocs);

      // Deduplicate berdasarkan kombinasi unique: room_id + booking_date + start_time + end_time
      // Prioritas: IN_PROGRESS > DRAFT (status reservasi)
      const uniqueMap = new Map<string, Document>();

      myDocs.forEach((doc: Document) => {
        const content = doc.content || {};
        const key = `${content.room_id || 'null'}_${content.booking_date || 'null'}_${content.start_time || 'null'}_${content.end_time || 'null'}`;

        const existing = uniqueMap.get(key);
        if (!existing) {
          uniqueMap.set(key, doc);
        } else {
          // Jika ada duplikat, prioritaskan yang IN_PROGRESS daripada DRAFT
          if (doc.status === 'IN_PROGRESS' && existing.status === 'DRAFT') {
            uniqueMap.set(key, doc);
          } else if (doc.status === existing.status) {
            // Jika status sama, ambil yang lebih baru (ID lebih besar)
            if (doc.id > existing.id) {
              uniqueMap.set(key, doc);
            }
          }
        }
      });

      const result = Array.from(uniqueMap.values());
      console.log('📄 After deduplication:', result);
      return result;
    },
  });

  const handleAjukanPinjam = () => {
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

  const handleAjukanPinjamWithData = useCallback(
    (doc: Document<BookingContent>) => {
      // Untuk dokumen REVISED/DRAFT, gunakan editId agar form auto-fill dari database
      // Ini memastikan SEMUA field terisi otomatis, tidak hanya yang ada di search params
      navigate({
        to: '/peminjam/pinjam/detail-tempat',
        search: {
          editId: doc.id, // Kirim document ID untuk auto-fill
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
    },
    [navigate],
  );

  // --- 3. DEFINISI KOLOM TABEL (CORE CHANGE) ---
  // Gunakan useMemo agar tidak dire-create setiap render
  const columns = useMemo<ColumnDef<Document>[]>(
    () => [
      {
        header: 'No',
        className: 'text-center',
        cell: (_, index) => index + 1,
      },
      {
        header: 'Tgl Pengajuan',
        className: '',
        cell: (doc) =>
          new Date(doc.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
      },
      {
        header: 'Deadline',
        className: '',
        cell: (doc) => {
          const deadlineStatus = documentHelpers.getDeadlineStatus(doc);
          const deadlineText = documentHelpers.getDeadlineText(doc);

          // Jangan tampilkan deadline untuk dokumen yang sudah selesai
          if (doc.status === 'APPROVED' || doc.status === 'REJECTED') {
            return <span className='text-xs text-gray-400'>-</span>;
          }

          // Warna berdasarkan status
          const getColorClasses = () => {
            switch (deadlineStatus) {
              case 'expired':
                return 'bg-red-100 text-red-800 border-red-300';
              case 'critical':
                return 'bg-orange-100 text-orange-800 border-orange-300';
              case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
              default:
                return 'bg-green-100 text-green-800 border-green-300';
            }
          };

          // Icon berdasarkan status
          const getIcon = () => {
            if (deadlineStatus === 'expired' || deadlineStatus === 'critical') {
              return <AlertTriangle className='w-3 h-3 shrink-0' />;
            }
            return <Clock className='w-3 h-3 shrink-0' />;
          };

          return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${getColorClasses()}`}>
              {getIcon()}
              <span className='whitespace-nowrap'>{deadlineText}</span>
            </div>
          );
        },
      },
      {
        header: 'Nama Kegiatan',
        className: 'font-medium',
        cell: (doc) => (
          <div>
            {documentHelpers.getEventName(doc)}
          </div>
        ),
      },
      {
        header: 'Tgl Acara',
        className: '',
        cell: (doc) => documentHelpers.getBookingDate(doc),
      },
      {
        header: 'Jam Pelaksanaan',
        className: '',
        cell: (doc) => {
          const content = doc.content || {};
          const startTime = content.start_time;
          const endTime = content.end_time;

          if (startTime && endTime) {
            return (
              <div className='text-sm'>
                <div className='font-medium'>{startTime}</div>
                <div className='text-gray-500'>s/d {endTime}</div>
              </div>
            );
          }
          return <span className='text-sm text-gray-400'>-</span>;
        },
      },
      {
        header: 'Ruangan',
        className: '',
        cell: (doc) => documentHelpers.getRoomInfo(doc),
      },
      {
        header: 'Status',
        className: '',
        cell: (doc) => <DocumentStatusBadge doc={doc} />,
      },
      {
        header: 'Dokumen',
        className: '',
        cell: (doc) => (
          <FileActions
            docId={doc.id}
            fileTypes={[
              { type: 'proposal', hasFile: !!doc.file_proposal },
              {
                type: 'executive-summary',
                hasFile: !!doc.file_executive_summary,
              },
              { type: 'approval-sheet', hasFile: !!doc.file_approval_sheet },
            ]}
            pdfPreview={pdfPreview}
            setPdfPreview={setPdfPreview}
          />
        ),
      },
      {
        header: 'Keterangan',
        className: '',
        cell: (doc) => {
          if (doc.status === 'IN_PROGRESS') {
            const holderName = documentHelpers.getCurrentHolder(doc);
            return (
              <span className='text-sm text-gray-700'>
                Dokumen sedang di{' '}
                <span className='font-semibold'>{holderName}</span>
              </span>
            );
          }
          if (doc.status === 'DRAFT') {
            return (
              <button
                onClick={() => handleAjukanPinjamWithData(doc)}
                className='text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium'
              >
                Lengkapi Pengajuan
              </button>
            );
          }
          if (doc.status === 'REVISION' || doc.status === 'REJECTED') {
            // Find the LATEST RETURNED log entry (logs are asc by default)
            const logs = doc.logs || [];
            const returnedLog = [...logs].reverse().find(
              (log) => log.action === 'RETURNED',
            );

            const revisorUser = returnedLog?.user;
            const revisorName = revisorUser
              ? `${revisorUser.name}${revisorUser.unit ? ` (${revisorUser.unit.name})` : ''}`
              : 'Approver';
            const revisionNote = returnedLog?.note || 'Perlu revisi';
            const revisionDate = returnedLog?.created_at
              ? new Date(returnedLog.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
              : '-';

            return (
              <div className='flex flex-col gap-2 max-w-[300px] py-1'>
                <div className='flex flex-col gap-1.5'>
                  {/* Status & Revisor */}
                  <div className='flex flex-col'>
                    <span className='text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5'>
                      Perlu Revisi
                    </span>
                    <span className='text-xs font-semibold text-gray-900'>
                      Oleh: {revisorName}
                    </span>
                  </div>

                  {/* Note */}
                  <div className='bg-gray-50 border border-gray-100 rounded-md p-2.5'>
                    <p className='text-xs text-gray-600 leading-relaxed italic'>
                      "{revisionNote}"
                    </p>
                  </div>

                  {/* Action Link */}
                  <button
                    onClick={() => handleAjukanPinjamWithData(doc)}
                    className='text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline text-left w-fit'
                  >
                    Lengkapi & Ajukan Kembali →
                  </button>
                </div>
              </div>
            );
          }
          return <span className='text-sm text-gray-400'>-</span>;
        },
      },
    ],
    [pdfPreview, handleAjukanPinjamWithData],
  ); // Dependency array: update jika state pdfPreview berubah

  // --- 4. EMPTY STATE UI ---
  const EmptyState = (
    <div className='text-center py-12'>
      <FilePlus className='w-16 h-16 mx-auto text-gray-300 mb-4' />
      <h3 className='text-lg font-semibold text-gray-700 mb-2'>
        Belum Ada Pengajuan
      </h3>
      <p className='text-sm text-gray-500 mb-4'>
        Mulai ajukan peminjaman ruangan untuk kegiatan Anda
      </p>
      <Button onClick={handleAjukanPinjam} className='gap-2'>
        <Plus className='w-4 h-4' /> Ajukan Sekarang
      </Button>
    </div>
  );

  if (isError) return <div>Error...</div>;

  return (
    <div className='space-y-4 md:space-y-6 p-2 md:p-0'>
      {/* Info Box - Deadline Policy */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3'>
        <AlertCircle className='w-5 h-5 text-blue-600 shrink-0 mt-0.5' />
        <div className='flex-1'>
          <h3 className='text-sm font-semibold text-blue-900 mb-1'>
            Perhatian: Batas Waktu Pengajuan
          </h3>
          <p className='text-sm text-blue-800'>
            Setiap pengajuan peminjaman (baik melalui <strong>Reservasi</strong> atau <strong>Ajukan Peminjaman Langsung</strong>) memiliki <strong>batas waktu 14 hari (2 minggu)</strong> sejak tanggal pengajuan untuk diselesaikan hingga status <strong>APPROVED</strong> atau <strong>REJECTED</strong>.
            Pastikan Anda melengkapi dan mengajukan dokumen tepat waktu!
          </p>
        </div>
      </div>

      <div className='flex justify-between items-center gap-3'>
        <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
          Daftar Pengajuan
        </h1>
        <Button onClick={handleAjukanPinjam} size='lg' className='gap-2'>
          <Plus className='w-4 h-4 md:w-5 md:h-5' />
          <span className='text-sm md:text-base'>Ajukan Peminjaman</span>
        </Button>
      </div>

      <DataTable
        data={documents}
        columns={columns}
        isLoading={isLoading}
        emptyState={EmptyState}
      />
    </div>
  );
}
