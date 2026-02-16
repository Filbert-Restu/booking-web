import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { AxiosError } from 'axios';
import {
  FileText,
  Download,
  Trash2,
  CheckCircle,
  Circle,
  Eye,
  Pencil,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { TemplatePreview } from '@/features/templates/TemplatePreview';
import type { DocumentTemplate, TemplateType, OrganizationType } from '@/types/template.types';

export const Route = createFileRoute('/kemahasiswaan/template-dokumen/')({
  component: RouteComponent,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseAxiosError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const errors = err.response?.data?.errors;
    if (errors) return Object.values(errors).flat().join(', ');
    return err.response?.data?.message || fallback;
  }
  return fallback;
}

const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  executive_summary: 'Executive Summary',
  lembar_pengesahan: 'Lembar Pengesahan',
};

const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  hmd: 'HMD',
  bem_ukm: 'BEM/UKM',
  senat: 'Senat',
};

const INITIAL_FORM = {
  template_type: 'executive_summary' as TemplateType,
  organization_type: undefined as OrganizationType | undefined,
  template_name: '',
  description: '',
  set_as_active: true,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function RouteComponent() {
  const queryClient = useQueryClient();

  // Filter
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  // Form states
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  // Action-level error (replaces alert())
  const [actionError, setActionError] = useState<string | null>(null);

  // ---- DATA FETCHING (React Query) ----
  const {
    data: templates = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['document-templates'],
    queryFn: () => documentTemplateService.getTemplates(),
  });

  // ---- DERIVED FILTERING (useMemo instead of useEffect) ----
  const filteredTemplates = useMemo(() => {
    if (typeFilter === 'all') return templates;
    return templates.filter((t) => t.template_type === typeFilter);
  }, [templates, typeFilter]);

  // ---- MUTATIONS ----
  const invalidateTemplates = () =>
    queryClient.invalidateQueries({ queryKey: ['document-templates'] });

  const uploadMutation = useMutation({
    mutationFn: (params: {
      formData: typeof INITIAL_FORM;
      file: File;
    }) =>
      documentTemplateService.createTemplate({
        template_type: params.formData.template_type,
        organization_type: params.formData.organization_type,
        template_name: params.formData.template_name,
        file: params.file,
        description: params.formData.description || undefined,
        set_as_active: params.formData.set_as_active,
      }),
    onSuccess: () => {
      setIsUploadModalOpen(false);
      invalidateTemplates();
    },
    onError: (err) => {
      setFormError(parseAxiosError(err, 'Gagal upload template'));
    },
  });

  const editMutation = useMutation({
    mutationFn: (params: {
      id: number;
      formData: typeof INITIAL_FORM;
      file: File | null;
    }) =>
      documentTemplateService.updateTemplate(params.id, {
        template_name: params.formData.template_name,
        file: params.file || undefined,
        description: params.formData.description || undefined,
      }),
    onSuccess: () => {
      setIsEditModalOpen(false);
      invalidateTemplates();
    },
    onError: (err) => {
      setFormError(parseAxiosError(err, 'Gagal update template'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentTemplateService.deleteTemplate(id),
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      invalidateTemplates();
    },
    onError: (err) => {
      setActionError(parseAxiosError(err, 'Gagal menghapus template'));
      setIsDeleteDialogOpen(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (params: { template: DocumentTemplate; newStatus: string }) => {
      if (params.newStatus === 'active') {
        return documentTemplateService.activateTemplate(params.template.id);
      }
      return documentTemplateService.deactivateTemplate(params.template.id);
    },
    onSuccess: () => invalidateTemplates(),
    onError: (err) => {
      setActionError(parseAxiosError(err, 'Gagal mengubah status template'));
    },
  });

  // ---- HANDLERS ----
  const handleUploadClick = () => {
    setFormData(INITIAL_FORM);
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

  const handlePreviewClick = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];

      if (!validTypes.includes(file.type)) {
        setFormError('File harus berformat .docx atau .doc');
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setFormError('Ukuran file maksimal 10MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setFormError('');
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setFormError('Pilih file template terlebih dahulu');
      return;
    }
    if (!formData.template_name.trim()) {
      setFormError('Nama template harus diisi');
      return;
    }
    if (formData.template_type === 'lembar_pengesahan' && !formData.organization_type) {
      setFormError('Jenis organisasi harus dipilih untuk Lembar Pengesahan');
      return;
    }

    setFormError('');
    uploadMutation.mutate({ formData, file: selectedFile });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    if (!formData.template_name.trim()) {
      setFormError('Nama template harus diisi');
      return;
    }

    setFormError('');
    editMutation.mutate({
      id: selectedTemplate.id,
      formData,
      file: selectedFile,
    });
  };

  const handleDelete = () => {
    if (!selectedTemplate) return;
    deleteMutation.mutate(selectedTemplate.id);
  };

  const handleStatusChange = (template: DocumentTemplate, newStatus: string) => {
    statusMutation.mutate({ template, newStatus });
  };

  const handleDownload = async (template: DocumentTemplate) => {
    try {
      await documentTemplateService.downloadTemplate(
        template.id,
        `${template.template_name}.docx`,
      );
    } catch (err) {
      setActionError(parseAxiosError(err, 'Gagal download template'));
    }
  };

  const isSubmitting =
    uploadMutation.isPending || editMutation.isPending || deleteMutation.isPending;

  // ---- RENDER ----
  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray-500'>Memuat template...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center h-64 text-center'>
        <AlertCircle className='w-12 h-12 text-red-400 mb-4' />
        <h3 className='text-lg font-semibold text-gray-700 mb-2'>
          Gagal Memuat Template
        </h3>
        <p className='text-sm text-gray-500 mb-4'>
          Terjadi kesalahan saat memuat data template. Silakan coba lagi.
        </p>
        <Button onClick={() => refetch()} variant='outline'>
          Coba Lagi
        </Button>
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

      {/* Action Error Banner (replaces alert()) */}
      {actionError && (
        <div className='mb-4 flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200'>
          <AlertCircle className='w-4 h-4 shrink-0' />
          <span className='flex-1'>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className='text-red-400 hover:text-red-600 font-bold'
          >
            ×
          </button>
        </div>
      )}

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
              <TableHead className='text-center text-xs sm:text-sm w-20 sm:w-auto'>
                Aksi
              </TableHead>
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
                  <TableCell>{TEMPLATE_TYPE_LABELS[template.template_type]}</TableCell>
                  <TableCell>
                    {template.organization_type ? (
                      <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium'>
                        {ORG_TYPE_LABELS[template.organization_type]}
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
                    <Select
                      value={template.is_active ? 'active' : 'inactive'}
                      onValueChange={(value) => handleStatusChange(template, value)}
                    >
                      <SelectTrigger className={`h-8 w-[110px] ${template.is_active ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-600 border-gray-200 bg-gray-50'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='active' className='text-green-600 focus:text-green-700'>
                          <div className='flex items-center gap-2'>
                            <CheckCircle className='w-4 h-4' />
                            <span>Aktif</span>
                          </div>
                        </SelectItem>
                        <SelectItem value='inactive' className='text-gray-600 focus:text-gray-700'>
                          <div className='flex items-center gap-2'>
                            <Circle className='w-4 h-4' />
                            <span>Nonaktif</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{template.uploader?.name || '-'}</TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className='py-2 sm:py-3'>
                    <div className='flex items-center justify-center gap-1 sm:gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handlePreviewClick(template)}
                        className='h-6 w-6 sm:h-8 sm:w-8 p-0'
                        title='Preview Template'
                      >
                        <Eye className='h-3 w-3 sm:h-4 sm:w-4' />
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDownload(template)}
                        className='h-6 w-6 sm:h-8 sm:w-8 p-0'
                        title='Download template'
                      >
                        <Download className='h-3 w-3 sm:h-4 sm:w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEditClick(template)}
                        className='h-6 w-6 sm:h-8 sm:w-8 p-0'
                        title='Edit info template'
                      >
                        <Pencil className='h-3 w-3 sm:h-4 sm:w-4' />
                      </Button>
                      {!template.is_active && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteClick(template)}
                          className='h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                          title='Hapus template'
                        >
                          <Trash2 className='h-3 w-3 sm:h-4 sm:w-4' />
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
                {uploadMutation.isPending ? 'Mengupload...' : 'Upload Template'}
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
                {editMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
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

      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className='!max-w-[95vw] !w-[95vw] !h-[95vh] flex flex-col p-6'>
          <DialogHeader>
            <DialogTitle>Preview Template</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.template_name}
            </DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-auto bg-gray-50 rounded-md border p-4'>
            {selectedTemplate && (
              <TemplatePreview
                file={null}
                templateId={selectedTemplate.id}
                onDownload={() => handleDownload(selectedTemplate)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RouteComponent;
