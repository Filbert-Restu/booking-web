import { createFileRoute } from '@tanstack/react-router';
import { Clock, DoorOpen, Users } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import BookingCalendar from '@/components/BookingCalendar';

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
});

function RouteComponent() {
  const stats = [
    {
      title: 'Pending Approval',
      value: '12',
      icon: Clock,
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Total Ruangan Aktif',
      value: '24',
      icon: DoorOpen,
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Total User',
      value: '156',
      icon: Users,
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
  ];

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-gray-600 mt-1'>
          Ringkasan sistem peminjaman ruang FSM
        </p>
      </div>

      <div className='grid grid-cols-3 md:grid-cols-3 gap-4'>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            textColor={stat.textColor}
            bgLight={stat.bgLight}
          />
        ))}
      </div>
      <BookingCalendar />
    </>
  );
}
