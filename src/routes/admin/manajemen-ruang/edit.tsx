import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/shadcn/button/button';
import { Input } from '@/components/ui/shadcn/input';

export const Route = createFileRoute('/admin/manajemen-ruang/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  // Untuk saat ini gunakan data dummy sebagai nilai awal
  const [namaRuang, setNamaRuang] = useState('B101');
  const [kuotaRuang, setKuotaRuang] = useState('10');
  const [catatan, setCatatan] = useState('ruang kelas');
  const [fotoRuang, setFotoRuang] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFotoRuang(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // TODO: Integrasikan dengan API backend untuk update data
    console.log('Update Ruangan', {
      namaRuang,
      kuotaRuang,
      catatan,
      fotoRuangName: fotoRuang?.name,
    });

    alert('Data ruangan berhasil diperbarui (dummy).');
    navigate({ to: '/admin/manajemen-ruang' });
  };

  const handleClose = () => {
    navigate({ to: '/admin/manajemen-ruang' });
  };

  return (
    <div className='p-6 flex justify-center'>
      <div className='w-full max-w-xl bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6'>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>Edit Ruangan</h1>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 text-2xl leading-none'
            aria-label='Tutup'
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1'>
            <label
              htmlFor='nama-ruangan'
              className='block text-sm font-medium text-gray-700'
            >
              Nama Ruangan
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
              Kuota Ruangan
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
              htmlFor='catatan'
              className='block text-sm font-medium text-gray-700'
            >
              Catatan
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
              Foto Ruangan
            </label>
            <input
              id='foto-ruangan'
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200'
            />
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
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
  );
}
