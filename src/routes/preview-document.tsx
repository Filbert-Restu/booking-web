import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import api from '@/lib/axios';
import { AxiosError } from 'axios';

export const Route = createFileRoute('/preview-document')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      documentId: search.documentId as number | undefined,
      return: search.return as string | undefined,
    };
  },
});

type DocumentType = 'proposal' | 'approval-sheet' | 'executive-summary';

export function DocumentPreviewContent({ documentId, returnPath }: { documentId: number | undefined; returnPath: string }) {
  const navigate = useNavigate();
  
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('approval-sheet');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documentId) {
      loadDocumentPreview(selectedDocType);
    }
  }, [documentId, selectedDocType]);

  const loadDocumentPreview = async (docType: DocumentType) => {
    if (!documentId) return;

    try {
      setLoading(true);
      // Clean up previous URL
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }

      const response = await api.get(
        `/documents/${documentId}/file/${docType}/pdf`,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Failed to load document preview:', err);
      const error = err as AxiosError<any>;
      if (error.response?.status === 404) {
        setPdfUrl(null);
        alert(`Dokumen ${docType} belum tersedia`);
      } else {
        alert('Gagal memuat preview dokumen');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Preview Dokumen</h1>
        <p className='text-gray-600 mt-1'>
          Lihat dokumen yang telah diajukan
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Preview Dokumen</CardTitle>
            <Select value={selectedDocType} onValueChange={(val) => setSelectedDocType(val as DocumentType)}>
              <SelectTrigger className='w-50'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='proposal'>Proposal</SelectItem>
                <SelectItem value='approval-sheet'>Lembar Pengesahan</SelectItem>
                <SelectItem value='executive-summary'>Executive Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Preview PDF */}
          {loading && (
            <div className='flex items-center justify-center h-[800px] border rounded-lg bg-gray-50'>
              <p className='text-gray-500'>Memuat dokumen...</p>
            </div>
          )}
          {!loading && pdfUrl && (
            <div className='border rounded-lg overflow-hidden'>
              <iframe
                src={pdfUrl}
                className='w-full h-[800px]'
                title='Document Preview'
              />
            </div>
          )}
          {!loading && !pdfUrl && (
            <div className='flex items-center justify-center h-[800px] border rounded-lg bg-gray-50'>
              <p className='text-gray-500'>Dokumen tidak tersedia</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='mt-6 flex justify-end'>
        <Button 
          onClick={() => navigate({ to: returnPath as any })} 
          variant='outline'
        >
          Kembali
        </Button>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { documentId, return: returnPath } = Route.useSearch();
  return <DocumentPreviewContent documentId={documentId} returnPath={returnPath || '/'} />;
}
