import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Button } from '@/components/ui/shadcn/button/button';
import { Input } from '@/components/ui/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';

export const Route = createFileRoute('/admin/users/add')({
  component: RouteComponent,
});

function RouteComponent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Peminjam');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const roles = ['Admin', 'Kemahasiswaan', 'Sumber Daya', 'Peminjam'];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Nama dan email wajib diisi');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      status,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    // TODO: Replace with an API call to create user
    console.log('Creating user', newUser);
    alert('User berhasil ditambahkan (dummy)');
    // Kembali ke daftar user
    window.location.href = '/admin/users/';
  };

  const handleCancel = () => {
    window.location.href = '/admin/users/';
  };

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Tambah User</h1>
        <p className='text-gray-600 mt-1'>Isi data user baru</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 max-w-2xl'
      >
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Nama
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Nama lengkap'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Email
          </label>
          <Input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='email@contoh.com'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Role
            </label>
            <Select value={role} onValueChange={(v) => setRole(v)}>
              <SelectTrigger>
                <SelectValue placeholder='Pilih Role' />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Status
            </label>
            <Select
              value={status}
              onValueChange={(v: 'active' | 'inactive') => setStatus(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Pilih Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex gap-2 justify-end'>
          <Button type='button' variant='ghost' onClick={handleCancel}>
            Batal
          </Button>
          <Button type='submit' className='flex items-center'>
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
