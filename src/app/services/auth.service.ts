// Authentication Service
import api from './api';
import { User } from '../types';

// Backend DTOs
interface AuthRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  fullName: string;
  role: string;
}

// Map backend role to frontend role
const mapRole = (backendRole: string): User['role'] => {
  const roleMap: Record<string, User['role']> = {
    'ADMIN': 'admin',
    'MANAGER': 'manager',
    'SERVER': 'server',
    'CHEF': 'chef',
    'CASHIER': 'cashier',
    'HOST': 'host',
  };
  return roleMap[backendRole] || 'server';
};

export const authService = {
  // Login
  async login(username: string, password: string): Promise<User> {
    const request: AuthRequest = { username, password };
    const response = await api.post<AuthResponse>('/auth/login', request);
    
    // Extract data from ApiResponse wrapper
    const authData = response.data as any;
    const data = authData.data || authData;
    
    // Store token
    localStorage.setItem('jwt_token', data.token);
    
    // Map to frontend User type
    const user: User = {
      id: data.userId.toString(),
      name: data.fullName,
      role: mapRole(data.role),
    };
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  // Logout
  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
  },

  // Get current user from storage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  },
};
