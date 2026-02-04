import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo, useCallback } from 'react'; // Tambah useMemo
import { Plus, FilePlus } from 'lucide-react';
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
        const content = (doc.content || {}) as any;
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
      const content = doc.content;
      navigate({
        to: '/peminjam/pinjam/detail-tempat',
        search: {
          editId: undefined,
          roomId: content?.room_id,
          bookingDate: content?.booking_date,
          startTime: content?.start_time,
          endTime: content?.end_time,
          purpose: content?.purpose,
          ketuaNama: content?.ketua_pelaksana_nama,
          ketuaNim: content?.ketua_pelaksana_nim,
          ketuaHp: content?.ketua_pelaksana_hp,
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
        className: 'text-center w-[4%]',
        cell: (_, index) => index + 1,
      },
      {
        header: 'Tgl Pengajuan',
        className: 'w-[8%]',
        cell: (doc) =>
          new Date(doc.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
      },
      {
        header: 'Nama Kegiatan',
        className: 'w-[18%] font-medium',
        cell: (doc) => (
          <div className='line-clamp-2'>
            {documentHelpers.getEventName(doc)}
          </div>
        ),
      },
      {
        header: 'Ketua Pelaksana',
        className: 'w-[12%]',
        cell: (doc) => (
          <div className='line-clamp-1'>
            {documentHelpers.getKetuaPelaksanaNama(doc)}
          </div>
        ),
      },
      {
        header: 'NIM',
        className: 'w-[8%]',
        cell: (doc) => documentHelpers.getKetuaPelaksanaNim(doc),
      },
      {
        header: 'No HP',
        className: 'w-[9%]',
        cell: (doc) => documentHelpers.getKetuaPelaksanaHp(doc),
      },
      {
        header: 'Tgl Acara',
        className: 'w-[8%]',
        cell: (doc) => documentHelpers.getBookingDate(doc),
      },
      {
        header: 'Ruangan',
        className: 'w-[7%]',
        cell: (doc) => documentHelpers.getRoomInfo(doc),
      },
      {
        header: 'Status',
        className: 'w-[8%]',
        cell: (doc) => <DocumentStatusBadge doc={doc} />,
      },
      {
        header: 'Dokumen',
        className: 'w-[7%]',
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
        className: 'w-[11%]',
        cell: (doc) => {
          if (doc.status === 'IN_PROGRESS') {
            console.log('🔍 IN_PROGRESS doc:', doc);
            console.log('🔍 currentHolder:', doc.currentHolder);
            console.log('🔍 role:', doc.currentHolder?.role);
            const holderName = documentHelpers.getCurrentHolder(doc);
            console.log('🔍 holderName from helper:', holderName);
            return (
              <span className='text-sm text-gray-700'>
                Dokumen sedang di <span className='font-semibold'>{holderName}</span>
              </span>
            );
          }
          if (doc.status === 'DRAFT') {
            return (
              <button
                onClick={() => handleAjukanPinjamWithData(doc)}
                className='text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium'
              >
                Ajukan Pinjam
              </button>
            );
          }
          if (doc.status === 'REVISED' || doc.status === 'REJECTED') {
            return (
              <div className='flex flex-col gap-1'>
                <span className='text-sm text-orange-600'>Perlu revisi</span>
                <button
                  onClick={() => handleAjukanPinjamWithData(doc)}
                  className='text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium'
                >
                  Ajukan Kembali
                </button>
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
      <div className='flex justify-between items-center gap-3'>
        <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
          Riwayat Pengajuan
        </h1>
        <Button onClick={handleAjukanPinjam} size='lg' className='gap-2'>
          <Plus className='w-4 h-4 md:w-5 md:h-5' />
          <span className='text-sm md:text-base'>Ajukan Pinjam</span>
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
