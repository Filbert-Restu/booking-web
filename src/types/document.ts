// src/types/document.ts
import { DOCUMENT_STATUS, DOCUMENT_ACTIONS } from '@/constants/document';

export type DocumentStatus =
  (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];
export type DocumentAction =
  (typeof DOCUMENT_ACTIONS)[keyof typeof DOCUMENT_ACTIONS];

// User helper (bisa dipindah ke user.ts jika mau lebih rapi)
export interface UserShort {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    name: string;
    slug: string;
  };
}

// Log Interface
export interface DocumentLog {
  id: number;
  document_id: number;
  user_id: number;
  action: DocumentAction;
  note?: string;
  step_snapshot?: number;
  created_at: string;
  user?: UserShort;
}

// Document Interface (Generic TContent)
export interface Document<
  TContent = Record<string, string | number | boolean | null>,
> {
  id: number;
  workflow_id: number;
  title: string;
  content?: TContent;
  attachment_path?: string;
  meta_data?: Record<string, string | number | boolean | null>;
  unit_id: number;
  creator_id: number;
  current_holder_id?: number;
  status: DocumentStatus;
  current_step_order: number;

  // File Paths
  file_executive_summary?: string;
  file_approval_sheet?: string;
  file_proposal?: string;

  completed_at?: string;
  created_at: string;
  updated_at: string;

  // Relations
  workflow?: {
    id: number;
    name: string;
    description?: string;
  };
  currentHolder?: UserShort;
  creator?: UserShort;
  unit?: {
    id: number;
    name: string;
    code: string;
  };
  logs?: DocumentLog[];
}

// API Response Types
export interface DocumentsResponse {
  success: boolean;
  data: {
    my_documents: Document[];
    pending_documents: Document[];
    processed_documents: Document[];
    all_documents?: Document[];
  };
}

export interface SingleDocumentResponse {
  success: boolean;
  data: Document;
}

// Input Types
export interface CreateDocumentData {
  workflow_id: number;
  title: string;
  content?: Record<string, string | number | boolean | null>;
  meta_data?: Record<string, string | number | boolean | null>;
}

export interface UpdateDocumentData {
  title?: string;
  content?: Record<string, string | number | boolean | null>;
  meta_data?: Record<string, string | number | boolean | null>;
}
