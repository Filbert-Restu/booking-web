import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/shared/components/ui/button/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { authService } from '@/services/auth.service';
import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '@/lib/axios';

export const Route = createFileRoute('/login-option')({
  component: RouteComponent,
});

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  unit: string;
}

// Role to path mapping
const rolePathMap: Record<string, string> = {
  'Super Admin': '/admin/',
  'Wakil Dekan 1': '/wadek1/',
  Kemahasiswaan: '/kemahasiswaan/',
  'Sumber Daya': '/sumber-daya/',
  'Dosen Pendamping Himpunan': '/dosen-pendamping/',
  'Ketua Departemen': '/ketua-departemen/',
  'Ketua Ormawa': '/ketua-ormawa/',
  Senat: '/senat/', // Senat punya route sendiri
  Sekretaris: '/peminjam/',
  Peminjam: '/peminjam/',
};

// Role to variant mapping
const roleVariantMap: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'
> = {
  'Super Admin': 'destructive',
  'Wakil Dekan 1': 'default',
  Kemahasiswaan: 'secondary',
  'Sumber Daya': 'secondary',
  'Dosen Pendamping Himpunan': 'default',
  'Ketua Departemen': 'default',
  'Ketua Ormawa': 'outline',
  Senat: 'outline',
  Sekretaris: 'ghost',
  Peminjam: 'outline',
};

async function loginAsUser(user: User) {
  try {
    const response = await authService.login({
      email: user.email,
      password: 'password',
    });

    authService.saveAuthData(response);
    const path = rolePathMap[user.role] || '/peminjam/';
    window.location.href = path;
  } catch (error: unknown) {
    console.error('Login failed:', error);

    let errorMessage = 'Login gagal. Silakan coba lagi.';

    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as { message?: string };
      if (responseData?.message) {
        errorMessage = responseData.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    alert(errorMessage);
  }
}

function RouteComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/dev/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setFetchError(
          'Gagal mengambil data users. Pastikan server backend berjalan.',
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = async (user: User) => {
    setIsLoading(user.email);
    await loginAsUser(user);
    setIsLoading(null);
  };

  // Group users by role
  const adminUsers = users.filter(
    (u) => u.role === 'Super Admin' || u.role === 'Wakil Dekan 1',
  );
  const staffUsers = users.filter(
    (u) => u.role === 'Kemahasiswaan' || u.role === 'Sumber Daya',
  );
  const departemenUsers = users.filter((u) => u.role === 'Ketua Departemen');
  const dosenPendampingUsers = users.filter(
    (u) => u.role === 'Dosen Pendamping Himpunan',
  );
  const ketuaOrmawa = users.filter(
    (u) => u.role === 'Ketua Ormawa' || u.role === 'Senat',
  );
  const sekretarisAll = users.filter((u) => u.role === 'Sekretaris');
  const mahasiswaUsers = users.filter((u) => u.role === 'Peminjam');

  if (isFetching) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading users...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Card className='max-w-md w-full'>
          <CardHeader>
            <CardTitle className='text-red-600'>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 mb-4'>{fetchError}</p>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderUserButton = (user: User) => (
    <Button
      key={user.email}
      onClick={() => handleLogin(user)}
      variant={roleVariantMap[user.role] || 'outline'}
      className='w-full justify-start text-left h-auto py-3'
      disabled={isLoading !== null}
    >
      <div className='flex flex-col items-start'>
        <span className='font-semibold'>{user.name}</span>
        <span className='text-xs opacity-80'>{user.email}</span>
        <span className='text-xs opacity-70'>
          {user.role} · {user.unit}
        </span>
        {isLoading === user.email && (
          <span className='text-xs mt-1'>Loading...</span>
        )}
      </div>
    </Button>
  );

  return (
    <div className='p-6 space-y-6 max-w-7xl mx-auto'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Menu Login Development - FSM
        </h1>
        <p className='text-gray-600 mt-2'>
          Pilih user untuk login dan mengakses sistem sesuai role
        </p>
        <p className='text-sm text-gray-500 mt-1'>
          Password semua user:{' '}
          <code className='bg-gray-100 px-2 py-1 rounded'>password</code>
          <span className='ml-4 text-green-600'>
            ✓ Data dari database ({users.length} users)
          </span>
        </p>
      </div>

      {/* Admin & Pimpinan */}
      {adminUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Admin & Pimpinan Fakultas</CardTitle>
            <CardDescription>Akses penuh sistem dan pimpinan</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {adminUsers.map(renderUserButton)}
          </CardContent>
        </Card>
      )}

      {/* Staff Fakultas */}
      {staffUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Staff Fakultas</CardTitle>
            <CardDescription>Kemahasiswaan dan Sumber Daya</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {staffUsers.map(renderUserButton)}
          </CardContent>
        </Card>
      )}

      {/* Ketua Departemen */}
      {departemenUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ketua Departemen</CardTitle>
            <CardDescription>Ketua Departemen di FSM</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
            {departemenUsers.map(renderUserButton)}
          </CardContent>
        </Card>
      )}

      {/* Dosen Pendamping */}
      {dosenPendampingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dosen Pendamping</CardTitle>
            <CardDescription>Dosen Pendamping Himpunan dan UKM</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
            {dosenPendampingUsers.map(renderUserButton)}
          </CardContent>
        </Card>
      )}

      {/* Ketua Organisasi */}
      {ketuaOrmawa.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ketua Organisasi Mahasiswa</CardTitle>
            <CardDescription>Ketua HMD, BEM, Senat, dan UKM</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
            {ketuaOrmawa.map(renderUserButton)}
          </CardContent>
        </Card>
      )}

      {/* Sekretaris */}
      {sekretarisAll.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sekretaris Organisasi</CardTitle>
            <CardDescription>Sekretaris HMD, BEM, dan UKM</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
            {sekretarisAll.map(renderUserButton)}
          </CardContent>
        </Card>
      )}

      {/* Mahasiswa / Peminjam */}
      {mahasiswaUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mahasiswa</CardTitle>
            <CardDescription>Akses peminjaman dan pengajuan</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {mahasiswaUsers.map(renderUserButton)}
          </CardContent>
        </Card>
      )}

      {/* Back to Login */}
      <Card className='bg-blue-50 border-blue-200'>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-blue-900'>
              <strong>💡 Info:</strong> Ini adalah halaman development untuk
              testing berbagai role. Data diambil dari database via API{' '}
              <code className='bg-blue-100 px-2 py-1 rounded'>/dev/users</code>
            </p>
            <Link to='/login'>
              <Button variant='outline' size='sm'>
                Ke Halaman Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
