const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
const TOKEN_STORAGE_KEY = 'irms-token'

const getAuthHeaders = () => {
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.success === false) {
    const message = payload?.error ?? payload?.message ?? 'Không thể kết nối đến máy chủ.'
    throw new Error(message)
  }

  return payload?.data ?? payload
}

export const api = {
  get(path) {
    return request(path)
  },

  post(path, body) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  patch(path, body) {
    return request(path, {
      method: 'PATCH',
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  },

  delete(path) {
    return request(path, {
      method: 'DELETE',
    })
  },
}
