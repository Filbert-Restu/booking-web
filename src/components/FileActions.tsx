import React from 'react';
import PdfPreview from './PdfPreview';
import api from '@/lib/axios';
import { FileText } from 'lucide-react'; // Pastikan import ini ada

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
  // --- FUNGSI DOWNLOAD DOCX (DISIMPAN TAPI TIDAK DIPAKAI) ---
  /* const downloadDocxFile = async (fileType: FileType) => {
    try {
      const response = await api.get(`/documents/${docId}/file/${fileType}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${fileType}_${docId}.docx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Gagal mengunduh file');
    }
  }; 
  */

  // Open PDF preview in modal
  const openPdfPreview = async (fileType: FileType) => {
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
    <div className='flex gap-1 items-center justify-center'>
      {fileTypes.map(({ type, hasFile }) =>
        hasFile ? (
          <React.Fragment key={type}>
            {/* Hanya satu tombol: 
                - Fungsinya: openPdfPreview (Buka PDF)
                - Tampilannya: FileText (Seperti Icon DOCX sebelumnya)
            */}
            <button
              onClick={() => openPdfPreview(type)}
              className='p-1 hover:bg-gray-100 rounded transition-colors'
              title={`Lihat Preview ${type.replace('-', ' ')}`}
            >
              {/* Icon Docx (FileText) tapi fungsinya buka PDF */}
              <FileText className={`w-4 h-4 ${getIconColor(type)}`} />
            </button>
          </React.Fragment>
        ) : null,
      )}

      {fileTypes.every(({ hasFile }) => !hasFile) && (
        <span className='text-xs text-gray-400'>-</span>
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
