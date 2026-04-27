import { api } from './api'

const SESSION_STORAGE_KEY = 'irms-session'
const TOKEN_STORAGE_KEY = 'irms-token'

const normalizeSession = (payload) => ({
  token: payload.token,
  userId: payload.userId,
  username: payload.username,
  fullName: payload.fullName,
  role: payload.role,
  authMethod: payload.authMethod,
  source: 'backend-api',
})

const readStoredSession = () => {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeStoredSession = (session) => {
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token)
}

export const authApi = {
  async loginAdmin({ username, password }) {
    const payload = await api.post('/auth/login', {
      authMethod: 'PASSWORD',
      username,
      password,
    })

    const session = normalizeSession(payload)
    writeStoredSession(session)
    return session
  },

  async loginWithPin({ role, pin }) {
    const payload = await api.post('/auth/login', {
      authMethod: 'PIN',
      role,
      pin,
    })

    const session = normalizeSession(payload)
    writeStoredSession(session)
    return session
  },

  getStoredSession() {
    return readStoredSession()
  },

  persistSession(session) {
    writeStoredSession(session)
  },

  async logout() {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)

    try {
      await api.post('/auth/logout', token ? { token } : {})
    } catch {
      // JWT logout chỉ cần dọn session ở client.
    } finally {
      writeStoredSession(null)
    }
  },
}
