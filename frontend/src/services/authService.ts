import axios, { AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, User } from '../store/slices/authSlice';

// API基础URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// 创建axios实例
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 如果返回401且不是refresh请求，尝试刷新token
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh')) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authAPI.post('/refresh', { refreshToken });
          const { accessToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          
          // 重新发送原始请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return authAPI(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，清除token并跳转到登录页
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 登录响应接口
interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// 注册响应接口
interface RegisterResponse {
  message: string;
  user: Pick<User, 'id' | 'username' | 'email'>;
}

// Token刷新响应接口
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

// 认证服务类
class AuthService {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await authAPI.post('/login', credentials);
    return response.data;
  }

  /**
   * 用户注册
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response: AxiosResponse<RegisterResponse> = await authAPI.post('/register', userData);
    return response.data;
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await authAPI.get('/me');
    return response.data;
  }

  /**
   * 刷新访问token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response: AxiosResponse<RefreshTokenResponse> = await authAPI.post('/refresh', {
      refreshToken,
    });
    return response.data;
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await authAPI.post('/logout', { refreshToken });
    }
  }

  /**
   * 更新用户资料
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await authAPI.put('/profile', profileData);
    return response.data;
  }

  /**
   * 修改密码
   */
  async changePassword(passwordData: { oldPassword: string; newPassword: string }): Promise<void> {
    await authAPI.put('/password', passwordData);
  }

  /**
   * 忘记密码 - 发送重置邮件
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await authAPI.post('/forgot-password', {
      email,
    });
    return response.data;
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await authAPI.post('/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await authAPI.post('/verify-email', {
      token,
    });
    return response.data;
  }

  /**
   * 重新发送验证邮件
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await authAPI.post('/resend-verification');
    return response.data;
  }

  /**
   * 启用两步验证
   */
  async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    const response: AxiosResponse<{ qrCode: string; secret: string }> = await authAPI.post('/2fa/enable');
    return response.data;
  }

  /**
   * 验证两步验证码
   */
  async verifyTwoFactor(code: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await authAPI.post('/2fa/verify', {
      code,
    });
    return response.data;
  }

  /**
   * 禁用两步验证
   */
  async disableTwoFactor(code: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await authAPI.post('/2fa/disable', {
      code,
    });
    return response.data;
  }

  /**
   * 获取用户权限列表
   */
  async getUserPermissions(): Promise<string[]> {
    const response: AxiosResponse<{ permissions: string[] }> = await authAPI.get('/permissions');
    return response.data.permissions;
  }

  /**
   * 检查用户是否有特定权限
   */
  async checkPermission(permission: string): Promise<boolean> {
    try {
      const response: AxiosResponse<{ hasPermission: boolean }> = await authAPI.get(
        `/permissions/check?permission=${encodeURIComponent(permission)}`
      );
      return response.data.hasPermission;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取用户角色列表
   */
  async getUserRoles(): Promise<string[]> {
    const response: AxiosResponse<{ roles: string[] }> = await authAPI.get('/roles');
    return response.data.roles;
  }

  /**
   * OAuth登录重定向URL生成
   */
  getOAuthLoginUrl(provider: 'google' | 'github' | 'gitlab'): string {
    return `${API_BASE_URL}/api/auth/oauth/${provider}`;
  }

  /**
   * 处理OAuth回调
   */
  async handleOAuthCallback(provider: string, code: string, state?: string): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await authAPI.post(`/oauth/${provider}/callback`, {
      code,
      state,
    });
    return response.data;
  }

  /**
   * 获取登录历史
   */
  async getLoginHistory(page = 1, size = 10): Promise<{
    data: Array<{
      id: string;
      ip: string;
      userAgent: string;
      location?: string;
      loginAt: string;
      success: boolean;
    }>;
    total: number;
    page: number;
    size: number;
  }> {
    const response = await authAPI.get(`/login-history?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * 撤销所有会话（强制登出所有设备）
   */
  async revokeAllSessions(): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await authAPI.post('/revoke-sessions');
    return response.data;
  }

  /**
   * 获取活跃会话列表
   */
  async getActiveSessions(): Promise<Array<{
    id: string;
    ip: string;
    userAgent: string;
    location?: string;
    lastActiveAt: string;
    current: boolean;
  }>> {
    const response = await authAPI.get('/sessions');
    return response.data;
  }

  /**
   * 撤销特定会话
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await authAPI.delete(`/sessions/${sessionId}`);
    return response.data;
  }
}

// 创建服务实例
const authService = new AuthService();

export default authService;

// 导出类型
export type {
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
};