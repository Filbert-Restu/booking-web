import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { X, Loader2, Download } from 'lucide-react';
import api from '@/lib/axios';

interface DocxViewerProps {
  documentId: number;
  fileType: 'executive-summary' | 'approval-sheet' | 'proposal';
  onClose: () => void;
}

export function DocxViewer({ documentId, fileType, onClose }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => {
    loadAndRenderDocx();
  }, [documentId, fileType]);

  const loadAndRenderDocx = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch DOCX file
      const response = await api.get(
        `/documents/${documentId}/file/${fileType}`,
        {
          responseType: 'blob',
        },
      );

      const docxBlob = response.data;
      setBlob(docxBlob);

      // Render DOCX in container
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Clear previous content
        await renderAsync(docxBlob, containerRef.current, undefined, {
          className: 'docx-wrapper',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          debug: false,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load DOCX:', err);
      setError('Gagal memuat dokumen. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${documentId}-${fileType}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Preview Dokumen
          </h2>
          <div className='flex gap-2'>
            <button
              onClick={handleDownload}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              title='Download DOCX'
              disabled={!blob}
            >
              <Download className='w-5 h-5 text-gray-600' />
            </button>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              title='Tutup'
            >
              <X className='w-5 h-5 text-gray-600' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-auto p-4 bg-gray-50'>
          {loading && (
            <div className='flex flex-col items-center justify-center h-full'>
              <Loader2 className='w-12 h-12 text-blue-600 animate-spin mb-4' />
              <p className='text-gray-600'>Memuat dokumen...</p>
            </div>
          )}

          {error && (
            <div className='flex flex-col items-center justify-center h-full'>
              <div className='text-red-600 mb-4'>❌</div>
              <p className='text-gray-600'>{error}</p>
              <button
                onClick={loadAndRenderDocx}
                className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && (
            <div
              ref={containerRef}
              className='bg-white rounded shadow-sm mx-auto'
              style={{ maxWidth: '210mm' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
