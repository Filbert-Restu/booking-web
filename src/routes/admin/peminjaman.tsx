import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Trash2, Eye, X } from 'lucide-react';
import { AxiosError } from 'axios';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
    roomService,
    type RoomBooking,
} from '@/services/room.service';

export const Route = createFileRoute('/admin/peminjaman')({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            status: (search.status as string) || 'ALL',
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { status } = Route.useSearch();
    const [bookings, setBookings] = useState<RoomBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(status);
    const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [bookingToDelete, setBookingToDelete] = useState<RoomBooking | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await roomService.getBookings();
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || 'Gagal memuat data peminjaman');
            } else {
                setError('Gagal memuat data peminjaman');
            }
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!bookingToDelete) return;

        try {
            setDeleting(bookingToDelete.id);
            await roomService.deleteBooking(bookingToDelete.id);
            setBookings((prev) => prev.filter((b) => b.id !== bookingToDelete.id));
            if (selectedBooking?.id === bookingToDelete.id) setSelectedBooking(null);
            setIsDeleteDialogOpen(false);
        } catch (err) {
            console.error('Failed to delete booking:', err);
            if (err instanceof AxiosError) {
                alert(err.response?.data?.message || 'Gagal menghapus peminjaman');
            } else {
                alert('Gagal menghapus peminjaman');
            }
        } finally {
            setDeleting(null);
            setBookingToDelete(null);
        }
    };

    const handleDeleteClick = (booking: RoomBooking) => {
        setBookingToDelete(booking);
        setIsDeleteDialogOpen(true);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
            REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
            CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
            COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
        };
        const config = statusConfig[status] || statusConfig.PENDING;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // Helpers (same as peminjaman-ruang)
    const getUnitCode = (booking: RoomBooking): string => {
        if (booking.booked_by_user?.unit_code) return booking.booked_by_user.unit_code;
        if (booking.bookedBy?.unit?.code) return booking.bookedBy.unit.code;
        return '-';
    };

    const getBorrowerName = (booking: RoomBooking): string => {
        if (booking.booked_by_user?.name) return booking.booked_by_user.name;
        if (booking.bookedBy?.name) return booking.bookedBy.name;
        return '-';
    };

    const getRoomName = (booking: RoomBooking): string => {
        return booking.room?.code || booking.room?.name || '-';
    };

    // Filtering
    const filteredBookings = bookings.filter((item) => {
        // Status filter
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            return [
                getUnitCode(item),
                getBorrowerName(item),
                getRoomName(item),
                item.booking_date,
                item.purpose || '',
            ]
                .join(' ')
                .toLowerCase()
                .includes(searchLower);
        }
        return true;
    });

    if (loading && bookings.length === 0) {
        return (
            <div className='p-6 flex justify-center items-center min-h-[400px]'>
                <div className='text-lg font-semibold text-gray-700'>Memuat data...</div>
            </div>
        );
    }

    if (error && bookings.length === 0) {
        return (
            <div className='p-6 flex justify-center items-center min-h-[400px]'>
                <div className='text-center'>
                    <div className='text-lg font-semibold text-red-600 mb-4'>{error}</div>
                    <Button onClick={fetchBookings}>Coba Lagi</Button>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
                    <h1 className='text-xl font-semibold text-gray-900'>Daftar Peminjaman Ruangan</h1>
                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className='w-40'>
                                <SelectValue placeholder='Filter Status' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='ALL'>Semua Status</SelectItem>
                                <SelectItem value='PENDING'>Pending</SelectItem>
                                <SelectItem value='APPROVED'>Approved</SelectItem>
                                <SelectItem value='REJECTED'>Rejected</SelectItem>
                                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                                <SelectItem value='COMPLETED'>Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            className='w-48'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Cari...'
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='overflow-x-auto'>
                    <Table className='min-w-full text-sm'>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-12 text-center'>No</TableHead>
                                <TableHead>Kode Unit</TableHead>
                                <TableHead>Nama Peminjam</TableHead>
                                <TableHead>Ruangan</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-center'>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className='text-center text-gray-500 py-8'>
                                        Tidak ada data peminjaman
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{getUnitCode(item)}</TableCell>
                                        <TableCell>{getBorrowerName(item)}</TableCell>
                                        <TableCell>{getRoomName(item)}</TableCell>
                                        <TableCell>
                                            {new Date(item.booking_date).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            {item.start_time} - {item.end_time}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell>
                                            <div className='flex items-center justify-center gap-1'>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => setSelectedBooking(item)}
                                                    title='Lihat Detail'
                                                >
                                                    <Eye className='w-4 h-4 text-blue-600' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => handleDeleteClick(item)}
                                                    disabled={deleting === item.id || item.status === 'APPROVED'}
                                                    title={item.status === 'APPROVED' ? 'Tidak bisa hapus yang sudah approved' : 'Hapus'}
                                                >
                                                    <Trash2 className={`w-4 h-4 ${item.status === 'APPROVED' ? 'text-gray-300' : 'text-red-600'}`} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className='flex items-center justify-between px-4 py-3 border-t text-xs text-gray-500 bg-gray-50'>
                    <span>Showing {filteredBookings.length} of {bookings.length} entries</span>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedBooking && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
                    <div className='bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between p-4 border-b'>
                            <h2 className='text-lg font-semibold text-gray-900'>Detail Peminjaman</h2>
                            <button onClick={() => setSelectedBooking(null)} className='text-gray-400 hover:text-gray-600'>
                                <X className='w-5 h-5' />
                            </button>
                        </div>
                        <div className='p-4 space-y-3'>
                            <DetailRow label='ID Booking' value={String(selectedBooking.id)} />
                            <DetailRow label='Ruangan' value={getRoomName(selectedBooking)} />
                            <DetailRow label='Kode Unit' value={getUnitCode(selectedBooking)} />
                            <DetailRow label='Nama Peminjam' value={getBorrowerName(selectedBooking)} />
                            <DetailRow
                                label='Tanggal'
                                value={new Date(selectedBooking.booking_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            />
                            <DetailRow label='Waktu' value={`${selectedBooking.start_time} - ${selectedBooking.end_time}`} />
                            <DetailRow label='Keperluan' value={selectedBooking.purpose || '-'} />
                            <DetailRow label='Status' value={selectedBooking.status} badge={getStatusBadge(selectedBooking.status)} />
                            {selectedBooking.document && (
                                <DetailRow label='Dokumen' value={selectedBooking.document.title || '-'} />
                            )}
                        </div>
                        <div className='flex justify-end gap-2 p-4 border-t'>
                            {selectedBooking.status !== 'APPROVED' && (
                                <Button
                                    variant='destructive'
                                    size='sm'
                                    onClick={() => {
                                        setSelectedBooking(null);
                                        handleDeleteClick(selectedBooking);
                                    }}
                                    disabled={deleting === selectedBooking.id}
                                >
                                    <Trash2 className='w-4 h-4 mr-1' />
                                    Hapus
                                </Button>
                            )}
                            <Button variant='outline' size='sm' onClick={() => setSelectedBooking(null)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Peminjaman</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data peminjaman ini?
                            <br />
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className='bg-red-600 hover:bg-red-700'
                        >
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function DetailRow({ label, value, badge }: { label: string; value: string; badge?: React.ReactNode }) {
    return (
        <div className='flex flex-col sm:flex-row sm:items-start gap-1'>
            <span className='text-sm font-medium text-gray-500 sm:w-36 shrink-0'>{label}</span>
            <span className='text-sm text-gray-900'>{badge || value}</span>
        </div>
    );
}

export default RouteComponent;
