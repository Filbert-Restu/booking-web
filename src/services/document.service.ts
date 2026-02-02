import api from '@/lib/axios';

export interface Document {
  id: number;
  workflow_id: number;
  title: string;
  content?: Record<string, any>;
  attachment_path?: string;
  meta_data?: Record<string, any>;
  unit_id: number;
  creator_id: number;
  current_holder_id?: number;
  status: 'DRAFT' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'REVISED';
  current_step_order: number;
  file_executive_summary?: string;
  file_approval_sheet?: string;
  file_proposal?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  workflow?: {
    id: number;
    name: string;
    description?: string;
  };
  currentHolder?: {
    id: number;
    name: string;
    email: string;
    role?: {
      id: number;
      name: string;
      slug: string;
    };
  };
  creator?: {
    id: number;
    name: string;
    email: string;
    role?: {
      id: number;
      name: string;
      slug: string;
    };
  };
  unit?: {
    id: number;
    name: string;
    code: string;
  };
  logs?: DocumentLog[];
}

export interface DocumentLog {
  id: number;
  document_id: number;
  user_id: number;
  action: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVISED';
  note?: string;
  step_snapshot?: number;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export interface DocumentsResponse {
  success: boolean;
  data: {
    my_documents?: Document[];
    pending_documents?: Document[];
    processed_documents?: Document[];
    all_documents?: Document[];
  };
}

export interface SingleDocumentResponse {
  success: boolean;
  data: Document;
}

export interface CreateDocumentData {
  workflow_id: number;
  title: string;
  content?: Record<string, any>;
  attachment_path?: string;
  meta_data?: Record<string, any>;
}

export interface UpdateDocumentData {
  title?: string;
  content?: Record<string, any>;
  attachment_path?: string;
  meta_data?: Record<string, any>;
}

export const documentService = {
  /**
   * Get list dokumen user
   * - my_documents: Dokumen yang dibuat user
   * - pending_documents: Dokumen yang menunggu action dari user
   * - processed_documents: Dokumen yang sudah diproses user
   */
  async getDocuments(filters?: {
    status?: string;
    workflow_id?: number;
  }): Promise<DocumentsResponse['data']> {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append('status', filters.status);
    }

    if (filters?.workflow_id) {
      params.append('workflow_id', String(filters.workflow_id));
    }

    const response = await api.get<DocumentsResponse>(
      `/documents${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return response.data.data;
  },

  /**
   * Get detail dokumen dengan logs
   */
  async getDocument(id: number): Promise<Document> {
    const response = await api.get<SingleDocumentResponse>(`/documents/${id}`);
    return response.data.data;
  },

  /**
   * Buat dokumen baru (status DRAFT)
   */
  async createDocument(data: CreateDocumentData | FormData): Promise<Document> {
    const response = await api.post<SingleDocumentResponse>('/documents', data);
    return response.data.data;
  },

  /**
   * Update dokumen (hanya untuk DRAFT atau REVISED)
   */
  async updateDocument(
    id: number,
    data: UpdateDocumentData | FormData,
  ): Promise<Document> {
    // Laravel PUT doesn't handle FormData well, use POST with _method=PUT
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await api.post<SingleDocumentResponse>(
        `/documents/${id}`,
        data,
      );
      return response.data.data;
    }

    const response = await api.put<SingleDocumentResponse>(
      `/documents/${id}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Submit dokumen untuk memulai workflow
   */
  async submitDocument(id: number): Promise<Document> {
    const response = await api.post<SingleDocumentResponse>(
      `/documents/${id}/submit`,
    );
    return response.data.data;
  },

  /**
   * Approve dokumen (untuk approver)
   */
  async approveDocument(
    id: number,
    signature: string,
    note?: string,
  ): Promise<Document> {
    const response = await api.post<SingleDocumentResponse>(
      `/documents/${id}/approve`,
      { signature, note },
    );
    return response.data.data;
  },

  /**
   * Reject dokumen (untuk approver)
   */
  async rejectDocument(id: number, note: string): Promise<Document> {
    const response = await api.post<SingleDocumentResponse>(
      `/documents/${id}/reject`,
      { note },
    );
    return response.data.data;
  },

  /**
   * Kembalikan dokumen untuk revisi (untuk approver)
   */
  async reviseDocument(
    id: number,
    targetUserId: number,
    note: string,
  ): Promise<Document> {
    const response = await api.post<SingleDocumentResponse>(
      `/documents/${id}/revise`,
      { target_user_id: targetUserId, note },
    );
    return response.data.data;
  },

  /**
   * Generate executive summary dari template
   */
  async generateExecutiveSummary(
    documentId: number,
  ): Promise<{ file_path: string; download_url: string }> {
    const response = await api.post(
      `/documents/${documentId}/generate/executive-summary`,
    );
    return response.data.data;
  },

  /**
   * Generate lembar pengesahan dari template
   */
  async generateApprovalSheet(
    documentId: number,
  ): Promise<{ file_path: string; download_url: string }> {
    const response = await api.post(
      `/documents/${documentId}/generate/approval-sheet`,
    );
    return response.data.data;
  },
};
