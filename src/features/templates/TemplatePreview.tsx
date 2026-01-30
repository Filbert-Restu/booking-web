import { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/button';
import api from '@/lib/axios';

interface TemplatePreviewProps {
  file: File | string; // File object atau URL
  onDownload?: () => void;
  onPlaceholdersDetected?: (placeholders: string[]) => void;
}

export function TemplatePreview({ file, onDownload, onPlaceholdersDetected }: TemplatePreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocxContent();
  }, [file]);

  const loadDocxContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let arrayBuffer: ArrayBuffer;

      if (file instanceof File) {
        // File object from input
        arrayBuffer = await file.arrayBuffer();
      } else {
        // URL string - fetch the file using axios with auth
        const response = await api.get(file, {
          responseType: 'arraybuffer',
        });
        arrayBuffer = response.data;
      }

      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(result.value);

      // Extract placeholders (format: {{placeholder}})
      const placeholderRegex = /\{\{([^}]+)\}\}/g;
      const matches = result.value.match(placeholderRegex) || [];
      const uniquePlaceholders = Array.from(new Set(matches));
      setPlaceholders(uniquePlaceholders);

      // Notify parent component
      if (onPlaceholdersDetected) {
        onPlaceholdersDetected(uniquePlaceholders);
      }

      if (result.messages.length > 0) {
        console.warn('Mammoth conversion warnings:', result.messages);
      }
    } catch (err) {
      console.error('Failed to load DOCX:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat template');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64 bg-gray-50 rounded-lg'>
        <div className='text-center'>
          <FileText className='w-12 h-12 text-gray-400 mx-auto mb-2 animate-pulse' />
          <p className='text-gray-500'>Memuat preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64 bg-red-50 rounded-lg'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-400 mx-auto mb-2' />
          <p className='text-red-600'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Placeholders Info */}
      {placeholders.length > 0 && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h3 className='text-sm font-semibold text-blue-900 mb-2'>
            Placeholders Terdeteksi ({placeholders.length})
          </h3>
          <div className='flex flex-wrap gap-2'>
            {placeholders.map((placeholder, index) => (
              <span
                key={index}
                className='inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono bg-blue-100 text-blue-800 border border-blue-300'
              >
                {placeholder}
              </span>
            ))}
          </div>
          <p className='text-xs text-blue-700 mt-2'>
            Placeholder ini akan diganti dengan data peminjam saat generate dokumen
          </p>
        </div>
      )}

      {/* Preview Container */}
      <div className='bg-white border rounded-lg'>
        <div className='border-b px-4 py-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileText className='w-5 h-5 text-blue-600' />
            <h3 className='font-semibold text-gray-900'>Preview Template</h3>
          </div>
          {onDownload && (
            <Button variant='outline' size='sm' onClick={onDownload}>
              <Download className='w-4 h-4 mr-2' />
              Download
            </Button>
          )}
        </div>

        {/* DOCX Content */}
        <div
          className='p-6 prose prose-sm max-w-none overflow-auto'
          style={{ maxHeight: '600px' }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* Info */}
      <div className='bg-gray-50 border rounded-lg p-4'>
        <p className='text-xs text-gray-600'>
          <strong>Catatan:</strong> Preview ini adalah representasi dari file DOCX.
          Tampilan mungkin sedikit berbeda dengan file asli. Untuk melihat tampilan
          yang akurat, silakan download template.
        </p>
      </div>
    </div>
  );
}
