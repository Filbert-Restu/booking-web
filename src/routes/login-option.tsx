import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/shared/components/ui/button/button';

export const Route = createFileRoute('/login-option')({
  component: RouteComponent,
});

function goto(path: string, role: string) {
  try {
    localStorage.setItem('role', role);
  } catch (e: unknown) {
    // ignore storage errors
  }
  window.location.href = path;
}

function RouteComponent() {
  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Opsi Login</h1>
        <p className='text-gray-600 mt-1'>
          Pilih role untuk langsung masuk ke route terkait
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Button onClick={() => goto('/admin/', 'Admin')} className='w-full'>
          Admin — Manajemen User
        </Button>

        <Button
          onClick={() => goto('/kemahasiswaan/', 'Kemahasiswaan')}
          className='w-full'
          variant='secondary'
        >
          Kemahasiswaan — Peminjaman Ruang
        </Button>

        <Button
          onClick={() => goto('/sumber-daya/', 'Sumber Daya')}
          className='w-full'
          variant='default'
        >
          Sumber Daya — Peminjaman Ruang
        </Button>

        <Button
          onClick={() => goto('/peminjam/', 'Peminjam')}
          className='w-full'
          variant='outline'
        >
          Peminjam — Dashboard Peminjam
        </Button>
      </div>
    </div>
  );
}
