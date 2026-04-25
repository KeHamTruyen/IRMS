import mockBackend from '../data/mock-backend.json'

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))

const timestamp = () => new Date().toISOString()

const buildResponse = (data, message) => ({
  success: true,
  message,
  data,
  timestamp: timestamp(),
})

const buildError = (error, message) => ({
  success: false,
  error,
  message,
  timestamp: timestamp(),
})

const users = mockBackend.users ?? []
const dashboards = mockBackend.dashboards ?? {}

const sanitizeSession = (user) => ({
  token: `mock-token-${user.username}`,
  username: user.username,
  fullName: user.fullName,
  role: user.role,
  userId: user.id,
  source: mockBackend.meta?.source ?? 'mock-fallback',
  profile: {
    email: user.email,
    phone: user.phone,
  },
})

export const mockApi = {
  async loginAdmin(payload) {
    await wait()

    const user = users.find(
      (item) =>
        item.role === 'ADMIN' &&
        item.username === payload.username &&
        item.password === payload.password &&
        item.isActive,
    )

    if (!user) {
      return buildError('Sai tên đăng nhập hoặc mật khẩu', 'Xác thực thất bại')
    }

    return buildResponse(sanitizeSession(user), 'Đăng nhập thành công')
  },

  async loginWithPin(payload) {
    await wait()

    const user = users.find(
      (item) =>
        item.role === payload.role &&
        item.pin === payload.pin &&
        item.authMethod === 'pin' &&
        item.isActive,
    )

    if (!user) {
      return buildError('Sai mã PIN hoặc không đúng vai trò', 'Xác thực thất bại')
    }

    return buildResponse(sanitizeSession(user), 'Đăng nhập thành công')
  },

  async getDashboard(role) {
    await wait(180)

    const dashboard = dashboards[role]

    if (!dashboard) {
      return buildError(`Chưa có dashboard cho vai trò ${role}`, 'Thiếu dữ liệu dự phòng')
    }

    return buildResponse(dashboard, 'Đã tải dashboard')
  },

  async getDemoAccess() {
    await wait(80)
    return buildResponse(mockBackend.demoAccess, 'Đã tải thông tin đăng nhập mẫu')
  },
}
