import { createFileRoute, useSearch, useNavigate } from '@tanstack/react-router';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/button';

export const Route = createFileRoute('/preview-dokumen')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/preview-dokumen' });
  const docType = (searchParams as any)?.doc || 'document';
  const returnPath = (searchParams as any)?.return || '/';

  return (
    <div className='container mx-auto py-6 px-8'>
      <div className='mb-6 flex items-center gap-4'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate({ to: returnPath as any })}
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Kembali
        </Button>
      </div>

      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Preview Dokumen</h1>
        <p className='text-muted-foreground'>
          Preview {docType === 'executive-summary' ? 'Executive Summary' : 'Lembar Pengesahan'}
        </p>
      </div>

      <div className='flex h-[600px] items-center justify-center rounded-lg border-2 border-dashed bg-gray-50'>
        <div className='text-center'>
          <FileText className='mx-auto mb-4 h-16 w-16 text-gray-400' />
          <h2 className='text-xl font-semibold text-gray-600'>Dalam Tahap Pengembangan</h2>
          <p className='mt-2 text-gray-500'>
            Fitur preview dokumen sedang dalam proses pengembangan
          </p>
        </div>
      </div>
    </div>
  );
}
