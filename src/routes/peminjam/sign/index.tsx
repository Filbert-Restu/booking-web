import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/axios';

interface Sign {
  id: number;
  user_id: number;
  signature: string;
  signed_at: string;
  created_at: string;
  updated_at: string;
  user?: { name: string };
}

export const Route = createFileRoute('/peminjam/sign/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [sign, setSign] = useState<Sign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSign = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/signs');
      setSign(res.data.data);
      // fetch file blob for preview (authenticated)
      if (res.data.data) {
        try {
          const fileRes = await api.get('/signs/file', {
            responseType: 'blob',
          });
          const url = URL.createObjectURL(fileRes.data);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(url);
        } catch (e) {
          // ignore file fetch errors
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        }
      } else {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }
    } catch (err) {
      setError('Gagal memuat tanda tangan.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user's signature
  useEffect(() => {
    fetchSign();
  }, []);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('signature', file);
      if (sign) {
        // update
        await api.post(`/signs/${sign.id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Tanda tangan berhasil diupdate.');
      } else {
        // create
        await api.post('/signs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Tanda tangan berhasil disimpan.');
      }
      setFile(null);
      fetchSign();
    } catch (err) {
      setError('Gagal upload tanda tangan. Pastikan file gambar valid.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!sign) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/signs/${sign.id}`);
      setSign(null);
      setSuccess('Tanda tangan berhasil dihapus.');
    } catch (err) {
      setError('Gagal menghapus tanda tangan.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='max-w-lg mx-auto py-8 px-4'>
      <h1 className='text-2xl font-bold mb-4'>Tanda Tangan Digital</h1>
      {loading ? (
        <div>Memuat data...</div>
      ) : (
        <>
          {sign && (
            <div className='mb-4'>
              <div className='font-medium mb-2'>Tanda Tangan Anda:</div>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt='Tanda Tangan'
                  className='border rounded shadow max-h-48 mb-2'
                />
              ) : (
                <div className='border rounded shadow max-h-48 mb-2 flex items-center justify-center text-sm text-gray-500'>
                  Preview tidak tersedia
                </div>
              )}
              <div className='text-sm text-gray-500 mb-2'>
                Diunggah: {new Date(sign.signed_at).toLocaleString()}
              </div>
              <button
                className='bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600'
                onClick={handleDelete}
                disabled={uploading}
              >
                Hapus Tanda Tangan
              </button>
            </div>
          )}

          <form onSubmit={handleUpload} className='space-y-3'>
            <div>
              <label className='block mb-1 font-medium'>
                Upload Tanda Tangan (PNG/JPG, max 2MB)
              </label>
              <input
                type='file'
                accept='image/png,image/jpeg'
                onChange={handleFileChange}
                ref={fileInputRef}
                className='block border rounded px-2 py-1 w-full'
                disabled={uploading}
              />
            </div>
            <button
              type='submit'
              className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60'
              disabled={uploading || !file}
            >
              {sign ? 'Update Tanda Tangan' : 'Simpan Tanda Tangan'}
            </button>
          </form>

          {error && <div className='text-red-600 mt-3'>{error}</div>}
          {success && <div className='text-green-600 mt-3'>{success}</div>}
        </>
      )}
    </div>
  );
}
