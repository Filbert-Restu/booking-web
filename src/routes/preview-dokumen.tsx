import React, { useEffect, useState } from 'react';
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from '@tanstack/react-router';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/button';
import api from '@/lib/axios';

export const Route = createFileRoute('/preview-dokumen')({
  component: RouteComponent,
});

type DocRecord = {
  id?: number;
  title?: string;
  file_executive_summary?: string | null;
  file_approval_sheet?: string | null;
};

function RouteComponent() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/preview-dokumen' });
  const id = (searchParams as any)?.id;
  const docType = (searchParams as any)?.doc || 'approval-sheet';
  const returnPath = (searchParams as any)?.return || '/';

  const [doc, setDoc] = useState<DocRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await api.get(`/documents/${id}`);

        const payload = res.data;

        // Backend returns { success: true, data: {...} }
        if (payload && typeof payload === 'object') {
          if (payload.success && payload.data) {
            setDoc(payload.data);
          } else if (payload.data) {
            setDoc(payload.data);
          } else {
            throw new Error(payload.message || 'Invalid response from server');
          }
        } else {
          throw new Error('Unexpected response shape from server');
        }
      } catch (e: any) {
        setError(
          e?.response?.data?.message || e?.message || 'Terjadi kesalahan',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const fileUrl = doc
    ? docType === 'executive-summary'
      ? doc.file_executive_summary
      : doc.file_approval_sheet
    : null;

  const getAbsoluteFileUrl = (u: string | null | undefined) => {
    if (!u) return null;
    // already absolute
    if (u.startsWith('http://') || u.startsWith('https://')) return u;

    // prefer configured API base URL when available
    const apiBase =
      (import.meta.env.VITE_API_URL as string) || window.location.origin;
    const base = apiBase.replace(/\/$/, '');
    return u.startsWith('/') ? `${base}${u}` : `${base}/${u}`;
  };

  const absoluteFileUrl = getAbsoluteFileUrl(fileUrl || null);

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
          Preview{' '}
          {docType === 'executive-summary'
            ? 'Executive Summary'
            : 'Lembar Pengesahan'}
        </p>
      </div>

      <div className='mb-6'>
        {loading && (
          <div className='p-6 rounded-lg border bg-gray-50 text-center'>
            Memuat dokumen...
          </div>
        )}

        {error && (
          <div className='p-6 rounded-lg border bg-red-50 text-red-700 text-center'>
            Error: {error}
          </div>
        )}

        {!loading && !error && !doc && (
          <div className='p-6 rounded-lg border bg-gray-50 text-center'>
            Tidak ada dokumen yang dipilih.
          </div>
        )}

        {!loading && doc && !fileUrl && (
          <div className='p-6 rounded-lg border bg-gray-50 text-center'>
            Tidak ada file untuk preview.
          </div>
        )}

        {!loading && doc && absoluteFileUrl && (
          <div className='h-[600px] rounded-lg overflow-hidden border'>
            <iframe
              src={absoluteFileUrl}
              title={doc.title || 'Preview Dokumen'}
              className='w-full h-full'
            />
          </div>
        )}
      </div>
    </div>
  );
}
