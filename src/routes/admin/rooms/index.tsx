import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Plus, Search, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

export const Route = createFileRoute('/admin/rooms/')({
  component: RouteComponent,
});

interface Room {
  id: number;
  name: string;
  code: string;
  capacity?: number;
  location?: string;
  building?: string;
  floor?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  description?: string;
  images?: string[];
  created_at?: string;
  updated_at?: string;
}

interface RoomBooking {
  id: number;
  room_id: number;
  document_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: string;
  booked_by?: number;
}

function RouteComponent() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    capacity: string;
    location: string;
    building: string;
    floor: string;
    description: string;
    status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  }>({
    name: '',
    code: '',
    capacity: '',
    location: '',
    building: '',
    floor: '',
    description: '',
    status: 'ACTIVE',
  });

  const [scheduleData, setScheduleData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    bookings: [] as RoomBooking[],
  });

  // Load rooms
  useEffect(() => {
    loadRooms();
  }, []);

  // Filter rooms
  useEffect(() => {
    let filtered = rooms;

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((room) => room.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(query) ||
          room.code.toLowerCase().includes(query) ||
          (room.location && room.location.toLowerCase().includes(query)) ||
          (room.building && room.building.toLowerCase().includes(query)),
      );
    }

    setFilteredRooms(filtered);
  }, [searchQuery, selectedStatus, rooms]);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ success: boolean; data: Room[] }>(
        '/rooms',
      );
      setRooms(response.data.data);
      setFilteredRooms(response.data.data);
      setError(null);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Gagal memuat ruangan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = () => {
    setFormData({
      name: '',
      code: '',
      capacity: '',
      location: '',
      building: '',
      floor: '',
      description: '',
      status: 'ACTIVE',
    });
    setIsCreateModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      code: room.code,
      capacity: room.capacity?.toString() || '',
      location: room.location || '',
      building: room.building || '',
      floor: room.floor || '',
      description: room.description || '',
      status: room.status,
    });
    setIsEditModalOpen(true);
  };

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailModalOpen(true);
  };

  const handleDeleteRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const handleViewSchedule = async (room: Room) => {
    setSelectedRoom(room);
    try {
      const response = await api.get<{
        success: boolean;
        data: { bookings: RoomBooking[] };
      }>(`/rooms/${room.id}/schedule`, {
        params: {
          start_date: scheduleData.startDate,
          end_date: scheduleData.endDate,
        },
      });
      setScheduleData({
        ...scheduleData,
        bookings: response.data.data.bookings,
      });
      setIsScheduleModalOpen(true);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal memuat jadwal ruangan');
    }
  };

  const submitCreateRoom = async () => {
    if (!formData.name || !formData.code) {
      alert('Harap isi nama dan kode ruangan');
      return;
    }

    try {
      await api.post('/rooms', {
        name: formData.name,
        code: formData.code,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        location: formData.location || null,
        building: formData.building || null,
        floor: formData.floor || null,
        description: formData.description || null,
        status: formData.status,
      });

      setIsCreateModalOpen(false);
      loadRooms();
      alert('Ruangan berhasil dibuat');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal membuat ruangan');
    }
  };

  const submitEditRoom = async () => {
    if (!selectedRoom || !formData.name || !formData.code) {
      return;
    }

    try {
      await api.put(`/rooms/${selectedRoom.id}`, {
        name: formData.name,
        code: formData.code,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        location: formData.location || null,
        building: formData.building || null,
        floor: formData.floor || null,
        description: formData.description || null,
        status: formData.status,
      });

      setIsEditModalOpen(false);
      loadRooms();
      setSelectedRoom(null);
      alert('Ruangan berhasil diperbarui');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal memperbarui ruangan');
    }
  };

  const confirmDeleteRoom = async () => {
    if (!selectedRoom) return;

    try {
      await api.delete(`/rooms/${selectedRoom.id}`);
      setIsDeleteDialogOpen(false);
      loadRooms();
      setSelectedRoom(null);
      alert('Ruangan berhasil dihapus');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal menghapus ruangan');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-lg'>Loading ruangan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-3 sm:p-6'>
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold'>Manajemen Ruangan</h1>
        <p className='text-gray-600 mt-1 text-sm sm:text-base'>
          Kelola ruangan dan jadwal peminjaman
        </p>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {/* Search and Create Button */}
      <div className='mb-4 flex flex-row items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            type='text'
            placeholder='Cari ruangan...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 h-10'
          />
        </div>
        <Button
          onClick={handleCreateRoom}
          className='whitespace-nowrap h-10 shrink-0'
        >
          <Plus className='mr-2 h-4 w-4' />
          <span className='hidden sm:inline'>Buat Ruangan</span>
          <span className='sm:hidden'>Buat</span>
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className='mb-4 flex flex-wrap gap-2'>
        <Button
          variant={selectedStatus === null ? 'default' : 'outline'}
          size='sm'
          onClick={() => setSelectedStatus(null)}
          className='text-xs sm:text-sm'
        >
          Semua
        </Button>
        {['ACTIVE', 'MAINTENANCE', 'INACTIVE'].map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedStatus(status)}
            className='text-xs sm:text-sm'
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Rooms Table */}
      <div className='rounded-lg border overflow-x-auto'>
        <Table className='min-w-full'>
          <TableHeader>
            <TableRow className='bg-gray-50'>
              <TableHead className='font-semibold'>Nama Ruangan</TableHead>
              <TableHead className='font-semibold hidden sm:table-cell'>
                Kode
              </TableHead>
              <TableHead className='font-semibold hidden md:table-cell'>
                Kapasitas
              </TableHead>
              <TableHead className='font-semibold hidden lg:table-cell'>
                Lokasi
              </TableHead>
              <TableHead className='font-semibold'>Status</TableHead>
              <TableHead className='font-semibold text-center'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.map((room) => (
              <TableRow key={room.id} className='hover:bg-gray-50'>
                <TableCell>
                  <div>
                    <p className='font-medium text-sm sm:text-base'>
                      {room.name}
                    </p>
                    <p className='text-xs text-gray-500 sm:hidden'>
                      {room.code}
                    </p>
                    {room.building && (
                      <p className='text-xs text-gray-500 hidden sm:block'>
                        {room.building}
                        {room.floor && `, Lantai ${room.floor}`}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className='hidden sm:table-cell'>
                  <span className='text-sm'>{room.code}</span>
                </TableCell>
                <TableCell className='hidden md:table-cell'>
                  <span className='text-sm'>
                    {room.capacity ? `${room.capacity} orang` : '-'}
                  </span>
                </TableCell>
                <TableCell className='hidden lg:table-cell'>
                  <span className='text-sm'>{room.location || '-'}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(room.status)}`}
                  >
                    {room.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className='flex gap-1 justify-center shrink-0'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleViewRoom(room)}
                      title='Detail'
                      className='h-8 w-8 p-0'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleViewSchedule(room)}
                      title='Jadwal'
                      className='h-8 w-8 p-0'
                    >
                      <Calendar className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditRoom(room)}
                      title='Edit'
                      className='h-8 w-8 p-0'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteRoom(room)}
                      title='Hapus'
                      className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRooms.length === 0 && (
        <div className='rounded-lg border p-8 text-center'>
          <p className='text-gray-600'>Tidak ada ruangan ditemukan</p>
        </div>
      )}

      {/* Create/Edit Room Modal */}
      <Dialog
        open={isCreateModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedRoom(null);
          }
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {isEditModalOpen ? 'Edit Ruangan' : 'Buat Ruangan Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen
                ? 'Perbarui informasi ruangan'
                : 'Tambahkan ruangan baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div>
              <Label htmlFor='name'>Nama Ruangan *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='Contoh: Lab Komputer A'
              />
            </div>
            <div>
              <Label htmlFor='code'>Kode Ruangan *</Label>
              <Input
                id='code'
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder='Contoh: LC-A-01'
              />
            </div>
            <div>
              <Label htmlFor='capacity'>Kapasitas</Label>
              <Input
                id='capacity'
                type='number'
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                placeholder='Jumlah orang'
              />
            </div>
            <div>
              <Label htmlFor='building'>Gedung</Label>
              <Input
                id='building'
                value={formData.building}
                onChange={(e) =>
                  setFormData({ ...formData, building: e.target.value })
                }
                placeholder='Contoh: Gedung A'
              />
            </div>
            <div>
              <Label htmlFor='floor'>Lantai</Label>
              <Input
                id='floor'
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                placeholder='Contoh: 2'
              />
            </div>
            <div>
              <Label htmlFor='location'>Lokasi</Label>
              <Input
                id='location'
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder='Deskripsi lokasi'
              />
            </div>
            <div>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ACTIVE'>Aktif</SelectItem>
                  <SelectItem value='MAINTENANCE'>Perawatan</SelectItem>
                  <SelectItem value='INACTIVE'>Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='description'>Deskripsi</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Deskripsi ruangan...'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedRoom(null);
              }}
            >
              Batal
            </Button>
            <Button
              onClick={isEditModalOpen ? submitEditRoom : submitCreateRoom}
            >
              {isEditModalOpen ? 'Simpan Perubahan' : 'Buat Ruangan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{selectedRoom?.name}</DialogTitle>
            <DialogDescription>Informasi detail ruangan</DialogDescription>
          </DialogHeader>
          {selectedRoom && (
            <div className='space-y-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Kode Ruangan</p>
                  <p className='font-medium'>{selectedRoom.code}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Status</p>
                  <p
                    className={`font-medium px-2 py-1 rounded text-sm w-fit ${getStatusColor(selectedRoom.status)}`}
                  >
                    {selectedRoom.status}
                  </p>
                </div>
                {selectedRoom.capacity && (
                  <div>
                    <p className='text-sm text-gray-600'>Kapasitas</p>
                    <p className='font-medium'>{selectedRoom.capacity} orang</p>
                  </div>
                )}
                {selectedRoom.building && (
                  <div>
                    <p className='text-sm text-gray-600'>Gedung</p>
                    <p className='font-medium'>{selectedRoom.building}</p>
                  </div>
                )}
                {selectedRoom.floor && (
                  <div>
                    <p className='text-sm text-gray-600'>Lantai</p>
                    <p className='font-medium'>{selectedRoom.floor}</p>
                  </div>
                )}
                {selectedRoom.location && (
                  <div>
                    <p className='text-sm text-gray-600'>Lokasi</p>
                    <p className='font-medium'>{selectedRoom.location}</p>
                  </div>
                )}
              </div>
              {selectedRoom.description && (
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Deskripsi</p>
                  <p className='text-sm'>{selectedRoom.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDetailModalOpen(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Hapus Ruangan?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus ruangan "{selectedRoom?.name}"?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
          <div className='flex gap-2 justify-end'>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRoom}
              className='bg-red-600 hover:bg-red-700'
            >
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Jadwal Peminjaman - {selectedRoom?.name}</DialogTitle>
            <DialogDescription>
              Jadwal peminjaman dari {scheduleData.startDate} hingga{' '}
              {scheduleData.endDate}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='start-date'>Tanggal Mulai</Label>
                <Input
                  id='start-date'
                  type='date'
                  value={scheduleData.startDate}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor='end-date'>Tanggal Selesai</Label>
                <Input
                  id='end-date'
                  type='date'
                  value={scheduleData.endDate}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {scheduleData.bookings.length > 0 ? (
              <div className='space-y-2'>
                {scheduleData.bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className='p-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <p className='font-medium text-sm'>
                            {booking.purpose}
                          </p>
                          <p className='text-xs text-gray-600'>
                            {booking.booking_date} | {booking.start_time} -{' '}
                            {booking.end_time}
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            Status: {booking.status}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <p className='text-gray-500'>
                  Tidak ada peminjaman pada periode ini
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
