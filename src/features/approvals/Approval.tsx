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
import { PaginationBar, type ServerPagination } from '@/shared/components/ui/data-table';

export type ApprovalStatus = 'waiting' | 'approved' | 'revisi' | 'rejected';

export type ActorRole =
  | 'ketua-ormawa'
  | 'ketua-departemen'
  | 'kemahasiswaan'
  | 'senat'
  | 'wadek1'
  | 'dosen-pendamping'
  | 'sumber-daya';

type DocumentType = 'executive-summary' | 'lembar-pengesahan';

export interface DocActionPayload {
  booking: ApprovalItem;
  role: ActorRole;
  doc: DocumentType;
  mode: 'preview' | 'sign';
}

export interface ApprovalItem {
  id: number;
  token?: string;
  kegiatanOrmawa?: string;
  kegiatan: string;
  noHp: string;
  namaPeminjam: string;
  organisasiMahasiswa?: string;
  namaRuang: string;
  tanggal: string;
  waktu: string;
  proposalUrl?: string;
  status: ApprovalStatus;
  tanggalPersetujuan?: string;
  executiveSummarySigned?: boolean;
  lembarPengesahanSigned?: boolean;
  revisiNotes?: string;
  hasProposal?: boolean;
  hasExecutiveSummary?: boolean;
  hasApprovalSheet?: boolean;
  tanggalMasuk?: string;
  keterangan?: string;
}

interface ApprovalProps {
  bookings: ApprovalItem[];
  onApprove?: (id: number) => void;
  onRevise?: (id: number) => void;
  showOrganisasi?: boolean;
  actorRole: ActorRole;
  onOpenDoc?: (documentId: number) => void;
  serverPagination?: ServerPagination;
}



export function Approval({
  bookings,
  showOrganisasi = true,
  onOpenDoc,
  serverPagination,
}: ApprovalProps) {
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
              <TableHead>Tanggal Masuk</TableHead>
              <TableHead>Nama Kegiatan</TableHead>
              {showOrganisasi && <TableHead>Organisasi</TableHead>}
              <TableHead className='text-center'>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showOrganisasi ? 5 : 4}
                  className='h-24 text-center text-gray-500'
                >
                  Tidak ada data ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className='font-medium'>{index + 1}</TableCell>
                  <TableCell>{item.tanggalMasuk || '-'}</TableCell>
                  <TableCell>{item.kegiatan}</TableCell>
                  {showOrganisasi && (
                    <TableCell>{item.organisasiMahasiswa || '-'}</TableCell>
                  )}
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
