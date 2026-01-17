import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/shadcn/button/button';
import { UserPlus, Search } from 'lucide-react';
import { UserTable } from '@/components/UserTable';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Input } from '@/components/ui/shadcn/input';

export const Route = createFileRoute('/admin/users/')({
  component: RouteComponent,
});

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Data dummy users
const usersData: User[] = [
  {
    id: 1,
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@example.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Siti Rahma',
    email: 'siti.rahma@example.com',
    role: 'Peminjam',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    role: 'Peminjam',
    status: 'inactive',
    createdAt: '2024-03-10',
  },
  {
    id: 4,
    name: 'Dewi Lestari',
    email: 'dewi.lestari@example.com',
    role: 'Kemahasiswaan',
    status: 'active',
    createdAt: '2024-04-05',
  },
];

function RouteComponent() {
  const [selectedRole, setSelectedRole] = useState<string>('Semua');
  const [searchName, setSearchName] = useState<string>('');

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus Peminjam ini?')) {
      // TODO: Implement delete API call
      console.log('Delete user with id:', id);
    }
  };

  const handleViewDetail = (user: User) => {
    alert(
      `Detail User:\n\nNama: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.status}\nTerdaftar: ${user.createdAt}`
    );
  };

  const handleAddUser = () => {
    // Pindah ke halaman tambah user add.tsx
    window.location.href = '/admin/users/add';
  };

  const handleToggleStatus = (id: number, newStatus: 'active' | 'inactive') => {
    if (
      confirm(
        `Apakah Anda yakin ingin ${newStatus === `active` ? `mengaktifkan` : `menonaktifkan`} user ini?`
      )
    ) {
      // TODO: Implement toggle status API call
      console.log(`Toggle user ${id} to ${newStatus}`);
    }
  };

  const roles = ['Semua', 'Admin', 'Kemahasiswaan', 'Sumber Daya', 'Peminjam'];

  const filteredUsers = usersData.filter((user) => {
    const matchRole = selectedRole === 'Semua' || user.role === selectedRole;
    const matchName = user.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    return matchRole && matchName;
  });

  return (
    <div className='p-6 space-y-6'>
      <div className='block md:flex md:justify-between items-center space-y-4 md:space-y-0'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Manajemen User</h1>
          <p className='text-gray-600 mt-1'>
            Kelola pengguna sistem peminjaman ruang
          </p>
        </div>
        <Button
          onClick={handleAddUser}
          className='flex items-center gap-2'
          variant='default'
        >
          <UserPlus className='w-4 h-4' />
          Tambah User
        </Button>
      </div>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='flex gap-4'>
          {/* Search by Name */}
          <div className='flex-1 space-y-2'>
            <label className='text-sm font-medium text-gray-700'>
              Cari Nama
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                type='text'
                placeholder='Cari berdasarkan nama...'
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          {/* Filter Role Dropdown */}
          <div className='w-48 space-y-2'>
            <label className='text-sm font-medium text-gray-700'>
              Filter Role
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder='Pilih Role' />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        onDelete={handleDelete}
        onViewDetail={handleViewDetail}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
