import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { PlusCircle, Pencil, Search, ToggleRight, ToggleLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

export const Route = createFileRoute('/admin/manajemen-ruang/')({
  component: RouteComponent,
});

type RoomStatus = 'enable' | 'disable';

interface Room {
  id: number;
  code: string;
  name: string;
  quota: number;
  peruntukan: string;
  status: RoomStatus;
  note?: string;
  photoName?: string;
}

const initialRooms: Room[] = [
  { id: 1, code: 'A102', name: 'A102', quota: 60, peruntukan: 'dosen', status: 'disable' },
  { id: 2, code: 'A101', name: 'A101', quota: 60, peruntukan: 'dosen', status: 'disable' },
  { id: 3, code: 'A103', name: 'A103', quota: 60, peruntukan: 'dosen', status: 'disable' },
  { id: 4, code: 'A104', name: 'A104', quota: 60, peruntukan: 'dosen', status: 'disable' },
  { id: 5, code: 'A105', name: 'A105', quota: 60, peruntukan: 'dosen', status: 'disable' },
  { id: 6, code: 'A106', name: 'A106', quota: 60, peruntukan: 'dosen', status: 'disable' },
  { id: 7, code: 'A107', name: 'A107', quota: 60, peruntukan: 'dosen', status: 'disable' },
  { id: 8, code: 'A203', name: 'A203', quota: 60, peruntukan: 'dosen', status: 'disable' },
  { id: 9, code: 'A204', name: 'A204', quota: 60, peruntukan: 'dosen', status: 'disable' },
  { id: 10, code: 'A205', name: 'A205', quota: 60, peruntukan: 'dosen', status: 'disable' },
];

function RouteComponent() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomQuota, setNewRoomQuota] = useState('10');
  const [newRoomNote, setNewRoomNote] = useState('');
  const [newRoomPhotoName, setNewRoomPhotoName] = useState<string | null>(
    null,
  );

  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomQuota, setEditRoomQuota] = useState('');
  const [editRoomNote, setEditRoomNote] = useState('');
  const [editRoomPhotoName, setEditRoomPhotoName] = useState<string | null>(
    null,
  );

  const handleAddRoom = () => {
    setNewRoomName('');
    setNewRoomQuota('10');
    setNewRoomNote('');
    setNewRoomPhotoName(null);
    setIsAddOpen(true);
  };

  const handleEditRoom = (id: number) => {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;

    setSelectedRoom(room);
    setEditRoomName(room.name);
    setEditRoomQuota(String(room.quota));
    setEditRoomNote(room.note ?? '');
    setEditRoomPhotoName(room.photoName ?? null);
    setIsEditOpen(true);
  };

  const handleToggleStatus = (id: number) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id
          ? { ...room, status: room.status === 'enable' ? 'disable' : 'enable' }
          : room,
      ),
    );
  };

  const filteredRooms = rooms.filter((room) => {
    const term = searchTerm.toLowerCase();
    return (
      room.name.toLowerCase().includes(term) ||
      room.code.toLowerCase().includes(term) ||
      room.peruntukan.toLowerCase().includes(term)
    );
  });

  const visibleRooms = filteredRooms.slice(0, Number(entriesPerPage));

  return (
    <div className='p-6 space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Manajemen Ruang</h1>
          <p className='text-gray-600 mt-1'>Kelola data ruang yang tersedia untuk peminjaman.</p>
        </div>
        <Button
          onClick={handleAddRoom}
          className='flex items-center gap-2'
          variant='default'
        >
          <PlusCircle className='w-4 h-4' />
          Tambah Ruang Baru
        </Button>
      </div>

      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className='flex items-center gap-2 text-sm text-gray-700'>
          <span>Show</span>
          <Select
            value={entriesPerPage}
            onValueChange={(value) => setEntriesPerPage(value)}
          >
            <SelectTrigger className='w-20'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='25'>25</SelectItem>
              <SelectItem value='50'>50</SelectItem>
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>

        <div className='w-full md:w-64'>
          <label className='text-sm font-medium text-gray-700 mb-1 block'>Search</label>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <Input
              placeholder='Cari nama, kode, atau peruntukan ruang...'
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
              <TableHead className='text-center w-16'>No</TableHead>
              <TableHead className='text-center'>Nama</TableHead>
              <TableHead className='text-center w-24'>Kuota</TableHead>
              <TableHead className='text-center'>Peruntukan</TableHead>
              <TableHead className='text-center w-32'>Status</TableHead>
              <TableHead className='text-center w-40'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRooms.map((room, index) => (
              <TableRow key={room.id}>
                <TableCell className='text-center'>{index + 1}</TableCell>
                <TableCell className='text-center'>{room.name}</TableCell>
                <TableCell className='text-center'>{room.quota}</TableCell>
                <TableCell className='text-center capitalize'>{room.peruntukan}</TableCell>
                <TableCell className='text-center'>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${room.status === 'enable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {room.status === 'enable' ? 'Enable' : 'Disable'}
                  </span>
                </TableCell>
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex items-center gap-1'
                      onClick={() => handleEditRoom(room.id)}
                    >
                      <Pencil className='w-4 h-4' />
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      variant={room.status === 'enable' ? 'destructive' : 'default'}
                      className='flex items-center gap-1'
                      onClick={() => handleToggleStatus(room.id)}
                    >
                      {room.status === 'enable' ? (
                        <ToggleLeft className='w-4 h-4' />
                      ) : (
                        <ToggleRight className='w-4 h-4' />
                      )}
                      {room.status === 'enable' ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {visibleRooms.length === 0 && (
          <div className='text-center py-10 text-gray-500'>
            Tidak ada ruang yang ditemukan.
          </div>
        )}
      </div>

      {/* Modal Tambah Ruangan */}
      {isAddOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-xl bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-6'>
            <div className='flex items-start justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>Tambah Ruangan Baru</h2>
              <button
                type='button'
                onClick={() => setIsAddOpen(false)}
                className='text-gray-400 hover:text-gray-600 text-2xl leading-none'
                aria-label='Tutup'
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                const newId = rooms.length
                  ? Math.max(...rooms.map((r) => r.id)) + 1
                  : 1;

                setRooms((prev) => [
                  ...prev,
                  {
                    id: newId,
                    code: newRoomName,
                    name: newRoomName,
                    quota: Number(newRoomQuota) || 0,
                    peruntukan: 'dosen',
                    status: 'disable',
                    note: newRoomNote,
                    photoName: newRoomPhotoName ?? undefined,
                  },
                ]);

                setIsAddOpen(false);
              }}
              className='space-y-4'
            >
              <div className='space-y-1'>
                <label
                  htmlFor='nama-ruangan-baru'
                  className='block text-sm font-medium text-gray-700'
                >
                  Nama Ruangan
                </label>
                <Input
                  id='nama-ruangan-baru'
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder='B101'
                  required
                />
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='kuota-ruangan-baru'
                  className='block text-sm font-medium text-gray-700'
                >
                  Kuota Ruangan
                </label>
                <Input
                  id='kuota-ruangan-baru'
                  type='number'
                  min={1}
                  value={newRoomQuota}
                  onChange={(e) => setNewRoomQuota(e.target.value)}
                  required
                />
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='catatan-ruangan-baru'
                  className='block text-sm font-medium text-gray-700'
                >
                  Catatan
                </label>
                <textarea
                  id='catatan-ruangan-baru'
                  value={newRoomNote}
                  onChange={(e) => setNewRoomNote(e.target.value)}
                  placeholder='ruang kelas'
                  rows={4}
                  className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='foto-ruangan-baru'
                  className='block text-sm font-medium text-gray-700'
                >
                  Foto Ruangan
                </label>
                <input
                  id='foto-ruangan-baru'
                  type='file'
                  accept='image/*'
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0] ?? null;
                    setNewRoomPhotoName(file?.name ?? null);
                  }}
                  className='block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200'
                />
              </div>

              <div className='flex justify-end gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsAddOpen(false)}
                  className='px-6'
                >
                  Tutup
                </Button>
                <Button type='submit' className='px-6'>
                  Tambah
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Ruangan */}
      {isEditOpen && selectedRoom && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-xl bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-6'>
            <div className='flex items-start justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>Edit Ruangan</h2>
              <button
                type='button'
                onClick={() => setIsEditOpen(false)}
                className='text-gray-400 hover:text-gray-600 text-2xl leading-none'
                aria-label='Tutup'
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                setRooms((prev) =>
                  prev.map((room) =>
                    room.id === selectedRoom.id
                      ? {
                          ...room,
                          code: editRoomName,
                          name: editRoomName,
                          quota: Number(editRoomQuota) || 0,
                          note: editRoomNote,
                          photoName: editRoomPhotoName ?? room.photoName,
                        }
                      : room,
                  ),
                );
                setIsEditOpen(false);
              }}
              className='space-y-4'
            >
              <div className='space-y-1'>
                <label
                  htmlFor='nama-ruangan-edit'
                  className='block text-sm font-medium text-gray-700'
                >
                  Nama Ruangan
                </label>
                <Input
                  id='nama-ruangan-edit'
                  value={editRoomName}
                  onChange={(e) => setEditRoomName(e.target.value)}
                  required
                />
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='kuota-ruangan-edit'
                  className='block text-sm font-medium text-gray-700'
                >
                  Kuota Ruangan
                </label>
                <Input
                  id='kuota-ruangan-edit'
                  type='number'
                  min={1}
                  value={editRoomQuota}
                  onChange={(e) => setEditRoomQuota(e.target.value)}
                  required
                />
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='catatan-ruangan-edit'
                  className='block text-sm font-medium text-gray-700'
                >
                  Catatan
                </label>
                <textarea
                  id='catatan-ruangan-edit'
                  value={editRoomNote}
                  onChange={(e) => setEditRoomNote(e.target.value)}
                  rows={4}
                  className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='foto-ruangan-edit'
                  className='block text-sm font-medium text-gray-700'
                >
                  Foto Ruangan
                </label>
                <input
                  id='foto-ruangan-edit'
                  type='file'
                  accept='image/*'
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0] ?? null;
                    setEditRoomPhotoName(file?.name ?? null);
                  }}
                  className='block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200'
                />
              </div>

              <div className='flex justify-end gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsEditOpen(false)}
                  className='px-6'
                >
                  Tutup
                </Button>
                <Button type='submit' className='px-6'>
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
