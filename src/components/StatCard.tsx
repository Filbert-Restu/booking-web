import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  textColor: string;
  bgLight: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  textColor,
  bgLight,
}: StatCardProps) {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4 hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-xs font-medium text-gray-600 mb-1'>{title}</p>
          <h3 className='text-xl md:text-2xl font-bold text-gray-900'>
            {value}
          </h3>
        </div>
        <div
          className={`${bgLight} p-1 md:p-2 rounded-lg flex items-center justify-center`}
        >
          <Icon className={`${textColor} w-4 h-4 md:w-5 md:h-5`} />
        </div>
      </div>
    </div>
  );
}
