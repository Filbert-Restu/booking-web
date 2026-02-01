import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/button';
import { SignatureUpload } from '@/shared/components/common/SignatureUpload';
import type { Signature } from '@/services/signature.service';

export const Route = createFileRoute('/tanda-tangan')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/tanda-tangan' });
  const returnPath = (searchParams as any)?.return || '/';

  const [signature, setSignature] = useState<Signature | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSignatureUploaded = (sig: Signature) => {
    setSignature(sig);
    setHasChanges(true);
  };

  const handleSaveAndReturn = () => {
    if (signature) {
      // Navigate back with success
      navigate({ to: returnPath as any });
    }
  };

  return (
    <div className='container mx-auto py-6 px-8 max-w-4xl'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: returnPath as any })}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Kembali
          </Button>
        </div>

        {signature && hasChanges && (
          <Button onClick={handleSaveAndReturn} size='sm' className='gap-2'>
            <CheckCircle className='h-4 w-4' />
            Simpan & Kembali
          </Button>
        )}
      </div>

      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Tanda Tangan Digital</h1>
        <p className='text-muted-foreground'>
          Kelola tanda tangan digital Anda untuk keperluan dokumen
        </p>
      </div>

      <div className='space-y-6'>
        {/* Info Box */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='text-sm text-blue-900'>
            <p className='font-medium mb-2'>
              📝 Informasi Tanda Tangan Digital
            </p>
            <ul className='list-disc list-inside space-y-1 text-xs'>
              <li>
                Tanda tangan ini akan digunakan untuk semua dokumen yang
                memerlukan persetujuan Anda
              </li>
              <li>
                Anda dapat menggambar tanda tangan atau mengupload file gambar
              </li>
              <li>Format yang didukung: PNG, JPG, JPEG (Max 2MB)</li>
              <li>
                Pastikan tanda tangan Anda jelas dan sesuai dengan tanda tangan
                resmi
              </li>
            </ul>
          </div>
        </div>

        {/* Signature Upload Component */}
        <SignatureUpload onSignatureUploaded={handleSignatureUploaded} />

        {/* Action Buttons */}
        <div className='flex gap-3 pt-4'>
          <Button
            variant='outline'
            onClick={() => navigate({ to: returnPath as any })}
            className='flex-1'
          >
            Kembali
          </Button>
          {signature && (
            <Button onClick={handleSaveAndReturn} className='flex-1 gap-2'>
              <Save className='h-4 w-4' />
              Simpan Perubahan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
