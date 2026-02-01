import api from '@/lib/axios';

export interface Signature {
  id: number;
  user_id: number;
  signature: string; // path to signature file
  signed_at: string;
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
    const response = await api.get<SignatureResponse>('/signs');
    return response.data.data || null;
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
