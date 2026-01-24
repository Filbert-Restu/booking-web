import { createFileRoute } from '@tanstack/react-router';
import { Clock, DoorOpen, Users } from 'lucide-react';
import { StatCard } from '@/components/StatCard';

export const Route = createFileRoute('/ketua-ormawa/')({
  component: RouteComponent,
});

function RouteComponent() {
  const stats = [
    {
      title: 'Pending Approval',
      value: '3',
      icon: Clock,
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Total Pengaju',
      value: '24',
      icon: Users,
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Total Ruangan',
      value: '8',
      icon: DoorOpen,
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Ketua Ormawa</h1>
        <p className="text-gray-600 mt-1">Ringkasan aktivitas organisasi Anda</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
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
