import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/shared/components/ui/button/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { authService } from '@/services/auth.service';
import { useState } from 'react';
import axios from 'axios';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

interface User {
  name: string;
  email: string;
  role: string;
  unit: string;
  path: string;
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'ghost'
    | 'link';
}

const users: User[] = [
  // Admin & Pimpinan Fakultas
  {
    name: 'Mr. Adming',
    email: 'admin@ft.ac.id',
    role: 'Admin',
    unit: 'Fakultas Teknik',
    path: '/admin/',
    variant: 'destructive',
  },
  {
    name: 'Prof. Dr. Budi Santoso',
    email: 'wadek1@ft.ac.id',
    role: 'Wakil Dekan 1',
    unit: 'Fakultas Teknik',
    path: '/wadek/',
    variant: 'default',
  },

  // Staff Fakultas
  {
    name: 'Ibu Sari Dewi',
    email: 'kemahasiswaan.fakultas@ft.ac.id',
    role: 'Kemahasiswaan Fakultas',
    unit: 'Fakultas Teknik',
    path: '/kemahasiswaan/',
    variant: 'secondary',
  },
  {
    name: 'Bapak Bapak',
    email: 'sumberdaya.fakultas@ft.ac.id',
    role: 'Sumber Daya Fakultas',
    unit: 'Fakultas Teknik',
    path: '/sumber-daya/',
    variant: 'secondary',
  },

  // Ketua Prodi
  {
    name: 'Dr. Siti Rahmawati',
    email: 'kaprodi.if@ft.ac.id',
    role: 'Ketua Prodi',
    unit: 'Program Studi Informatika',
    path: '/ketua-prodi/',
    variant: 'default',
  },
  {
    name: 'Dr. Bambang Suryadi',
    email: 'kaprodi.te@ft.ac.id',
    role: 'Ketua Prodi',
    unit: 'Program Studi Teknik Elektro',
    path: '/ketua-prodi/',
    variant: 'default',
  },
  {
    name: 'Dr. Agus Prasetyo',
    email: 'kaprodi.ts@ft.ac.id',
    role: 'Ketua Prodi',
    unit: 'Program Studi Teknik Sipil',
    path: '/ketua-prodi/',
    variant: 'default',
  },

  // Pembimbing
  {
    name: 'Bu Siapa',
    email: 'pembimbingormawa@ft.ac.id',
    role: 'Pembimbing Ormawa',
    unit: 'Program Studi Informatika',
    path: '/pembimbing/',
    variant: 'default',
  },

  // Organisasi Mahasiswa - Ketua
  {
    name: 'Andi Wijaya',
    email: 'senat@students.ac.id',
    role: 'Ketua Senat',
    unit: 'Senat Fakultas Teknik',
    path: '/ketua-senat/',
    variant: 'outline',
  },
  {
    name: 'Budi Setiawan',
    email: 'ketua.bem@student.ac.id',
    role: 'Ketua BEM',
    unit: 'BEM Fakultas Teknik',
    path: '/ketua-bem/',
    variant: 'outline',
  },
  {
    name: 'Ahmad Rizki',
    email: 'ketua.hima.if@student.ac.id',
    role: 'Ketua HIMA',
    unit: 'HIMA Informatika',
    path: '/ketua-hima/',
    variant: 'outline',
  },
  {
    name: 'Rudi Hartono',
    email: 'ketua.hima.te@student.ac.id',
    role: 'Ketua HIMA',
    unit: 'HIMA Teknik Elektro',
    path: '/ketua-hima/',
    variant: 'outline',
  },
  {
    name: 'Fitri Handayani',
    email: 'ketua.hima.ts@student.ac.id',
    role: 'Ketua HIMA',
    unit: 'HIMA Teknik Sipil',
    path: '/ketua-hima/',
    variant: 'outline',
  },
  {
    name: 'Fajar Nugroho',
    email: 'ketua.ukm@student.ac.id',
    role: 'Ketua UKM',
    unit: 'UKM Olahraga',
    path: '/ketua-ukm/',
    variant: 'outline',
  },

  // Organisasi Mahasiswa - Sekretaris
  {
    name: 'Dr. Putri Maharani',
    email: 'sekretaris.senat@students.ac.id',
    role: 'Sekretaris Senat',
    unit: 'Senat Fakultas Teknik',
    path: '/sekretaris-senat/',
    variant: 'ghost',
  },
  {
    name: 'Sinta Kusuma',
    email: 'sekretaris.bem@student.ac.id',
    role: 'Sekretaris BEM',
    unit: 'BEM Fakultas Teknik',
    path: '/sekretaris-bem/',
    variant: 'ghost',
  },
  {
    name: 'Dewi Lestari',
    email: 'sekretaris.hima.if@student.ac.id',
    role: 'Sekretaris HIMA',
    unit: 'HIMA Informatika',
    path: '/sekretaris-hima/',
    variant: 'ghost',
  },
  {
    name: 'Sari Melati',
    email: 'sekretaris.ukm@student.ac.id',
    role: 'Sekretaris UKM',
    unit: 'UKM Olahraga',
    path: '/sekretaris-ukm/',
    variant: 'ghost',
  },

  // Mahasiswa
  {
    name: 'Rina Kartika',
    email: 'mahasiswa@student.ac.id',
    role: 'Mahasiswa',
    unit: 'HIMA Informatika',
    path: '/peminjam/',
    variant: 'outline',
  },
];

async function loginAsUser(user: User) {
  try {
    const response = await authService.login({
      email: user.email,
      password: 'password',
    });

    authService.saveAuthData(response);
    window.location.href = user.path;
  } catch (error: unknown) {
    // Default TS memang unknown
    console.error('Login failed:', error);

    let errorMessage = 'Login gagal. Silakan coba lagi.';

    // 2. GUNAKAN TYPE GUARD
    // Fungsi ini mengecek apakah error berasal dari axios
    // Jika YA, TypeScript otomatis mengubah tipe 'error' dari 'unknown' -> 'AxiosError'
    if (axios.isAxiosError(error)) {
      // Kita beri hint ke TS bahwa data respon kita punya properti 'message'
      const responseData = error.response?.data as { message?: string };

      if (responseData?.message) {
        errorMessage = responseData.message;
      }
    } else if (error instanceof Error) {
      // Error JavaScript biasa (bukan network/axios)
      errorMessage = error.message;
    }

    alert(errorMessage);
  }
}

function RouteComponent() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = async (user: User) => {
    setIsLoading(user.email);
    await loginAsUser(user);
    setIsLoading(null);
  };

  // Group users by category
  const adminUsers = users.filter(
    (u) => u.role === 'Admin' || u.role === 'Wakil Dekan 1',
  );
  const staffUsers = users.filter((u) => u.role.includes('Fakultas'));
  const dosenUsers = users.filter(
    (u) => u.role === 'Ketua Prodi' || u.role === 'Pembimbing Ormawa',
  );
  const ketuaOrmawa = users.filter(
    (u) => u.role.startsWith('Ketua') && !u.role.includes('Prodi'),
  );
  const sekretarisOrmawa = users.filter((u) => u.role.startsWith('Sekretaris'));
  const mahasiswaUsers = users.filter((u) => u.role === 'Mahasiswa');

  return (
    <div className='p-6 space-y-6 max-w-7xl mx-auto'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Menu Login Development
        </h1>
        <p className='text-gray-600 mt-2'>
          Pilih user untuk login dan mengakses sistem sesuai role
        </p>
        <p className='text-sm text-gray-500 mt-1'>
          Password semua user:{' '}
          <code className='bg-gray-100 px-2 py-1 rounded'>password</code>
        </p>
      </div>

      {/* Admin & Pimpinan */}
      <Card>
        <CardHeader>
          <CardTitle>Admin & Pimpinan Fakultas</CardTitle>
          <CardDescription>Akses penuh sistem dan pimpinan</CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {adminUsers.map((user) => (
            <Button
              key={user.email}
              onClick={() => handleLogin(user)}
              variant={user.variant}
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
          ))}
        </CardContent>
      </Card>

      {/* Staff Fakultas */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Fakultas</CardTitle>
          <CardDescription>Kemahasiswaan dan Sumber Daya</CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {staffUsers.map((user) => (
            <Button
              key={user.email}
              onClick={() => handleLogin(user)}
              variant={user.variant}
              className='w-full justify-start text-left h-auto py-3'
              disabled={isLoading !== null}
            >
              <div className='flex flex-col items-start'>
                <span className='font-semibold'>{user.name}</span>
                <span className='text-xs opacity-80'>{user.email}</span>
                <span className='text-xs opacity-70'>{user.role}</span>
                {isLoading === user.email && (
                  <span className='text-xs mt-1'>Loading...</span>
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Dosen */}
      <Card>
        <CardHeader>
          <CardTitle>Dosen & Pembimbing</CardTitle>
          <CardDescription>
            Ketua Program Studi dan Pembimbing Ormawa
          </CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {dosenUsers.map((user) => (
            <Button
              key={user.email}
              onClick={() => handleLogin(user)}
              variant={user.variant}
              className='w-full justify-start text-left h-auto py-3'
              disabled={isLoading !== null}
            >
              <div className='flex flex-col items-start'>
                <span className='font-semibold'>{user.name}</span>
                <span className='text-xs opacity-80'>{user.email}</span>
                <span className='text-xs opacity-70'>{user.role}</span>
                <span className='text-xs opacity-60'>{user.unit}</span>
                {isLoading === user.email && (
                  <span className='text-xs mt-1'>Loading...</span>
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Ketua Organisasi */}
      <Card>
        <CardHeader>
          <CardTitle>Ketua Organisasi Mahasiswa</CardTitle>
          <CardDescription>Senat, BEM, HIMA, dan UKM</CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {ketuaOrmawa.map((user) => (
            <Button
              key={user.email}
              onClick={() => handleLogin(user)}
              variant={user.variant}
              className='w-full justify-start text-left h-auto py-3'
              disabled={isLoading !== null}
            >
              <div className='flex flex-col items-start'>
                <span className='font-semibold'>{user.name}</span>
                <span className='text-xs opacity-80'>{user.email}</span>
                <span className='text-xs opacity-70'>{user.role}</span>
                <span className='text-xs opacity-60'>{user.unit}</span>
                {isLoading === user.email && (
                  <span className='text-xs mt-1'>Loading...</span>
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Sekretaris Organisasi */}
      <Card>
        <CardHeader>
          <CardTitle>Sekretaris Organisasi Mahasiswa</CardTitle>
          <CardDescription>
            Sekretaris Senat, BEM, HIMA, dan UKM
          </CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
          {sekretarisOrmawa.map((user) => (
            <Button
              key={user.email}
              onClick={() => handleLogin(user)}
              variant={user.variant}
              className='w-full justify-start text-left h-auto py-3'
              disabled={isLoading !== null}
            >
              <div className='flex flex-col items-start'>
                <span className='font-semibold'>{user.name}</span>
                <span className='text-xs opacity-80'>{user.email}</span>
                <span className='text-xs opacity-70'>{user.role}</span>
                <span className='text-xs opacity-60'>{user.unit}</span>
                {isLoading === user.email && (
                  <span className='text-xs mt-1'>Loading...</span>
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Mahasiswa */}
      <Card>
        <CardHeader>
          <CardTitle>Mahasiswa</CardTitle>
          <CardDescription>Akses peminjaman dan pengajuan</CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {mahasiswaUsers.map((user) => (
            <Button
              key={user.email}
              onClick={() => handleLogin(user)}
              variant={user.variant}
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
          ))}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className='bg-blue-50 border-blue-200'>
        <CardContent className='pt-6'>
          <p className='text-sm text-blue-900'>
            <strong>💡 Info:</strong> Ini adalah halaman development untuk
            testing berbagai role. Data user diambil dari WorkflowSeeder.php.
            Setiap user memiliki password yang sama:{' '}
            <code className='bg-blue-100 px-2 py-1 rounded'>password</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
