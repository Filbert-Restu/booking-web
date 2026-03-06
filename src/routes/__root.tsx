import { createRootRoute, Outlet } from '@tanstack/react-router';
import { BookingProvider } from '@/contexts/BookingContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
const queryClient = new QueryClient();

const RootLayout = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <BookingProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
      </BookingProvider>
    </QueryClientProvider>
  </>
);

export const Route = createRootRoute({ component: RootLayout });
