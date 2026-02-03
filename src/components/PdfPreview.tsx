import React from 'react';

interface PdfPreviewProps {
  open: boolean;
  url: string | null;
  onClose: () => void;
  title?: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  open,
  url,
  onClose,
  title,
}) => {
  if (!open || !url) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h3 className='text-lg font-semibold'>{title || 'Preview PDF'}</h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
            aria-label='Tutup preview PDF'
          >
            ✕
          </button>
        </div>
        <div className='flex-1 overflow-hidden'>
          <iframe
            src={url}
            className='w-full h-full border-0'
            title='PDF Preview'
          />
        </div>
      </div>
    </div>
  );
};

export default PdfPreview;
