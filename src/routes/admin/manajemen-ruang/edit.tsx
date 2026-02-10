import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AxiosError } from 'axios';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import { roomService } from '@/services/room.service';

export const Route = createFileRoute('/admin/manajemen-ruang/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/admin/manajemen-ruang/edit' }) as {
    id?: string;
  };
  const roomId = search.id ? parseInt(search.id) : null;

  const [namaRuang, setNamaRuang] = useState('');
  const [kodeRuang, setKodeRuang] = useState('');
  const [kuotaRuang, setKuotaRuang] = useState('10');
  const [catatan, setCatatan] = useState('');
  const [fasilitas, setFasilitas] = useState('');
  const [fotoRuang, setFotoRuang] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const fetchRoomData = async () => {
    if (!roomId) return;

    try {
      setLoadingData(true);
      const data = await roomService.getRoom(roomId);
      const room = data.room;

      setNamaRuang(room.name);
      setKodeRuang(room.code);
      setKuotaRuang(String(room.capacity || 10));
      setCatatan(room.description || '');
      setFasilitas(
        Array.isArray(room.facilities) ? room.facilities.join(', ') : '',
      );
    } catch (err) {
      console.error('Failed to fetch room data:', err);
      alert('Gagal memuat data ruangan');
      navigate({ to: '/admin/manajemen-ruang' });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    } else {
      alert('ID ruangan tidak ditemukan');
      navigate({ to: '/admin/manajemen-ruang' });
    }
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFotoRuang(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!roomId) {
      alert('ID ruangan tidak valid');
      return;
    }

    if (!namaRuang.trim() || !kodeRuang.trim()) {
      alert('Nama ruangan dan kode ruangan wajib diisi!');
      return;
    }

    try {
      setLoading(true);

      // Update room data
      const facilitiesArray = fasilitas
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const roomData = {
        name: namaRuang,
        code: kodeRuang,
        capacity: parseInt(kuotaRuang) || 10,
        description: catatan,
        facilities: facilitiesArray,
      };

      await roomService.updateRoom(roomId, roomData);

      // Upload new photo if provided
      if (fotoRuang) {
        try {
          await roomService.uploadImage(roomId, fotoRuang);
        } catch (err) {
          console.error('Failed to upload image:', err);
          // Continue even if image upload fails
        }
      }

      alert('Data ruangan berhasil diperbarui!');
      navigate({ to: '/admin/manajemen-ruang' });
    } catch (err) {
      console.error('Failed to update room:', err);
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Gagal memperbarui ruangan');
      } else {
        alert('Terjadi kesalahan saat memperbarui ruangan');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className='p-6 flex justify-center items-center min-h-screen'>
        <div className='text-lg font-semibold text-gray-700'>
          Memuat data ruangan...
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 flex justify-center'>
      <div className='w-full max-w-xl bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6'>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              Edit Ruangan
            </h1>
          </div>
          <button
            type='button'
            onClick={() => navigate({ to: '/admin/manajemen-ruang' })}
            className='text-gray-400 hover:text-gray-600 text-2xl leading-none'
            aria-label='Tutup'
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1'>
            <label
              htmlFor='kode-ruangan'
              className='block text-sm font-medium text-gray-700'
            >
              Kode Ruangan *
            </label>
            <Input
              id='kode-ruangan'
              value={kodeRuang}
              onChange={(e) => setKodeRuang(e.target.value)}
              required
            />
          </div>

          <div className='space-y-1'>
            <label
              htmlFor='nama-ruangan'
              className='block text-sm font-medium text-gray-700'
            >
              Nama Ruangan *
            </label>
            <Input
              id='nama-ruangan'
              value={namaRuang}
              onChange={(e) => setNamaRuang(e.target.value)}
              required
            />
          </div>

          <div className='space-y-1'>
            <label
              htmlFor='kuota-ruangan'
              className='block text-sm font-medium text-gray-700'
            >
              Kapasitas Ruangan
            </label>
            <Input
              id='kuota-ruangan'
              type='number'
              min={1}
              value={kuotaRuang}
              onChange={(e) => setKuotaRuang(e.target.value)}
              required
            />
          </div>

          <div className='space-y-1'>
            <label
              htmlFor='fasilitas'
              className='block text-sm font-medium text-gray-700'
            >
              Fasilitas (pisahkan dengan koma)
            </label>
            <textarea
              id='fasilitas'
              value={fasilitas}
              onChange={(e) => setFasilitas(e.target.value)}
              placeholder='AC, Proyektor, Whiteboard'
              rows={3}
              className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div className='space-y-1'>
            <label
              htmlFor='catatan'
              className='block text-sm font-medium text-gray-700'
            >
              Deskripsi/Catatan
            </label>
            <textarea
              id='catatan'
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={4}
              className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div className='space-y-1'>
            <label
              htmlFor='foto-ruangan'
              className='block text-sm font-medium text-gray-700'
            >
              Foto Ruangan (Upload baru untuk mengganti)
            </label>
            <input
              id='foto-ruangan'
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200'
            />
            {fotoRuang && (
              <p className='text-sm text-gray-500 mt-1'>
                File baru: {fotoRuang.name}
              </p>
            )}
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate({ to: '/admin/manajemen-ruang' })}
              className='px-6'
              disabled={loading}
            >
              Tutup
            </Button>
            <Button type='submit' className='px-6' disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
