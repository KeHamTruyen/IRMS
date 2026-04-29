import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../api', () => ({
  default: apiMock,
}));

import { authService } from '../auth.service';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('logs in a user and stores mapped session data', async () => {
    apiMock.post.mockResolvedValue({
      data: {
        data: {
          token: 'jwt-token',
          userId: 7,
          username: 'admin',
          fullName: 'Admin User',
          role: 'ADMIN',
        },
      },
    });

    const user = await authService.login('admin', 'password123');

    expect(apiMock.post).toHaveBeenCalledWith('/auth/login', {
      username: 'admin',
      password: 'password123',
    });
    expect(user).toEqual({
      id: '7',
      name: 'Admin User',
      role: 'admin',
    });
    expect(localStorage.getItem('jwt_token')).toBe('jwt-token');
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.getCurrentUser()).toEqual(user);
  });

  it('logs out and clears stored session data', () => {
    localStorage.setItem('jwt_token', 'jwt-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'User', role: 'server' }));

    authService.logout();

    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getCurrentUser()).toBeNull();
  });
});