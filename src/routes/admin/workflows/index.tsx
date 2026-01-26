import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import {
  workflowService,
  type Workflow,
  type WorkflowStep,
  type CreateWorkflowData,
} from '@/services/workflow.service';
import { roleService, type Role } from '@/services/role.service';
import { categories, scopeTypes } from '@/services/workflow.constants';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { CreateWorkflowDialog } from '@/shared/components/ui/workflows/CreateWorkflowDialog';
import { WorkflowDetailDialog } from '@/shared/components/ui/workflows/WorkflowDetailDialog';
import { WorkflowDeleteDialog } from '@/shared/components/ui/workflows/WorkflowDeleteDialog';

export const Route = createFileRoute('/admin/workflows/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null,
  );
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<number>>(
    new Set(),
  );

  // Step management states
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [isEditStepModalOpen, setIsEditStepModalOpen] = useState(false);
  const [isDeleteStepDialogOpen, setIsDeleteStepDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [workflowForStep, setWorkflowForStep] = useState<Workflow | null>(null);

  // Form states for workflow
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    applies_to_category: 'HIMA',
  });

  // Form states for steps
  const [steps, setSteps] = useState<
    Omit<WorkflowStep, 'id' | 'workflow_id' | 'created_at' | 'updated_at'>[]
  >([]);
  const [stepFormData, setStepFormData] = useState({
    step_order: 1,
    step_name: '',
    target_role_slug: '',
    scope_type: 'SELF' as
      | 'SELF'
      | 'PARENT'
      | 'FACULTY_LEADER'
      | 'SPECIFIC_CATEGORY',
    target_category_lookup: '',
  });

  // Load workflows and roles
  useEffect(() => {
    loadWorkflows();
    loadRoles();
  }, []);

  // Filter workflows based on search and category
  useEffect(() => {
    let filtered = workflows;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (workflow) => workflow.applies_to_category === selectedCategory,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (workflow) =>
          workflow.name.toLowerCase().includes(query) ||
          workflow.applies_to_category.toLowerCase().includes(query) ||
          (workflow.description &&
            workflow.description.toLowerCase().includes(query)),
      );
    }

    setFilteredWorkflows(filtered);
  }, [searchQuery, selectedCategory, workflows]);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
      setFilteredWorkflows(data);
      setError(null);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Gagal memuat workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const toggleWorkflowExpansion = (workflowId: number) => {
    const newExpanded = new Set(expandedWorkflows);
    if (newExpanded.has(workflowId)) {
      newExpanded.delete(workflowId);
    } else {
      newExpanded.add(workflowId);
    }
    setExpandedWorkflows(newExpanded);
  };

  const handleCreateWorkflow = () => {
    setFormData({ name: '', description: '', applies_to_category: 'HIMA' });
    setSteps([]);
    setIsCreateModalOpen(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      applies_to_category: workflow.applies_to_category,
    });
    setIsEditModalOpen(true);
  };

  const handleViewWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsDetailModalOpen(true);
  };

  const handleDeleteWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsDeleteDialogOpen(true);
  };

  const addStepToForm = () => {
    if (!stepFormData.step_name || !stepFormData.target_role_slug) {
      alert('Harap isi nama step dan role target');
      return;
    }

    const newStep = {
      step_order: steps.length + 1,
      step_name: stepFormData.step_name,
      target_role_slug: stepFormData.target_role_slug,
      scope_type: stepFormData.scope_type,
      target_category_lookup:
        stepFormData.scope_type === 'SPECIFIC_CATEGORY'
          ? stepFormData.target_category_lookup
          : null,
    };

    setSteps([...steps, newStep]);
    setStepFormData({
      step_order: steps.length + 2,
      step_name: '',
      target_role_slug: '',
      scope_type: 'SELF',
      target_category_lookup: '',
    });
  };

  const removeStepFromForm = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Re-order steps
    const reorderedSteps = newSteps.map((step, i) => ({
      ...step,
      step_order: i + 1,
    }));
    setSteps(reorderedSteps);
  };

  const submitCreateWorkflow = async () => {
    if (!formData.name || steps.length === 0) {
      alert('Harap isi nama workflow dan minimal 1 step');
      return;
    }

    try {
      const createData: CreateWorkflowData = {
        name: formData.name,
        description: formData.description || undefined,
        applies_to_category: formData.applies_to_category,
        steps: steps,
      };

      await workflowService.createWorkflow(createData);
      setIsCreateModalOpen(false);
      loadWorkflows();
      setFormData({ name: '', description: '', applies_to_category: 'HIMA' });
      setSteps([]);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal membuat workflow');
    }
  };

  const submitEditWorkflow = async () => {
    if (!selectedWorkflow || !formData.name) {
      return;
    }

    try {
      await workflowService.updateWorkflow(selectedWorkflow.id, {
        name: formData.name,
        description: formData.description || undefined,
        applies_to_category: formData.applies_to_category,
      });

      setIsEditModalOpen(false);
      loadWorkflows();
      setSelectedWorkflow(null);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal mengupdate workflow');
    }
  };

  const confirmDeleteWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      await workflowService.deleteWorkflow(selectedWorkflow.id);
      setIsDeleteDialogOpen(false);
      loadWorkflows();
      setSelectedWorkflow(null);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal menghapus workflow');
    }
  };

  // Step management functions
  const handleManageSteps = (workflow: Workflow) => {
    setWorkflowForStep(workflow);
    setStepFormData({
      step_order: (workflow.steps?.length || 0) + 1,
      step_name: '',
      target_role_slug: '',
      scope_type: 'SELF',
      target_category_lookup: '',
    });
    setIsStepModalOpen(true);
  };

  const submitAddStep = async () => {
    if (
      !workflowForStep ||
      !stepFormData.step_name ||
      !stepFormData.target_role_slug
    ) {
      alert('Harap isi semua field yang diperlukan');
      return;
    }

    try {
      await workflowService.addStep(workflowForStep.id, {
        step_order: stepFormData.step_order,
        step_name: stepFormData.step_name,
        target_role_slug: stepFormData.target_role_slug,
        scope_type: stepFormData.scope_type,
        target_category_lookup:
          stepFormData.scope_type === 'SPECIFIC_CATEGORY'
            ? stepFormData.target_category_lookup
            : undefined,
      });

      setIsStepModalOpen(false);
      loadWorkflows();
      setWorkflowForStep(null);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal menambah step');
    }
  };

  const handleEditStep = (workflow: Workflow, step: WorkflowStep) => {
    setWorkflowForStep(workflow);
    setSelectedStep(step);
    setStepFormData({
      step_order: step.step_order,
      step_name: step.step_name,
      target_role_slug: step.target_role_slug,
      scope_type: step.scope_type,
      target_category_lookup: step.target_category_lookup || '',
    });
    setIsEditStepModalOpen(true);
  };

  const submitEditStep = async () => {
    if (!workflowForStep || !selectedStep) return;

    try {
      await workflowService.updateStep(workflowForStep.id, selectedStep.id!, {
        step_order: stepFormData.step_order,
        step_name: stepFormData.step_name,
        target_role_slug: stepFormData.target_role_slug,
        scope_type: stepFormData.scope_type,
        target_category_lookup:
          stepFormData.scope_type === 'SPECIFIC_CATEGORY'
            ? stepFormData.target_category_lookup
            : undefined,
      });

      setIsEditStepModalOpen(false);
      loadWorkflows();
      setWorkflowForStep(null);
      setSelectedStep(null);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal mengupdate step');
    }
  };

  const handleDeleteStep = (workflow: Workflow, step: WorkflowStep) => {
    setWorkflowForStep(workflow);
    setSelectedStep(step);
    setIsDeleteStepDialogOpen(true);
  };

  const confirmDeleteStep = async () => {
    if (!workflowForStep || !selectedStep) return;

    try {
      await workflowService.deleteStep(workflowForStep.id, selectedStep.id!);
      setIsDeleteStepDialogOpen(false);
      loadWorkflows();
      setWorkflowForStep(null);
      setSelectedStep(null);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || 'Gagal menghapus step');
    }
  };

  const getScopeTypeLabel = (scopeType: string) => {
    const type = scopeTypes.find((t) => t.value === scopeType);
    return type?.label || scopeType;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.label || category;
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-lg'>Loading workflows...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-3 sm:p-6'>
      <div className='mb-4 sm:mb-6'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold'>
            Workflow Management
          </h1>
          <p className='text-gray-600 mt-1 text-sm sm:text-base'>
            Kelola workflow approval untuk berbagai kategori unit
          </p>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {/* Search and Create Button */}
      <div className='mb-4 flex flex-row items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            type='text'
            placeholder='Cari workflow...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 h-10'
          />
        </div>
        <Button
          onClick={handleCreateWorkflow}
          className='whitespace-nowrap h-10 flex-shrink-0'
        >
          <Plus className='mr-2 h-4 w-4' />
          <span className='hidden sm:inline'>Buat Workflow Baru</span>
          <span className='sm:hidden'>Buat</span>
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className='mb-4 flex flex-wrap gap-2'>
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size='sm'
          onClick={() => setSelectedCategory(null)}
          className='text-xs sm:text-sm'
        >
          Semua
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedCategory(cat.value)}
            className='text-xs sm:text-sm'
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Workflows Table */}
      <div className='bg-white rounded-lg shadow overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-8 sm:w-12'></TableHead>
              <TableHead className='min-w-[150px]'>Nama Workflow</TableHead>
              <TableHead className='hidden sm:table-cell'>Kategori</TableHead>
              <TableHead className='hidden md:table-cell'>
                Jumlah Step
              </TableHead>
              <TableHead className='hidden lg:table-cell'>Deskripsi</TableHead>
              <TableHead className='text-right w-[100px] sm:w-auto'>
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkflows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-center py-8 text-gray-500'
                >
                  Tidak ada workflow ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkflows.map((workflow) => (
                <>
                  <TableRow key={workflow.id}>
                    <TableCell className='py-2 sm:py-4'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => toggleWorkflowExpansion(workflow.id)}
                        className='h-7 w-7 p-0 sm:h-8 sm:w-8'
                      >
                        {expandedWorkflows.has(workflow.id) ? (
                          <ChevronUp className='h-3 w-3 sm:h-4 sm:w-4' />
                        ) : (
                          <ChevronDown className='h-3 w-3 sm:h-4 sm:w-4' />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className='font-medium py-2 sm:py-4'>
                      <div>
                        <div className='text-sm sm:text-base'>
                          {workflow.name}
                        </div>
                        <div className='sm:hidden text-xs text-gray-500 mt-1 space-y-0.5'>
                          <div>
                            <Badge variant='secondary' className='text-xs'>
                              {getCategoryLabel(workflow.applies_to_category)}
                            </Badge>
                          </div>
                          <div>{workflow.steps?.length || 0} step(s)</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='hidden sm:table-cell py-2 sm:py-4'>
                      <Badge variant='secondary'>
                        {getCategoryLabel(workflow.applies_to_category)}
                      </Badge>
                    </TableCell>
                    <TableCell className='hidden md:table-cell py-2 sm:py-4'>
                      {workflow.steps?.length || 0} step(s)
                    </TableCell>
                    <TableCell className='hidden lg:table-cell max-w-md truncate py-2 sm:py-4'>
                      {workflow.description || '-'}
                    </TableCell>
                    <TableCell className='text-right py-2 sm:py-4'>
                      <div className='flex justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleViewWorkflow(workflow)}
                          className='h-7 w-7 p-0 sm:h-8 sm:w-8'
                          title='View'
                        >
                          <Eye className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleManageSteps(workflow)}
                          className='h-7 w-7 p-0 sm:h-8 sm:w-8'
                          title='Manage Steps'
                        >
                          <Settings className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleEditWorkflow(workflow)}
                          className='h-7 w-7 p-0 sm:h-8 sm:w-8'
                          title='Edit'
                        >
                          <Pencil className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteWorkflow(workflow)}
                          className='h-7 w-7 p-0 sm:h-8 sm:w-8'
                          title='Delete'
                        >
                          <Trash2 className='h-3 w-3 sm:h-4 sm:w-4 text-red-500' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedWorkflows.has(workflow.id) && (
                    <TableRow>
                      <TableCell colSpan={6} className='bg-gray-50 p-2 sm:p-4'>
                        <div>
                          <h4 className='font-semibold mb-2 sm:mb-3 text-sm sm:text-base'>
                            Workflow Steps:
                          </h4>
                          {workflow.steps && workflow.steps.length > 0 ? (
                            <div className='space-y-2'>
                              {workflow.steps.map((step) => (
                                <Card key={step.id}>
                                  <CardContent className='p-2 sm:p-4'>
                                    <div className='flex items-start justify-between gap-2'>
                                      <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2 mb-1 sm:mb-2 flex-wrap'>
                                          <Badge
                                            variant='outline'
                                            className='text-xs'
                                          >
                                            Step {step.step_order}
                                          </Badge>
                                          <span className='font-medium text-sm sm:text-base'>
                                            {step.step_name}
                                          </span>
                                        </div>
                                        <div className='text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1'>
                                          <div className='break-words'>
                                            <span className='font-medium'>
                                              Role:
                                            </span>{' '}
                                            {step.target_role_slug}
                                          </div>
                                          <div>
                                            <span className='font-medium'>
                                              Scope:
                                            </span>{' '}
                                            {getScopeTypeLabel(step.scope_type)}
                                          </div>
                                          {step.target_category_lookup && (
                                            <div>
                                              <span className='font-medium'>
                                                Target Category:
                                              </span>{' '}
                                              {getCategoryLabel(
                                                step.target_category_lookup,
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className='flex gap-1 flex-shrink-0'>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                            handleEditStep(workflow, step)
                                          }
                                          className='h-7 w-7 p-0'
                                        >
                                          <Pencil className='h-3 w-3' />
                                        </Button>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                            handleDeleteStep(workflow, step)
                                          }
                                          className='h-7 w-7 p-0'
                                        >
                                          <Trash2 className='h-3 w-3 text-red-500' />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className='text-gray-500 text-sm'>
                              Belum ada step untuk workflow ini
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Workflow Modal */}
      <CreateWorkflowDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        steps={steps}
        removeStepFromForm={removeStepFromForm}
        stepFormData={stepFormData}
        setStepFormData={setStepFormData}
        roles={roles}
        scopeTypes={scopeTypes}
        getScopeTypeLabel={getScopeTypeLabel}
        addStepToForm={addStepToForm}
        submitCreateWorkflow={submitCreateWorkflow}
      />

      {/* Edit Workflow Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>Update informasi workflow</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div>
              <Label htmlFor='edit_name'>Nama Workflow</Label>
              <Input
                id='edit_name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor='edit_description'>Deskripsi</Label>
              <Textarea
                id='edit_description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor='edit_category'>Berlaku untuk Kategori</Label>
              <Select
                value={formData.applies_to_category}
                onValueChange={(value) =>
                  setFormData({ ...formData, applies_to_category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={submitEditWorkflow}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Detail Modal */}
      <WorkflowDetailDialog
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        selectedWorkflow={selectedWorkflow}
        getScopeTypeLabel={getScopeTypeLabel}
        getCategoryLabel={getCategoryLabel}
      />

      {/* Delete Workflow Dialog */}
      <WorkflowDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        workflowName={selectedWorkflow?.name ?? ''}
        onConfirm={confirmDeleteWorkflow}
      />

      {/* Add Step Modal */}
      <Dialog open={isStepModalOpen} onOpenChange={setIsStepModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Step ke Workflow</DialogTitle>
            <DialogDescription>
              Tambahkan langkah baru ke workflow "{workflowForStep?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div>
              <Label htmlFor='new_step_name'>Nama Step</Label>
              <Input
                id='new_step_name'
                value={stepFormData.step_name}
                onChange={(e) =>
                  setStepFormData({
                    ...stepFormData,
                    step_name: e.target.value,
                  })
                }
                placeholder='Contoh: Approval Ketua'
              />
            </div>
            <div>
              <Label htmlFor='new_target_role'>Target Role</Label>
              <Select
                value={stepFormData.target_role_slug}
                onValueChange={(value) =>
                  setStepFormData({ ...stepFormData, target_role_slug: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Pilih role...' />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.slug}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='new_scope_type'>Scope Type</Label>
              <Select
                value={stepFormData.scope_type}
                onValueChange={(
                  value:
                    | 'SELF'
                    | 'PARENT'
                    | 'FACULTY_LEADER'
                    | 'SPECIFIC_CATEGORY',
                ) => setStepFormData({ ...stepFormData, scope_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className='font-medium'>{type.label}</div>
                        <div className='text-xs text-gray-500'>
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {stepFormData.scope_type === 'SPECIFIC_CATEGORY' && (
              <div>
                <Label htmlFor='new_target_category'>Target Category</Label>
                <Select
                  value={stepFormData.target_category_lookup}
                  onValueChange={(value) =>
                    setStepFormData({
                      ...stepFormData,
                      target_category_lookup: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih kategori...' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor='new_step_order'>Order</Label>
              <Input
                id='new_step_order'
                type='number'
                value={stepFormData.step_order}
                onChange={(e) =>
                  setStepFormData({
                    ...stepFormData,
                    step_order: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsStepModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={submitAddStep}>Tambah Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Step Modal */}
      <Dialog open={isEditStepModalOpen} onOpenChange={setIsEditStepModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
            <DialogDescription>
              Update informasi step workflow
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div>
              <Label htmlFor='edit_step_name'>Nama Step</Label>
              <Input
                id='edit_step_name'
                value={stepFormData.step_name}
                onChange={(e) =>
                  setStepFormData({
                    ...stepFormData,
                    step_name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor='edit_target_role'>Target Role</Label>
              <Select
                value={stepFormData.target_role_slug}
                onValueChange={(value) =>
                  setStepFormData({ ...stepFormData, target_role_slug: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.slug}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='edit_scope_type'>Scope Type</Label>
              <Select
                value={stepFormData.scope_type}
                onValueChange={(
                  value:
                    | 'SELF'
                    | 'PARENT'
                    | 'FACULTY_LEADER'
                    | 'SPECIFIC_CATEGORY',
                ) => setStepFormData({ ...stepFormData, scope_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className='font-medium'>{type.label}</div>
                        <div className='text-xs text-gray-500'>
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {stepFormData.scope_type === 'SPECIFIC_CATEGORY' && (
              <div>
                <Label htmlFor='edit_target_category'>Target Category</Label>
                <Select
                  value={stepFormData.target_category_lookup}
                  onValueChange={(value) =>
                    setStepFormData({
                      ...stepFormData,
                      target_category_lookup: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor='edit_step_order'>Order</Label>
              <Input
                id='edit_step_order'
                type='number'
                value={stepFormData.step_order}
                onChange={(e) =>
                  setStepFormData({
                    ...stepFormData,
                    step_order: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsEditStepModalOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={submitEditStep}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Step Dialog */}
      <AlertDialog
        open={isDeleteStepDialogOpen}
        onOpenChange={setIsDeleteStepDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Step</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus step "{selectedStep?.step_name}
              "? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStep}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
