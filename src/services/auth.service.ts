import api from '@/lib/axios';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role_id: number;
    unit_id: number;
    role?: {
      id: number;
      name: string;
    };
    unit?: {
      id: number;
      name: string;
    };
  };
}

interface LogoutResponse {
  message: string;
}

export const authService = {
  /**
   * Login dengan email dan password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', credentials);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>('/logout');
    return response.data;
  },

  /**
   * Get authenticated user
   */
  async getUser() {
    const response = await api.get('/user');
    return response.data;
  },

  /**
   * Simpan data autentikasi ke localStorage
   */
  saveAuthData(data: LoginResponse): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('userName', data.user.name);
    localStorage.setItem('userId', data.user.id.toString());

    if (data.user.role) {
      localStorage.setItem('role', data.user.role.name);
      localStorage.setItem('roleId', data.user.role.id.toString());
    }

    if (data.user.unit) {
      localStorage.setItem('userUnit', data.user.unit.name);
      localStorage.setItem('unitId', data.user.unit.id.toString());
    }
  },

  /**
   * Hapus data autentikasi dari localStorage
   */
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('roleId');
    localStorage.removeItem('userUnit');
    localStorage.removeItem('unitId');
  },

  /**
   * Cek apakah user sudah login
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  /**
   * Get role dari localStorage
   */
  getRole(): string | null {
    return localStorage.getItem('role');
  },

  /**
   * Redirect ke halaman sesuai role
   */
  redirectByRole(role: string): void {
    const roleRoutes: Record<string, string> = {
      Admin: '/admin/',
      'Wakil Dekan 1': '/wadek/',
      'Kemahasiswaan Fakultas': '/kemahasiswaan/',
      'Sumber Daya Fakultas': '/sumber-daya/',
      'Ketua Prodi': '/ketua-prodi/',
      'Pembimbing Ormawa': '/pembimbing/',
      'Ketua Senat': '/ketua-senat/',
      'Ketua BEM': '/ketua-bem/',
      'Ketua HIMA': '/ketua-hima/',
      'Ketua UKM': '/ketua-ukm/',
      'Sekretaris Senat': '/sekretaris-senat/',
      'Sekretaris BEM': '/sekretaris-bem/',
      'Sekretaris HIMA': '/sekretaris-hima/',
      'Sekretaris UKM': '/sekretaris-ukm/',
      Mahasiswa: '/peminjam/',
    };

    const path = roleRoutes[role] || '/';
    window.location.href = path;
  },
};
