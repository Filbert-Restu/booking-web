import { createFileRoute } from '@tanstack/react-router';
// a plugin!
import { TopBar } from '@/shared/layouts/TopBar';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <TopBar />
      <div className='relative h-screen w-full flex items-center justify-center p-4 m-auto'>
        {/* Background image with low saturation */}
        <img
          src='/gambar fsm.jpg'
          alt='Hero background'
          className='absolute inset-0 w-full h-full object-cover filter saturate-50 brightness-95'
        />
        {/* Dark overlay to increase text contrast */}
        <div className='absolute inset-0 bg-black/30' />

        <div className='relative z-10 w-full max-w-4xl text-center px-4'>
          <h1 className='text-white text-4xl md:text-5xl font-semibold mb-3'>
            Sistem Peminjaman Tempat FSM
          </h1>
          <p className='text-white/90 text-lg md:text-xl'>
            Fasilitas Peminjaman Tempat untuk Organisasi Mahasiswa Fakultas Sains dan Matematika
          </p>
          <div className='mt-6 flex justify-center'>
            <a
              href='/login'
              role='button'
              className='inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 hover:saturate-80 hover:brightness-95 font-medium text-lg'
              aria-label='Pinjam ruang'
            >
              Pinjam Ruang Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
