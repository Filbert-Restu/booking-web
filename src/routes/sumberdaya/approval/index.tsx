import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/shadcn/button/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { CheckCircle2, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/shadcn/input';

export const Route = createFileRoute('/sumberdaya/approval/')({
  component: RouteComponent,
});

type ApprovalStatus = 'waiting' | 'approved' | 'rejected';

interface ApprovalItem {
  id: number;
  kegiatan: string;
  noHp: string;
  namaPeminjam: string;
  namaRuang: string;
  tanggal: string;
  waktu: string;
  approvalSumberdaya: ApprovalStatus;
  approvalKemahasiswaan: ApprovalStatus;
}

const initialData: ApprovalItem[] = [
  {
    id: 1,
    kegiatan: 'Ius',
    noHp: '089653707231',
    namaPeminjam: 'Afit Azizy [Test]',
    namaRuang: 'A202',
    tanggal: '2023-07-29',
    waktu: '10:30:00 - 13:00:00',
    approvalSumberdaya: 'approved',
    approvalKemahasiswaan: 'approved',
  },
  {
    id: 2,
    kegiatan: 'Kabar FSM (Podcast)',
    noHp: '096390912319',
    namaPeminjam: 'Fedorova [BEM FSM]',
    namaRuang: 'Ruang Studio (L508)',
    tanggal: '2023-08-28',
    waktu: '08:00:00 - 16:00:00',
    approvalSumberdaya: 'rejected',
    approvalKemahasiswaan: 'rejected',
  },
  {
    id: 3,
    kegiatan: 'GORE',
    noHp: '082424048630',
    namaPeminjam: 'Intan Melyana [RIC]',
    namaRuang: 'K102',
    tanggal: '2023-09-23',
    waktu: '08:00:00 - 16:00:00',
    approvalSumberdaya: 'waiting',
    approvalKemahasiswaan: 'waiting',
  },
];

function statusBadge(status: ApprovalStatus) {
  const base =
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide';
  if (status === 'approved') {
    return `${base} bg-green-100 text-green-700`;
  }
  if (status === 'rejected') {
    return `${base} bg-red-100 text-red-700`;
  }
  return `${base} bg-yellow-100 text-yellow-700`;
}

function RouteComponent() {
  const [items, setItems] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateSumberdaya = (
    id: number,
    status: Exclude<ApprovalStatus, 'waiting'>,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              approvalSumberdaya: status,
            }
          : item,
      ),
    );
  };

  const filtered = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.kegiatan.toLowerCase().includes(term) ||
      item.namaPeminjam.toLowerCase().includes(term) ||
      item.namaRuang.toLowerCase().includes(term)
    );
  });

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Approval Sumber Daya</h1>
          <p className='text-gray-600 mt-1'>Kelola persetujuan peminjaman ruang oleh Sumber Daya.</p>
        </div>

        <div className='w-full md:w-72'>
          <label className='text-sm font-medium text-gray-700 mb-1 block'>Search</label>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <Input
              placeholder='Cari kegiatan, peminjam, atau ruang...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9'
            />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-center w-12'>No</TableHead>
              <TableHead className='text-center'>Kegiatan/Aktivitas</TableHead>
              <TableHead className='text-center'>No HP</TableHead>
              <TableHead className='text-center'>Nama Peminjam</TableHead>
              <TableHead className='text-center'>Nama Ruang</TableHead>
              <TableHead className='text-center'>Tanggal</TableHead>
              <TableHead className='text-center'>Waktu</TableHead>
              <TableHead className='text-center'>Approval Sumberdaya</TableHead>
              <TableHead className='text-center'>Approval Kemahasiswaan</TableHead>
              <TableHead className='text-center w-40'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className='text-center'>{index + 1}</TableCell>
                <TableCell className='text-center'>{item.kegiatan}</TableCell>
                <TableCell className='text-center'>{item.noHp}</TableCell>
                <TableCell className='text-center'>{item.namaPeminjam}</TableCell>
                <TableCell className='text-center'>{item.namaRuang}</TableCell>
                <TableCell className='text-center'>{item.tanggal}</TableCell>
                <TableCell className='text-center'>{item.waktu}</TableCell>
                <TableCell className='text-center'>
                  <span className={statusBadge(item.approvalSumberdaya)}>
                    {item.approvalSumberdaya}
                  </span>
                </TableCell>
                <TableCell className='text-center'>
                  <span className={statusBadge(item.approvalKemahasiswaan)}>
                    {item.approvalKemahasiswaan}
                  </span>
                </TableCell>
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Button
                      size='sm'
                      variant='default'
                      className='flex items-center gap-1'
                      onClick={() => handleUpdateSumberdaya(item.id, 'approved')}
                      disabled={item.approvalSumberdaya === 'approved'}
                    >
                      <CheckCircle2 className='w-4 h-4' />
                      Approve
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='flex items-center gap-1'
                      onClick={() => handleUpdateSumberdaya(item.id, 'rejected')}
                      disabled={item.approvalSumberdaya === 'rejected'}
                    >
                      <XCircle className='w-4 h-4' />
                      Tolak
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <div className='text-center py-10 text-gray-500'>
            Tidak ada pengajuan peminjaman untuk disetujui.
          </div>
        )}
      </div>
    </div>
  );
}
