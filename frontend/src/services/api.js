const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.success === false) {
    const message =
      payload?.error ?? payload?.message ?? 'Không thể kết nối đến máy chủ xác thực.'
    throw new Error(message)
  }

  return payload?.data ?? payload
}

export const api = {
  post(path, body) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}
