import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { Button } from '@/components/ui/shadcn/button/button';
import { Eye, Trash2 } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onDelete: (id: number) => void;
  onViewDetail: (user: User) => void;
  onToggleStatus: (id: number, newStatus: 'active' | 'inactive') => void;
}

export function UserTable({ users, onDelete, onViewDetail }: UserTableProps) {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-center'>No</TableHead>
            <TableHead className='text-center'>Nama</TableHead>
            <TableHead className='text-center'>Email</TableHead>
            <TableHead className='text-center'>Role</TableHead>
            <TableHead className='text-center'>Terdaftar</TableHead>
            <TableHead className='text-center'>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell className='font-medium text-center'>
                {index + 1}
              </TableCell>
              <TableCell className='text-center'>{user.name}</TableCell>
              <TableCell className='text-center'>{user.email}</TableCell>
              <TableCell className='text-center'>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'Admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'Kemahasiswaan'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'Sumber Daya'
                          ? 'bg-orange-100 text-orange-800'
                          : user.role === 'Peminjam'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.role}
                </span>
              </TableCell>
              <TableCell className='text-center'>{user.createdAt}</TableCell>
              <TableCell className='text-center'>
                <div className='flex gap-2 items-center justify-center'>
                  <Button
                    onClick={() => onViewDetail(user)}
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-1'
                  >
                    <Eye className='w-4 h-4' />
                    Detail
                  </Button>
                  <Button
                    onClick={() => onDelete(user.id)}
                    variant='destructive'
                    size='sm'
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users.length === 0 && (
        <div className='text-center py-12 text-gray-500'>
          Tidak ada user yang tersedia
        </div>
      )}
    </div>
  );
}
