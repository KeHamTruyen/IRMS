import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMock = vi.hoisted(() => {
  const state: {
    requestHandler?: (config: any) => any;
    responseErrorHandler?: (error: any) => any;
  } = {};

  const create = vi.fn(() => ({
    interceptors: {
      request: {
        use: (onFulfilled: (config: any) => any) => {
          state.requestHandler = onFulfilled;
        },
      },
      response: {
        use: (_onFulfilled: any, onRejected: (error: any) => any) => {
          state.responseErrorHandler = onRejected;
        },
      },
    },
  }));

  return {
    state,
    create,
  };
});

vi.mock('axios', () => ({
  default: {
    create: axiosMock.create,
  },
  create: axiosMock.create,
}));

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    axiosMock.create.mockClear();
    axiosMock.state.requestHandler = undefined;
    axiosMock.state.responseErrorHandler = undefined;
  });

  it('registers request and response interceptors', async () => {
    await import('../api');

    expect(axiosMock.create).toHaveBeenCalledTimes(1);
    expect(axiosMock.state.requestHandler).toBeTypeOf('function');
    expect(axiosMock.state.responseErrorHandler).toBeTypeOf('function');
  });

  it('adds bearer token to outgoing requests', async () => {
    localStorage.setItem('jwt_token', 'token-123');
    await import('../api');

    const result = await axiosMock.state.requestHandler?.({ headers: {} });

    expect(result.headers.Authorization).toBe('Bearer token-123');
  });

  it('clears auth storage on 401 responses', async () => {
    localStorage.setItem('jwt_token', 'token-123');
    localStorage.setItem('user', '{"id":"1"}');
    await import('../api');

    await expect(
      axiosMock.state.responseErrorHandler?.({ response: { status: 401 } })
    ).rejects.toEqual({
      response: { status: 401 },
    });

    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});