import { apiClient, setAccessToken, setRefreshToken, clearTokens } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'editor' | 'author';
    status: 'active' | 'inactive';
    avatar_id: number | null;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 [AUTH API] Calling login endpoint...');
    const response = await apiClient.post('/auth/login', credentials);
    console.log('📦 [AUTH API] Raw response:', response.data);
    
    const { accessToken, refreshToken, user } = response.data.data;
    console.log('🔑 [AUTH API] Extracted tokens - Access:', accessToken ? 'Yes' : 'No', 'Refresh:', refreshToken ? 'Yes' : 'No');
    
    // Store tokens
    console.log('💾 [AUTH API] Storing tokens in localStorage...');
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    
    // Verify storage
    const storedAccess = localStorage.getItem('access_token');
    const storedRefresh = localStorage.getItem('refresh_token');
    console.log('✅ [AUTH API] Tokens stored - Access:', storedAccess ? 'Yes' : 'No', 'Refresh:', storedRefresh ? 'Yes' : 'No');
    
    return response.data.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    const { accessToken, refreshToken } = response.data.data;
    
    // Store tokens
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    
    // Update tokens
    setAccessToken(accessToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }
    
    return response.data.data;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear tokens regardless of API response
      clearTokens();
    }
  },

  /**
   * Get current authenticated user
   */
  async me(): Promise<AuthResponse['user']> {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },
};

export default authApi;
