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
const disabledRoles = ['MANAGER']

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const buildAdminDashboard = () => {
  const serverDashboard = dashboards.SERVER ?? {}
  const chefDashboard = dashboards.CHEF ?? {}
  const menuCatalog = serverDashboard.menuCatalog ?? { categories: [], items: [] }
  const menuManagement = chefDashboard.menuManagement ?? { items: [] }
  const tableManagement = serverDashboard.tableManagement ?? { tables: [] }
  const kitchenDisplay = chefDashboard.kitchenDisplay ?? { orders: [] }
  const inventoryManagement = chefDashboard.inventoryManagement ?? { items: [] }
  const serviceSessions = serverDashboard.serviceConsole?.sessions ?? []
  const serverTables = tableManagement.tables ?? []

  const menuItems = menuCatalog.items.map((item) => {
    const kitchenMeta = menuManagement.items.find((menuItem) => menuItem.id === item.id)

    return {
      ...item,
      station: kitchenMeta?.station ?? 'Chưa gán quầy',
      sku: `MN-${item.id}`,
      featured: item.id === 101 || item.id === 102 || item.id === 107,
      lastUpdated: '2026-04-25T21:00:00+07:00',
    }
  })

  const totalRevenue = serviceSessions.reduce(
    (sum, session) => sum + Number(session.bill?.totalAmount || 0),
    0
  )

  const bestSellingLookup = new Map()
  serviceSessions.forEach((session) => {
    ;(session.orderResponse?.items ?? []).forEach((item) => {
      const current = bestSellingLookup.get(item.menuItemId) ?? {
        id: item.menuItemId,
        name: item.menuItemName,
        orders: 0,
        revenue: 0,
      }

      current.orders += Number(item.quantity || 0)
      current.revenue += Number(item.subtotal || 0)
      bestSellingLookup.set(item.menuItemId, current)
    })
  })

  const bestSellingItems = [...bestSellingLookup.values()]
    .sort((left, right) => right.orders - left.orders)
    .slice(0, 4)

  const kitchenItems = kitchenDisplay.orders.flatMap((order) => order.items ?? [])
  const delayedItems = kitchenItems.filter((item) => item.status !== 'COMPLETED').length
  const lowStockItems = (inventoryManagement.items ?? []).filter(
    (item) => Number(item.quantity || 0) <= Number(item.threshold || 0)
  ).length
  const activeStaff = users.filter((user) => user.isActive).length
  const tableSummary = {
    total: serverTables.length,
    available: serverTables.filter((table) => table.serviceState === 'AVAILABLE').length,
    reserved: serverTables.filter((table) => table.serviceState === 'RESERVED').length,
    waitingFood: serverTables.filter((table) => table.serviceState === 'WAITING_FOOD').length,
    served: serverTables.filter((table) => table.serviceState === 'SERVED').length,
    cleaning: serverTables.filter((table) => table.serviceState === 'CLEANING').length,
  }

  const centralizedOrders = [...kitchenDisplay.orders]
    .map((order) => {
      const pendingItems = order.items.filter((item) => item.status !== 'COMPLETED').length
      const completedItems = order.items.filter((item) => item.status === 'COMPLETED').length

      return {
        ...order,
        status: pendingItems > 0 ? 'WAITING' : 'COMPLETED',
        pendingItems,
        completedItems,
        stations: [...new Set(order.items.map((item) => item.station))],
      }
    })
    .sort((left, right) => Number(right.elapsedMinutes || 0) - Number(left.elapsedMinutes || 0))

  const peakHours = [
    { label: '11:00 - 12:00', orders: 18, revenue: 4680000 },
    { label: '12:00 - 13:00', orders: 24, revenue: 6320000 },
    { label: '18:00 - 19:00', orders: 21, revenue: 5890000 },
    { label: '19:00 - 20:00', orders: 16, revenue: 4210000 },
  ]

  return {
    ...(dashboards.ADMIN ?? {}),
    roleLabel: dashboards.ADMIN?.roleLabel ?? 'Quản trị hệ thống',
    sourceLabel:
      dashboards.ADMIN?.sourceLabel ??
      'Dữ liệu dự phòng quản trị được ghép từ mock backend hiện tại',
    snapshotTime: dashboards.ADMIN?.snapshotTime ?? 'Ảnh chụp lúc 21:30',
    footerNote:
      'Dữ liệu trang quản trị đang dùng fallback theo cấu trúc users, menuCatalog, menuManagement, inventoryManagement, serviceConsole, tableManagement và kitchenDisplay.',
    searchPlaceholder: 'Tìm báo cáo, món ăn hoặc thao tác...',
    navigation: {
      sideItems: [
        { id: 'overview', label: 'Tổng quan' },
        { id: 'analytics', label: 'Analytics & Reports' },
        { id: 'management', label: 'Quản trị tập trung' },
      ],
    },
    overview: {
      summaryMetrics: [
        {
          id: 'revenue',
          label: 'Doanh thu theo ca',
          value: formatCurrency(totalRevenue),
          note: 'Tổng hợp từ hóa đơn mock hiện có',
        },
        {
          id: 'staff',
          label: 'Nhân sự hoạt động',
          value: `${activeStaff}`,
          note: 'Đếm từ danh sách người dùng đang kích hoạt',
        },
        {
          id: 'availableTables',
          label: 'Bàn đang trống',
          value: `${tableSummary.available}`,
          note: `${tableSummary.reserved} bàn đặt trước, ${tableSummary.cleaning} bàn cần dọn`,
        },
        {
          id: 'waitingOrders',
          label: 'Đơn đang chờ',
          value: `${centralizedOrders.filter((order) => order.status === 'WAITING').length}`,
          note: `${delayedItems} món chờ hoàn tất từ luồng chef`,
        },
      ],
      alerts: [
        {
          id: 'inventory',
          title: 'Tồn kho cần nhập thêm',
          description: `${lowStockItems} nguyên liệu đã chạm hoặc thấp hơn ngưỡng tồn tối thiểu.`,
          tone: 'warning',
        },
        {
          id: 'kitchen',
          title: 'Khu bếp có đơn đang chờ',
          description: `${centralizedOrders.filter((order) => order.status === 'WAITING').length} đơn đang cần theo dõi từ phía bếp.`,
          tone: 'neutral',
        },
      ],
    },
    analyticsReports: {
      rangeOptions: ['7 ngày', '30 ngày', 'Quý này'],
      salesMetrics: [
        { id: 'revenue', label: 'Hiệu suất doanh thu', value: formatCurrency(totalRevenue), change: '+8,4%' },
        { id: 'orders', label: 'Đơn đã phục vụ', value: `${serviceSessions.length}`, change: '+5,2%' },
        {
          id: 'ticket',
          label: 'Giá trị hóa đơn TB',
          value: formatCurrency(totalRevenue / Math.max(serviceSessions.length, 1)),
          change: '+3,1%',
        },
      ],
      revenueTrend: [
        { day: 'Th 2', current: 4200000, previous: 3800000 },
        { day: 'Th 3', current: 5100000, previous: 4700000 },
        { day: 'Th 4', current: 4950000, previous: 4520000 },
        { day: 'Th 5', current: 5600000, previous: 4890000 },
        { day: 'Th 6', current: 6150000, previous: 5300000 },
        { day: 'Th 7', current: 6840000, previous: 5900000 },
        { day: 'CN', current: 5780000, previous: 5440000 },
      ],
      peakHours,
      bestSellingItems,
      operationalMetrics: [
        {
          id: 'delay',
          label: 'Độ trễ phục vụ',
          value: '12 phút',
          note: 'Thời gian chờ trung bình từ xác nhận đến hoàn tất',
        },
        {
          id: 'bottleneck',
          label: 'Điểm nghẽn bếp',
          value: 'Bếp nóng',
          note: 'Tập trung nhiều món chờ nhất trong mock KDS',
        },
        {
          id: 'staff',
          label: 'Hiệu suất nhân sự',
          value: '89%',
          note: 'Ước lượng theo số đơn và trạng thái xử lý hiện tại',
        },
      ],
    },
    centralizedManagement: {
      menuCategories: menuCatalog.categories.filter((item) => item !== 'Tất cả'),
      menuItems,
      staffRoles: ['ADMIN', 'MANAGER', 'SERVER', 'CHEF', 'CASHIER', 'HOST'],
      staffMembers: users.map((user) => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        authMethod: user.authMethod,
      })),
      inventoryCategories: (inventoryManagement.categories ?? []).filter((item) => item !== 'Tất cả'),
      inventoryItems: inventoryManagement.items ?? [],
      tableLocations: [...new Set(serverTables.map((table) => table.location))],
      tableStatusOptions: ['AVAILABLE', 'RESERVED', 'WAITING_FOOD', 'SERVED', 'CLEANING'],
      tables: serverTables,
      orders: centralizedOrders,
      pricingRules: [
        {
          id: 'price-1',
          name: 'Điều chỉnh giờ cao điểm tối',
          scope: 'Món chính',
          impact: '+5%',
          status: 'Đang áp dụng',
        },
        {
          id: 'price-2',
          name: 'Ưu đãi đồ uống buổi trưa',
          scope: 'Nước uống',
          impact: '-10%',
          status: 'Lên lịch',
        },
      ],
      promotions: [
        {
          id: 'promo-1',
          name: 'Combo trưa văn phòng',
          period: '11:00 - 14:00',
          status: 'Đang chạy',
          description: 'Giảm 12% cho combo món chính và nước uống.',
        },
        {
          id: 'promo-2',
          name: 'Cuối tuần nhóm 4+',
          period: 'Thứ 7 - Chủ nhật',
          status: 'Nháp',
          description: 'Tặng món tráng miệng cho bàn từ 4 khách trở lên.',
        },
      ],
      roleAccess: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        authMethod: user.authMethod,
      })),
      auditLogs: [
        {
          id: 'log-1',
          actor: 'Quản trị hệ thống',
          action: 'Cập nhật giá Latte yến mạch đá',
          target: 'MN-106',
          module: 'Pricing',
          occurredAt: '2026-04-25T20:58:00+07:00',
        },
        {
          id: 'log-2',
          actor: 'Nguyễn Minh Quản Lý',
          action: 'Hoàn tiền hóa đơn BILL-208',
          target: 'BILL-208',
          module: 'Refund',
          occurredAt: '2026-04-25T20:44:00+07:00',
        },
        {
          id: 'log-3',
          actor: 'Quản trị hệ thống',
          action: 'Tạo khuyến mãi Combo trưa văn phòng',
          target: 'promo-1',
          module: 'Promotion',
          occurredAt: '2026-04-25T19:50:00+07:00',
        },
      ],
    },
  }
}

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
        item.isActive
    )

    if (!user) {
      return buildError('Sai tên đăng nhập hoặc mật khẩu', 'Xác thực thất bại')
    }

    return buildResponse(sanitizeSession(user), 'Đăng nhập thành công')
  },

  async loginWithPin(payload) {
    await wait()

    if (disabledRoles.includes(payload.role)) {
      return buildError('Vai trò này không còn được hỗ trợ đăng nhập', 'Xác thực thất bại')
    }

    const user = users.find(
      (item) =>
        item.role === payload.role &&
        item.pin === payload.pin &&
        item.authMethod === 'pin' &&
        item.isActive
    )

    if (!user) {
      return buildError('Sai mã PIN hoặc không đúng vai trò', 'Xác thực thất bại')
    }

    return buildResponse(sanitizeSession(user), 'Đăng nhập thành công')
  },

  async getDashboard(role) {
    await wait(180)

    if (disabledRoles.includes(role)) {
      return buildError(`Dashboard cho vai trò ${role} đã bị gỡ`, 'Thiếu dữ liệu dự phòng')
    }

    const dashboard = role === 'ADMIN' ? buildAdminDashboard() : dashboards[role]

    if (!dashboard) {
      return buildError(`Chưa có dashboard cho vai trò ${role}`, 'Thiếu dữ liệu dự phòng')
    }

    return buildResponse(dashboard, 'Đã tải dashboard')
  },

  async getDemoAccess() {
    await wait(80)
    return buildResponse(
      (mockBackend.demoAccess ?? []).filter((item) => !disabledRoles.includes(item.role)),
      'Đã tải thông tin đăng nhập mẫu'
    )
  },
}
