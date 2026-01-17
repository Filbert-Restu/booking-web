import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/shadcn/button/button';
import { UserPlus } from 'lucide-react';
import { UserTable } from '@/components/UserTable';

export const Route = createFileRoute('/admin/users')({
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
    // TODO: Implement add user modal/form
    alert('Fitur tambah user akan segera tersedia');
  };

  const handleToggleStatus = (id: number, newStatus: 'active' | 'inactive') => {
    if (
      confirm(
        `Apakah Anda yakin ingin ${newStatus === 'active' ? 'mengaktifkan' : 'menonaktifkan'} user ini?`
      )
    ) {
      // TODO: Implement toggle status API call
      console.log(`Toggle user ${id} to ${newStatus}`);
    }
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
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

      <UserTable
        users={usersData}
        onDelete={handleDelete}
        onViewDetail={handleViewDetail}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
