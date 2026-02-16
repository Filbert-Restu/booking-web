import React, { useState } from 'react';
import PdfPreview from './PdfPreview';
import api from '@/lib/axios';
import { FileText, Loader2 } from 'lucide-react'; // Pastikan import ini ada

export type FileType = 'proposal' | 'executive-summary' | 'approval-sheet';

interface FileActionsProps {
  docId: number;
  fileTypes: { type: FileType; hasFile: boolean }[];
  pdfPreview: {
    id: number;
    type: FileType;
    url: string;
  } | null;
  setPdfPreview: (
    val: { id: number; type: FileType; url: string } | null,
  ) => void;
}

const FileActions: React.FC<FileActionsProps> = ({
  docId,
  fileTypes,
  pdfPreview,
  setPdfPreview,
}) => {
  const [loadingType, setLoadingType] = useState<FileType | null>(null);
  // Open PDF preview in modal
  const openPdfPreview = async (fileType: FileType) => {
    setLoadingType(fileType);
    try {
      const response = await api.get(
        `/documents/${docId}/file/${fileType}/pdf`,
        {
          responseType: 'blob',
        },
      );
      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      setPdfPreview({ id: docId, type: fileType, url });
    } catch (error) {
      console.error('PDF preview failed:', error);
      alert('Gagal membuka preview PDF');
    } finally {
      setLoadingType(null);
    }
  };

  // Helper untuk mendapatkan nama yang lebih readable
  const getFileName = (type: FileType) => {
    switch (type) {
      case 'proposal':
        return 'Proposal';
      case 'executive-summary':
        return 'Executive Summary';
      case 'approval-sheet':
        return 'Lembar Pengesahan';
      default:
        return type;
    }
  };

  // Helper untuk menentukan warna icon berdasarkan tipe file
  const getIconColor = (type: FileType) => {
    switch (type) {
      case 'proposal':
        return 'text-blue-600';
      case 'executive-summary':
        return 'text-green-600';
      default:
        return 'text-purple-600';
    }
  };

  return (
    <div className='flex md:flex-col gap-2 items-start'>
      {fileTypes.map(({ type, hasFile }) =>
        hasFile ? (
          <React.Fragment key={type}>
            {/* Button dengan icon dan text dalam satu baris */}
            <button
              onClick={() => openPdfPreview(type)}
              className='flex items-center hover:bg-gray-200 rounded transition-colors w-full text-left border border-gray-200'
              title={`Lihat Preview ${getFileName(type)}`}
              disabled={loadingType !== null}
            >
              {loadingType === type ? (
                <Loader2 className='w-4 h-4 animate-spin text-gray-600' />
              ) : (
                <FileText className={`w-4 h-4 ${getIconColor(type)}`} />
              )}
              <span
                className={`text-sm ${getIconColor(type)} font-medium hidden md:inline ml-2`}
              >
                {getFileName(type)}
              </span>
            </button>
          </React.Fragment>
        ) : null,
      )}

      {fileTypes.every(({ hasFile }) => !hasFile) && (
        <span className='text-sm text-gray-400'>Tidak ada dokumen</span>
      )}

      {/* PDF Preview Modal */}
      <PdfPreview
        open={!!pdfPreview}
        url={pdfPreview?.url || null}
        onClose={() => {
          if (pdfPreview?.url) {
            window.URL.revokeObjectURL(pdfPreview.url);
          }
          setPdfPreview(null);
        }}
        title={pdfPreview ? `Preview PDF: ${pdfPreview.type}` : undefined}
      />
    </div>
  );
};

export default FileActions;
