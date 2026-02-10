import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  PlusCircle,
  Pencil,
  Search,
  ToggleRight,
  ToggleLeft,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { roomService, type Room } from '@/services/room.service';

export const Route = createFileRoute('/admin/manajemen-ruang/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const rooms = await roomService.getRooms();
      setRooms(rooms);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Gagal memuat data ruangan');
      } else {
        setError('Terjadi kesalahan saat memuat data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleToggleStatus = async (room: Room) => {
    const newStatus = room.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await roomService.updateRoom(room.id, { status: newStatus });
      // Update local state
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, status: newStatus } : r)),
      );
    } catch (err) {
      console.error('Failed to toggle room status:', err);
      alert('Gagal mengubah status ruangan');
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ruangan ${room.name}?`)) {
      return;
    }

    try {
      await roomService.deleteRoom(room.id);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      alert('Ruangan berhasil dihapus');
    } catch (err) {
      console.error('Failed to delete room:', err);
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Gagal menghapus ruangan');
      } else {
        alert('Terjadi kesalahan saat menghapus ruangan');
      }
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const term = searchTerm.toLowerCase();
    return (
      room.name.toLowerCase().includes(term) ||
      room.code.toLowerCase().includes(term) ||
      (room.description && room.description.toLowerCase().includes(term))
    );
  });

  const visibleRooms = filteredRooms.slice(0, Number(entriesPerPage));

  if (loading) {
    return (
      <div className='p-6 flex justify-center items-center min-h-screen'>
        <div className='text-lg font-semibold text-gray-700'>
          Memuat data ruangan...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
          <p className='text-red-600 font-semibold mb-2'>{error}</p>
          <Button onClick={fetchRooms}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Manajemen Ruang</h1>
          <p className='text-gray-600 mt-1'>
            Kelola data ruang yang tersedia untuk peminjaman.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: '/admin/manajemen-ruang/add' })}
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
              <SelectItem value='100'>100</SelectItem>
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>

        <div className='relative w-full md:w-64'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Cari ruangan...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>No</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Ruangan</TableHead>
              <TableHead>Kapasitas</TableHead>
              <TableHead>Fasilitas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-center'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRooms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='h-24 text-center text-gray-500'
                >
                  {searchTerm
                    ? 'Tidak ada ruangan yang cocok dengan pencarian'
                    : 'Belum ada data ruangan'}
                </TableCell>
              </TableRow>
            ) : (
              visibleRooms.map((room, index) => (
                <TableRow key={room.id}>
                  <TableCell className='font-medium'>{index + 1}</TableCell>
                  <TableCell>{room.code}</TableCell>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.capacity || '-'}</TableCell>
                  <TableCell>
                    {Array.isArray(room.facilities) &&
                    room.facilities.length > 0
                      ? room.facilities.join(', ')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        room.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : room.status === 'MAINTENANCE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {room.status === 'ACTIVE'
                        ? 'Aktif'
                        : room.status === 'MAINTENANCE'
                          ? 'Maintenance'
                          : 'Nonaktif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        onClick={() =>
                          navigate({
                            to: '/admin/manajemen-ruang/edit',
                            search: { id: String(room.id) },
                          })
                        }
                        className='p-1.5 hover:bg-gray-100 rounded-md transition-colors'
                        title='Edit ruangan'
                      >
                        <Pencil className='w-4 h-4 text-blue-600' />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(room)}
                        className='p-1.5 hover:bg-gray-100 rounded-md transition-colors'
                        title={
                          room.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'
                        }
                      >
                        {room.status === 'ACTIVE' ? (
                          <ToggleRight className='w-4 h-4 text-green-600' />
                        ) : (
                          <ToggleLeft className='w-4 h-4 text-gray-400' />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          navigate({
                            to: '/admin/manajemen-ruang/detail',
                            search: { id: String(room.id) },
                          })
                        }
                      >
                        <Eye className='w-4 h-4 text-blue-600' />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className='p-1.5 hover:bg-gray-100 rounded-md transition-colors'
                        title='Hapus ruangan'
                      >
                        <Trash2 className='w-4 h-4 text-red-600' />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='text-sm text-gray-600'>
        Menampilkan {visibleRooms.length} dari {filteredRooms.length} ruangan
        {searchTerm && ` (difilter dari ${rooms.length} total ruangan)`}
      </div>
    </div>
  );
}
