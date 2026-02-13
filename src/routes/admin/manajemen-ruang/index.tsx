import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import {
  Plus,
  Pencil,
  Search,
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Memuat data ruangan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>{error}</p>
          <Button onClick={fetchRooms}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl'>
      {/* Header */}
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2'>
          Manajemen Ruang
        </h1>
        <p className='text-sm sm:text-base text-gray-600'>
          Kelola data ruang yang tersedia untuk peminjaman
        </p>
      </div>

      {/* Search and Add Button */}
      <div className='mb-4 sm:mb-6 flex flex-row justify-between gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Cari ruangan...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-7 sm:pl-10 text-sm h-9 sm:h-10'
          />
        </div>
        <Button
          onClick={() => navigate({ to: '/admin/manajemen-ruang/add' })}
          className='whitespace-nowrap h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base'
        >
          <Plus className='h-5 w-5 mr-2' />
          <span>Tambah Ruang</span>
        </Button>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto max-w-full'>
          <Table className='w-full min-w-[640px]'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12 text-center text-xs sm:text-sm px-2'>No</TableHead>
                <TableHead className='text-xs sm:text-sm px-2 min-w-20'>Kode</TableHead>
                <TableHead className='text-xs sm:text-sm px-2 min-w-30'>Nama Ruangan</TableHead>
                <TableHead className='text-xs sm:text-sm px-2 w-20'>Kapasitas</TableHead>
                <TableHead className='hidden lg:table-cell text-xs sm:text-sm px-2 min-w-25'>Fasilitas</TableHead>
                <TableHead className='text-xs sm:text-sm px-2 w-24'>Status</TableHead>
                <TableHead className='text-center text-xs sm:text-sm px-2 w-24'>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center text-gray-500 h-32'
                  >
                    {debouncedSearchTerm
                      ? 'Tidak ada ruangan yang cocok dengan pencarian'
                      : 'Belum ada data ruangan'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room, index) => (
                  <TableRow key={room.id}>
                    <TableCell className='font-medium text-center text-xs sm:text-sm py-2 sm:py-3'>{index + 1}</TableCell>
                    <TableCell className='text-xs sm:text-sm py-2 sm:py-3'>{room.code}</TableCell>
                    <TableCell className='text-xs sm:text-sm font-medium text-gray-900 py-2 sm:py-3'>{room.name}</TableCell>
                    <TableCell className='text-xs sm:text-sm py-2 sm:py-3'>{room.capacity || '-'}</TableCell>
                    <TableCell className='hidden md:table-cell text-xs sm:text-sm py-2 sm:py-3'>
                      {Array.isArray(room.facilities) && room.facilities.length > 0
                        ? room.facilities.join(', ')
                        : '-'}
                    </TableCell>
                    <TableCell className='text-xs sm:text-sm py-2 sm:py-3'>
                      <span
                        className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
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
                    <TableCell className='py-2 sm:py-3'>
                      <div className='flex items-center justify-center gap-1 sm:gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            navigate({
                              to: '/admin/manajemen-ruang/detail',
                              search: { id: String(room.id) },
                            })
                          }
                          className='h-6 w-6 sm:h-8 sm:w-8 p-0'
                        >
                          <Eye className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            navigate({
                              to: '/admin/manajemen-ruang/edit',
                              search: { id: String(room.id) },
                            })
                          }
                          className='h-6 w-6 sm:h-8 sm:w-8 p-0'
                        >
                          <Pencil className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteRoom(room)}
                          className='h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                          <Trash2 className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                      </div>
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
