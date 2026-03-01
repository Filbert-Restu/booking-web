import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { type ApprovalItem } from './Approval';
import FileActions, { type FileType } from '@/components/FileActions';
import { PaginationBar, type ServerPagination } from '@/shared/components/ui/data-table';

interface ApprovalHistoryProps {
  bookings: ApprovalItem[];
  showOrganisasi?: boolean;
  onOpenDoc?: (documentId: number) => void;
  serverPagination?: ServerPagination;
}

function statusBadge(status: string) {
  const base =
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide';
  if (status === 'approved') {
    return `${base} bg-green-100 text-green-700`;
  }
  if (status === 'rejected') {
    return `${base} bg-red-100 text-red-700`;
  }
  if (status === 'revisi' || status === 'returned') {
    return `${base} bg-yellow-100 text-yellow-700`;
  }
  return `${base} bg-blue-100 text-blue-700`;
}

export function ApprovalHistory({
  bookings,
  showOrganisasi = true,
  serverPagination,
}: ApprovalHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfPreview, setPdfPreview] = useState<{
    id: number;
    type: FileType;
    url: string;
  } | null>(null);

  const filteredItems = bookings;

  useEffect(() => {

  }, [bookings]);

  return (
    <div className='w-full space-y-6 p-6'>
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
        <Input
          type='text'
          placeholder='Cari kegiatan, peminjam, atau ruang...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      <div className='rounded-lg border bg-white shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>No</TableHead>
              <TableHead>Kegiatan</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Nama Peminjam</TableHead>
              {showOrganisasi && <TableHead>Organisasi</TableHead>}
              <TableHead>Ruang</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead className='text-center'>Dokumen</TableHead>
              <TableHead className='text-center'>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showOrganisasi ? 10 : 9}
                  className='h-24 text-center text-gray-500'
                >
                  Belum ada riwayat persetujuan
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className='font-medium'>{index + 1}</TableCell>
                  <TableCell>{item.kegiatan}</TableCell>
                  <TableCell>{item.noHp || '-'}</TableCell>
                  <TableCell>{item.namaPeminjam || 'Unknown'}</TableCell>
                  {showOrganisasi && (
                    <TableCell>{item.organisasiMahasiswa || '-'}</TableCell>
                  )}
                  <TableCell>{item.namaRuang}</TableCell>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.waktu}</TableCell>
                  <TableCell className='text-center'>
                    <FileActions
                      docId={item.id}
                      fileTypes={[
                        { type: 'proposal', hasFile: !!item.hasProposal },
                        {
                          type: 'executive-summary',
                          hasFile: !!item.hasExecutiveSummary,
                        },
                        {
                          type: 'approval-sheet',
                          hasFile: !!item.hasApprovalSheet,
                        },
                      ]}
                      pdfPreview={pdfPreview}
                      setPdfPreview={setPdfPreview}
                    />
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center font-semibold'>
                      <span className={statusBadge(item.status)}>
                        {item.status === 'revisi' ? 'REVISI' : item.status.toUpperCase()}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {serverPagination && serverPagination.lastPage > 1 && (
        <PaginationBar
          currentPage={serverPagination.currentPage}
          totalPages={serverPagination.lastPage}
          from={serverPagination.from ?? 1}
          to={serverPagination.to ?? bookings.length}
          total={serverPagination.total}
          onPageChange={serverPagination.onPageChange}
        />
      )}
    </div>
  );
}
