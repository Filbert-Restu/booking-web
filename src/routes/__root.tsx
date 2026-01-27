import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { BookingProvider } from '@/contexts/BookingContext';

const RootLayout = () => (
  <>
    <BookingProvider>
      <Outlet />
    </BookingProvider>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
