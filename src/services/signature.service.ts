import api from '@/lib/axios';

export interface Signature {
  id: number;
  user_id: number;
  signature: string; // path to signature file in storage
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SignatureResponse {
  success: boolean;
  data?: Signature;
  message?: string;
}

class SignatureService {
  /**
   * Get authenticated user's signature
   */
  async getSignature(): Promise<Signature | null> {
    try {
      console.log('🔍 [SignatureService] Fetching user signature...');
      const response = await api.get<SignatureResponse>('/signs');
      console.log('✅ [SignatureService] Response:', response.data);
      return response.data.data || null;
    } catch (error: any) {
      console.error('❌ [SignatureService] Error fetching signature:', error);
      if (error.response?.status === 404) {
        console.log('ℹ️ [SignatureService] No signature found (404)');
        return null;
      }
      throw error;
    }
  }

  /**
   * Upload a new signature
   */
  async uploadSignature(signatureFile: File): Promise<Signature> {
    const formData = new FormData();
    formData.append('signature', signatureFile);

    const response = await api.post<SignatureResponse>('/signs', formData);
    return response.data.data!;
  }

  /**
   * Update existing signature
   */
  async updateSignature(id: number, signatureFile: File): Promise<Signature> {
    const formData = new FormData();
    formData.append('signature', signatureFile);

    const response = await api.put<SignatureResponse>(`/signs/${id}`, formData);
    return response.data.data!;
  }

  /**
   * Delete signature
   */
  async deleteSignature(id: number): Promise<void> {
    await api.delete(`/signs/${id}`);
  }

  /**
   * Get signature file URL (for preview)
   * Returns blob URL that can be used in <img> tag
   */
  async getSignatureFileUrl(): Promise<string | null> {
    try {
      const response = await api.get('/signs/file', {
        responseType: 'blob',
      });
      const blob = response.data;
      return URL.createObjectURL(blob);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const signatureService = new SignatureService();
