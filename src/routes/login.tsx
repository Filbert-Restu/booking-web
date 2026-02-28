import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { authService } from '@/services/auth.service';
import { useState } from 'react';
import axios from 'axios';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

interface LoginFormData {
  email: string;
  password: string;
}

function RouteComponent() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      authService.saveAuthData(response);

      // Redirect based on role
      window.location.href = '/admin/'; // Default, will be changed by backend
    } catch (err: unknown) {
      console.error('Login failed:', err);

      let errorMessage = 'Login gagal. Silakan coba lagi.';

      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as { message?: string };
        if (responseData?.message) {
          errorMessage = responseData.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Background Image */}
      <div
        className='absolute inset-0 z-0'
        style={{
          backgroundImage: `url('/gambar fsm.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
        }}
      />

      {/* Overlay */}
      <div className='absolute inset-0 bg-black/10 z-0' />

      <div className='max-w-md w-full relative z-10'>
        <Card className='bg-white/40 backdrop-blur-md border border-white/20 shadow-2xl p-4'>
          {/* Header */}
          <div className='relative text-center mb-6'>
            <h1 className='text-2xl font-bold text-gray-900 mb-1 pt-8'>
              Sistem Peminjaman Ruang FSM
            </h1>
            <p className='text-gray-800 font-medium text-sm'>Selamat datang!</p>
          </div>

          {/* Login Card */}
          <Card className='shadow-lg border-0 bg-white'>
            <CardHeader className='space-y-1 pb-4'>
              <Link to='/'>
                <Button variant='ghost' size='sm' className='flex items-center gap-2 text-gray-700 hover:text-gray-900'>
                  <ArrowLeft className='h-4 w-4' />
                  <span>Kembali</span>
                </Button>
              </Link>
              <CardTitle className='text-xl font-bold text-center'>
                Login
              </CardTitle>
              <CardDescription className='text-center text-sm'>
                Masukkan email dan password Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-3'>
                {/* Email Input */}
                <div className='space-y-2'>
                  <label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700 block'
                  >
                    Email
                  </label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='nama@example.com'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className='w-full'
                  />
                </div>

                {/* Password Input */}
                <div className='space-y-2'>
                  <label
                    htmlFor='password'
                    className='text-sm font-medium text-gray-700 block'
                  >
                    Password
                  </label>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    placeholder='••••••••'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className='w-full'
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? (
                    <span className='flex items-center justify-center'>
                      <svg
                        className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>

              {/* Development Link */}
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <Link to='/login-option'>
                  <Button
                    variant='ghost'
                    className='w-full text-xs text-gray-500'
                  >
                    🔧 Development Login Menu
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className='text-center text-xs text-gray-700 mt-4 font-medium'>
            © 2026 Booking System FSM. All rights reserved.
          </p>
        </Card>
      </div>
    </div>
  );
}
