import { useMemo, useState } from 'react';
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
import { Button } from '@/shared/components/ui/button/button';
import { type ApprovalItem } from './Approval';
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
    return { className: `${base} bg-green-100 text-green-700`, label: 'Disetujui' };
  }
  if (status === 'rejected') {
    return { className: `${base} bg-red-100 text-red-700`, label: 'Ditolak' };
  }
  if (status === 'revisi' || status === 'returned') {
    return { className: `${base} bg-yellow-100 text-yellow-700`, label: 'Revisi' };
  }
  return { className: `${base} bg-blue-100 text-blue-700`, label: 'Menunggu' };
}

export function ApprovalHistory({
  bookings,
  showOrganisasi = true,
  onOpenDoc,
  serverPagination,
}: ApprovalHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    return bookings.filter(
      (item) =>
        item.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaPeminjam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaRuang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.organisasiMahasiswa &&
          item.organisasiMahasiswa
            .toLowerCase()
            .includes(searchTerm.toLowerCase())),
    );
  }, [bookings, searchTerm]);

  return (
    <div className='w-full space-y-6'>
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
              <TableHead>Tanggal Diproses</TableHead>
              <TableHead>Nama Kegiatan</TableHead>
              {showOrganisasi && <TableHead>Organisasi</TableHead>}
              <TableHead className='text-center'>Status</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className='text-center'>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showOrganisasi ? 7 : 6}
                  className='h-24 text-center text-gray-500'
                >
                  Belum ada riwayat persetujuan
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, index) => {
                const badge = statusBadge(item.status);
                return (
                  <TableRow key={item.id}>
                    <TableCell className='font-medium'>{index + 1}</TableCell>
                    <TableCell>{item.tanggalMasuk || '-'}</TableCell>
                    <TableCell>{item.kegiatan}</TableCell>
                    {showOrganisasi && (
                      <TableCell>{item.organisasiMahasiswa || '-'}</TableCell>
                    )}
                    <TableCell className='text-center'>
                      <span className={badge.className}>
                        {badge.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-gray-600'>
                        {item.keterangan || '-'}
                      </span>
                    </TableCell>
                    <TableCell className='text-center'>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenDoc?.(item.id)}
                      >
                        Lihat Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
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
