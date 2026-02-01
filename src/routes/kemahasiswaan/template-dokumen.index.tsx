import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import {
  FileText,
  Download,
  Trash2,
  CheckCircle,
  Circle,
  Edit,
  Plus,
  Eye,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { documentTemplateService } from '@/services/document-template.service';
import type { DocumentTemplate, TemplateType, OrganizationType } from '@/types/template.types';

export const Route = createFileRoute('/kemahasiswaan/template-dokumen/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    template_type: 'executive_summary' as TemplateType,
    organization_type: undefined as OrganizationType | undefined,
    template_name: '',
    description: '',
    set_as_active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, typeFilter]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await documentTemplateService.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Gagal memuat template');
      } else {
        setError('Gagal memuat template');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.template_type === typeFilter);
    }

    setFilteredTemplates(filtered);
  };

  const handleUploadClick = () => {
    setFormData({
      template_type: 'executive_summary',
      organization_type: undefined,
      template_name: '',
      description: '',
      set_as_active: true,
    });
    setSelectedFile(null);
    setFormError('');
    setIsUploadModalOpen(true);
  };

  const handleEditClick = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      template_type: template.template_type,
      organization_type: template.organization_type || undefined,
      template_name: template.template_name,
      description: template.description || '',
      set_as_active: template.is_active,
    });
    setSelectedFile(null);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleEditPageClick = (template: DocumentTemplate) => {
    navigate({
      to: '/kemahasiswaan/template-dokumen/$templateId/edit',
      params: { templateId: String(template.id) },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      
      if (!validTypes.includes(file.type)) {
        setFormError('File harus berformat .docx atau .doc');
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFormError('Ukuran file maksimal 10MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setFormError('');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setFormError('Pilih file template terlebih dahulu');
      return;
    }

    if (!formData.template_name.trim()) {
      setFormError('Nama template harus diisi');
      return;
    }

    // Validasi organization_type untuk lembar pengesahan
    if (formData.template_type === 'lembar_pengesahan' && !formData.organization_type) {
      setFormError('Jenis organisasi harus dipilih untuk Lembar Pengesahan');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      
      await documentTemplateService.createTemplate({
        template_type: formData.template_type,
        organization_type: formData.organization_type,
        template_name: formData.template_name,
        file: selectedFile,
        description: formData.description || undefined,
        set_as_active: formData.set_as_active,
      });

      setIsUploadModalOpen(false);
      await fetchTemplates();
    } catch (err) {
      console.error('Upload failed:', err);
      if (err instanceof AxiosError) {
        const errors = err.response?.data?.errors;
        if (errors) {
          setFormError(Object.values(errors).flat().join(', '));
        } else {
          setFormError(err.response?.data?.message || 'Gagal upload template');
        }
      } else {
        setFormError('Gagal upload template');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate) return;

    if (!formData.template_name.trim()) {
      setFormError('Nama template harus diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      
      await documentTemplateService.updateTemplate(selectedTemplate.id, {
        template_name: formData.template_name,
        file: selectedFile || undefined,
        description: formData.description || undefined,
      });

      setIsEditModalOpen(false);
      await fetchTemplates();
    } catch (err) {
      console.error('Update failed:', err);
      if (err instanceof AxiosError) {
        const errors = err.response?.data?.errors;
        if (errors) {
          setFormError(Object.values(errors).flat().join(', '));
        } else {
          setFormError(err.response?.data?.message || 'Gagal update template');
        }
      } else {
        setFormError('Gagal update template');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (template: DocumentTemplate) => {
    if (template.is_active) return;

    try {
      await documentTemplateService.activateTemplate(template.id);
      await fetchTemplates();
    } catch (err) {
      console.error('Activate failed:', err);
      alert('Gagal mengaktifkan template');
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      await documentTemplateService.deleteTemplate(selectedTemplate.id);
      setIsDeleteDialogOpen(false);
      await fetchTemplates();
    } catch (err) {
      console.error('Delete failed:', err);
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Gagal menghapus template');
      } else {
        alert('Gagal menghapus template');
      }
    }
  };

  const handleDownload = async (template: DocumentTemplate) => {
    try {
      await documentTemplateService.downloadTemplate(
        template.id,
        `${template.template_name}.docx`
      );
    } catch (err) {
      console.error('Download failed:', err);
      alert('Gagal download template');
    }
  };

  const getTemplateTypeLabel = (type: TemplateType) => {
    return type === 'executive_summary' ? 'Executive Summary' : 'Lembar Pengesahan';
  };

  const getOrganizationTypeLabel = (type: OrganizationType) => {
    const labels: Record<OrganizationType, string> = {
      hmd: 'HMD',
      bem_ukm: 'BEM/UKM',
      senat: 'Senat',
    };
    return labels[type];
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray-500'>Memuat template...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Template Dokumen</h1>
        <p className='text-gray-600 mt-1'>
          Kelola template Executive Summary dan Lembar Pengesahan
        </p>
      </div>

      {/* Filters & Actions */}
      <div className='mb-6 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Semua Template' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua Template</SelectItem>
              <SelectItem value='executive_summary'>Executive Summary</SelectItem>
              <SelectItem value='lembar_pengesahan'>Lembar Pengesahan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleUploadClick}>
          <Plus className='w-4 h-4 mr-2' />
          Upload Template
        </Button>
      </div>

      {/* Templates Table */}
      <div className='bg-white rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Template</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Organisasi</TableHead>
              <TableHead>Versi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Diupload Oleh</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className='text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-8 text-gray-500'>
                  Belum ada template
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-2'>
                      <FileText className='w-4 h-4 text-blue-600' />
                      {template.template_name}
                    </div>
                  </TableCell>
                  <TableCell>{getTemplateTypeLabel(template.template_type)}</TableCell>
                  <TableCell>
                    {template.organization_type ? (
                      <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium'>
                        {getOrganizationTypeLabel(template.organization_type)}
                      </span>
                    ) : (
                      <span className='text-gray-400 text-xs'>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className='px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium'>
                      v{template.version}
                    </span>
                  </TableCell>
                  <TableCell>
                    {template.is_active ? (
                      <span className='flex items-center gap-1 text-green-600'>
                        <CheckCircle className='w-4 h-4' />
                        Aktif
                      </span>
                    ) : (
                      <span className='flex items-center gap-1 text-gray-400'>
                        <Circle className='w-4 h-4' />
                        Tidak Aktif
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{template.uploader?.name || '-'}</TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEditPageClick(template)}
                        title='Edit & Preview template'
                      >
                        <Eye className='w-4 h-4' />
                      </Button>
                      {!template.is_active && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleActivate(template)}
                          title='Aktifkan template'
                        >
                          <CheckCircle className='w-4 h-4' />
                        </Button>
                      )}
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDownload(template)}
                        title='Download template'
                      >
                        <Download className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEditClick(template)}
                        title='Edit info template'
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      {!template.is_active && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDeleteClick(template)}
                          title='Hapus template'
                        >
                          <Trash2 className='w-4 h-4 text-red-600' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Upload Template Baru</DialogTitle>
            <DialogDescription>
              Upload template dokumen (.docx) untuk Executive Summary atau Lembar Pengesahan
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit}>
            <div className='space-y-4 py-4'>
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Tipe Template <span className='text-red-500'>*</span>
                </label>
                <Select
                  value={formData.template_type}
                  onValueChange={(value) => {
                    const newType = value as TemplateType;
                    setFormData({ 
                      ...formData, 
                      template_type: newType,
                      // Reset organization_type jika bukan lembar pengesahan
                      organization_type: newType === 'lembar_pengesahan' ? formData.organization_type : undefined,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='executive_summary'>Executive Summary</SelectItem>
                    <SelectItem value='lembar_pengesahan'>Lembar Pengesahan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Organization Type - hanya untuk Lembar Pengesahan */}
              {formData.template_type === 'lembar_pengesahan' && (
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Jenis Organisasi <span className='text-red-500'>*</span>
                  </label>
                  <Select
                    value={formData.organization_type || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, organization_type: value as OrganizationType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih jenis organisasi' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='hmd'>HMD (Himpunan)</SelectItem>
                      <SelectItem value='bem_ukm'>BEM / UKM</SelectItem>
                      <SelectItem value='senat'>Senat</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-gray-500 mt-1'>
                    Pilih jenis organisasi yang akan menggunakan template ini
                  </p>
                </div>
              )}

              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Nama Template <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={formData.template_name}
                  onChange={(e) =>
                    setFormData({ ...formData, template_name: e.target.value })
                  }
                  placeholder='Misal: Template Executive Summary 2026'
                />
              </div>

              <div>
                <label className='text-sm font-medium mb-2 block'>
                  File Template <span className='text-red-500'>*</span>
                </label>
                <Input
                  type='file'
                  accept='.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  onChange={handleFileChange}
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Format: .docx atau .doc (Maksimal 10MB)
                </p>
                {selectedFile && (
                  <p className='text-sm text-green-600 mt-1'>
                    File terpilih: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className='text-sm font-medium mb-2 block'>Deskripsi</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Catatan atau deskripsi template (opsional)'
                  rows={3}
                />
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='set_as_active'
                  checked={formData.set_as_active}
                  onChange={(e) =>
                    setFormData({ ...formData, set_as_active: e.target.checked })
                  }
                  className='rounded'
                />
                <label htmlFor='set_as_active' className='text-sm'>
                  Aktifkan template ini setelah upload
                </label>
              </div>

              {formError && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
                  {formError}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Mengupload...' : 'Upload Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update informasi atau file template
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <div className='space-y-4 py-4'>
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Nama Template <span className='text-red-500'>*</span>
                </label>
                <Input
                  value={formData.template_name}
                  onChange={(e) =>
                    setFormData({ ...formData, template_name: e.target.value })
                  }
                  placeholder='Nama template'
                />
              </div>

              <div>
                <label className='text-sm font-medium mb-2 block'>
                  File Template (Opsional)
                </label>
                <Input
                  type='file'
                  accept='.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  onChange={handleFileChange}
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Kosongkan jika tidak ingin mengganti file
                </p>
                {selectedFile && (
                  <p className='text-sm text-green-600 mt-1'>
                    File terpilih: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className='text-sm font-medium mb-2 block'>Deskripsi</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Catatan atau deskripsi template (opsional)'
                  rows={3}
                />
              </div>

              {formError && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
                  {formError}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus template "{selectedTemplate?.template_name}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default RouteComponent;
