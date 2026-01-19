import { createFileRoute } from '@tanstack/react-router';
import { StatCard } from '@/components/StatCard';
import { Clock, DoorOpen, Users } from 'lucide-react';

export const Route = createFileRoute('/sumberdaya/')({
  component: RouteComponent,
});

function RouteComponent() {
  const stats = [
    {
      title: 'Pending Approval',
      value: '0',
      icon: Clock,
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Total Pengajuan',
      value: '0',
      icon: DoorOpen,
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Total User',
      value: '0',
      icon: Users,
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
  ];

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard Sumber Daya</h1>
        <p className='text-gray-600 mt-1'>Ringkasan aktivitas peminjaman untuk Sumber Daya.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
    </>
  );
}
