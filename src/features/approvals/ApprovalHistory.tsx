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
import type { ApprovalItem, ActorRole } from './Approval';

type DocumentType = 'executive-summary' | 'lembar-pengesahan';

interface ApprovalHistoryProps {
  bookings: ApprovalItem[];
  showOrganisasi?: boolean;
  showProposal?: boolean;
  actorRole: ActorRole;
  onOpenDoc?: (payload: {
    booking: ApprovalItem;
    role: ActorRole;
    doc: DocumentType;
    mode: 'preview';
  }) => void;
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
  return `${base} bg-yellow-100 text-yellow-700`;
}

export function ApprovalHistory({
  bookings,
  showOrganisasi = true,
  showProposal = true,
  actorRole,
  onOpenDoc,
}: ApprovalHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = bookings;

  const handleDocumentPreview = (booking: ApprovalItem, doc: DocumentType) => {
    onOpenDoc?.({ booking, doc, role: actorRole, mode: 'preview' });
  };

  useEffect(() => {
    console.log('ApprovalHistory received bookings:', bookings); // Log received bookings
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
              {showProposal && <TableHead>Proposal</TableHead>}
              <TableHead className='text-center'>Executive Summary</TableHead>
              <TableHead className='text-center'>Lembar Pengesahan</TableHead>
              <TableHead className='text-center'>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showOrganisasi && showProposal ? 14 : 12}
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
                  {showProposal && (
                    <TableCell>
                      {item.proposalUrl ? (
                        <a
                          href={item.proposalUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 underline hover:text-blue-800'
                        >
                          Lihat PDF
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className='flex items-center justify-center'>
                      <button
                        onClick={() =>
                          handleDocumentPreview(item, 'executive-summary')
                        }
                        className='text-blue-600 underline hover:text-blue-800'
                      >
                        Preview
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center'>
                      <button
                        onClick={() =>
                          handleDocumentPreview(item, 'lembar-pengesahan')
                        }
                        className='text-blue-600 underline hover:text-blue-800'
                      >
                        Preview
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center'>
                      <span className={statusBadge(item.status)}>APPROVED</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
