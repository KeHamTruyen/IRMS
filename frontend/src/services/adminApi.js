import { api } from './api'

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const percentLabel = (value) => `${Number(value || 0) >= 0 ? '+' : ''}${Number(value || 0).toFixed(1)}%`

const stationByCategory = (category) => {
  const normalized = String(category ?? '').toLowerCase()
  if (normalized.includes('uống')) return 'Quầy lạnh'
  if (normalized.includes('tráng')) return 'Tráng miệng'
  if (normalized.includes('khai')) return 'Ra món lạnh'
  return 'Bếp nóng'
}

const mapTable = (table) => ({
  ...table,
  serviceState: table.status,
  currentGuests: table.status === 'OCCUPIED' ? table.capacity : 0,
  reservationName: null,
  billingStatus: table.status === 'OCCUPIED' ? 'PENDING' : null,
})

const mapOrderTypeLabel = (orderType) => {
  switch (orderType) {
    case 'TAKEAWAY':
      return 'Mang về'
    case 'DELIVERY':
      return 'Giao hàng'
    case 'DINE_IN':
    default:
      return 'Tại bàn'
  }
}

const mapKitchenStatus = (status) => (status === 'READY' || status === 'SERVED' ? 'COMPLETED' : 'WAITING')

const elapsedMinutes = (createdAt) => {
  const time = new Date(createdAt).getTime()
  if (Number.isNaN(time)) return 0
  return Math.max(0, Math.round((Date.now() - time) / 60000))
}

const buildAdminOrders = (orders, kitchenDisplayItems, tables) => {
  const tableById = new Map(tables.map((table) => [table.id, table]))
  const kitchenByOrderId = kitchenDisplayItems.reduce((map, item) => {
    const list = map.get(item.orderId) ?? []
    list.push(item)
    map.set(item.orderId, list)
    return map
  }, new Map())

  return orders.map((order) => {
    const kitchenItems = kitchenByOrderId.get(order.id) ?? []
    const items = kitchenItems.length
      ? kitchenItems.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          name: item.itemName,
          quantity: item.quantity,
          station: stationByCategory(item.category),
          note: item.specialInstructions,
          status: mapKitchenStatus(item.status),
        }))
      : (order.items ?? []).map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          name: item.menuItemName,
          quantity: item.quantity,
          station: 'Theo đơn hàng',
          note: item.specialInstructions,
          status: item.status === 'SERVED' || item.status === 'READY' ? 'COMPLETED' : 'WAITING',
        }))

    const pendingItems = items.filter((item) => item.status !== 'COMPLETED').length
    const completedItems = items.filter((item) => item.status === 'COMPLETED').length
    const table = tableById.get(order.tableId)

    return {
      tableId: order.tableId,
      tableNumber: table?.tableNumber ?? order.tableName ?? 'N/A',
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderType: mapOrderTypeLabel(order.orderType),
      createdAt: order.createdAt,
      elapsedMinutes: elapsedMinutes(order.createdAt),
      status: pendingItems > 0 ? 'WAITING' : 'COMPLETED',
      pendingItems,
      completedItems,
      stations: [...new Set(items.map((item) => item.station))],
      items,
    }
  })
}

const mapMenuItem = (item) => ({
  ...item,
  sku: `MN-${item.id}`,
  station: stationByCategory(item.category),
  featured: false,
  sizeOptions: ['Mặc định'],
  lastUpdated: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
})

const buildAnalyticsReports = (revenue, orders, menuItems) => {
  const comparisons = revenue.comparisons ?? []
  const today = comparisons.find((item) => item.id === 'today')
  const week = comparisons.find((item) => item.id === 'week')
  const month = comparisons.find((item) => item.id === 'month')
  const bestSellingItems = [...orders.reduce((map, order) => {
    if (order.status !== 'COMPLETED') return map

    ;(order.items ?? []).forEach((orderItem) => {
      const menuItem = menuItems.find((item) => item.id === orderItem.menuItemId)
      const current = map.get(orderItem.menuItemId) ?? {
        id: orderItem.menuItemId,
        name: orderItem.menuItemName ?? menuItem?.name ?? 'Món chưa xác định',
        orders: 0,
        revenue: 0,
      }

      current.orders += Number(orderItem.quantity || 0)
      current.revenue += Number(orderItem.subtotal || 0)
      map.set(orderItem.menuItemId, current)
    })

    return map
  }, new Map()).values()]
    .sort((left, right) => right.orders - left.orders || right.revenue - left.revenue)
    .slice(0, 4)

  return {
    rangeOptions: ['Tuần', 'Tháng'],
    salesMetrics: [
      {
        id: 'today',
        label: 'Hôm nay so với hôm qua',
        value: formatCurrency(revenue.todayRevenue),
        change: percentLabel(today?.percentChange),
      },
      {
        id: 'week',
        label: 'Tuần này so với tuần trước',
        value: formatCurrency(revenue.thisWeekRevenue),
        change: percentLabel(week?.percentChange),
      },
      {
        id: 'month',
        label: 'Tháng này so với tháng trước',
        value: formatCurrency(revenue.thisMonthRevenue),
        change: percentLabel(month?.percentChange),
      },
    ],
    revenueTrend: (revenue.weeklyTrend ?? []).map((item) => ({
      day: item.label,
      current: Number(item.current || 0),
      previous: Number(item.previous || 0),
    })),
    monthlyRevenueTrend: (revenue.monthlyTrend ?? []).map((item) => ({
      day: item.label,
      current: Number(item.current || 0),
      previous: Number(item.previous || 0),
    })),
    revenueComparisons: comparisons,
    bestSellingItems,
    peakHours: [],
    operationalMetrics: [
      { id: 'orders', label: 'Đơn trong hệ thống', value: `${orders.length}`, note: 'Tổng số đơn backend trả về' },
      { id: 'menu', label: 'Món đang kinh doanh', value: `${menuItems.filter((item) => item.isAvailable).length}`, note: 'Dựa trên trạng thái menu' },
      { id: 'revenue', label: 'Doanh thu tháng này', value: formatCurrency(revenue.thisMonthRevenue), note: 'Tổng hóa đơn đã thanh toán' },
    ],
  }
}

const buildOverview = ({ stats, revenue, users, menuItems, tables, inventoryItems, adminOrders }) => ({
  summaryMetrics: [
    { id: 'revenue', label: 'Doanh thu hôm nay', value: formatCurrency(revenue.todayRevenue), note: `Hôm qua: ${formatCurrency(revenue.yesterdayRevenue)}` },
    { id: 'staff', label: 'Nhân sự hoạt động', value: `${users.filter((user) => user.isActive).length}`, note: 'Người dùng đang kích hoạt' },
    { id: 'availableTables', label: 'Bàn đang trống', value: `${stats.availableTables ?? tables.filter((table) => table.status === 'AVAILABLE').length}`, note: 'Có thể nhận khách ngay' },
    { id: 'waitingOrders', label: 'Đơn đang chờ', value: `${adminOrders.filter((order) => order.status === 'WAITING').length}`, note: 'Đơn còn món chưa hoàn tất' },
  ],
  alerts: [
    {
      id: 'inventory',
      title: 'Tồn kho cần theo dõi',
      description: `${inventoryItems.filter((item) => Number(item.quantity || 0) <= Number(item.threshold || 0)).length} nguyên liệu ở mức thấp hoặc đã hết.`,
      tone: 'warning',
    },
    {
      id: 'menu',
      title: 'Thực đơn đang kinh doanh',
      description: `${menuItems.filter((item) => item.isAvailable).length} món đang mở bán trên backend.`,
      tone: 'neutral',
    },
  ],
})

export const adminApi = {
  async getDashboard() {
    const [stats, revenue, users, menuItems, tables, inventoryItems, orders, kitchenDisplayItems] = await Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/revenue'),
      api.get('/users'),
      api.get('/menu-items'),
      api.get('/tables'),
      api.get('/inventory-items'),
      api.get('/orders'),
      api.get('/kitchen/display'),
    ])

    const mappedTables = tables.map(mapTable)
    const mappedMenuItems = menuItems.map(mapMenuItem)
    const adminOrders = buildAdminOrders(orders, kitchenDisplayItems, mappedTables)

    return {
      roleLabel: 'Quản trị hệ thống',
      sourceLabel: 'Dữ liệu thời gian thực từ backend',
      snapshotTime: `Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      footerNote: 'Admin dashboard đã đồng bộ với backend',
      searchPlaceholder: 'Tìm món ăn, bàn, nhân sự hoặc đơn hàng...',
      navigation: {
        sideItems: [
          { id: 'overview', label: 'Tổng quan' },
          { id: 'analytics', label: 'Phân tích' },
          { id: 'management', label: 'Quản trị tập trung' },
        ],
      },
      overview: buildOverview({ stats, revenue, users, menuItems, tables, inventoryItems, adminOrders }),
      analyticsReports: buildAnalyticsReports(revenue, orders, menuItems),
      centralizedManagement: {
        menuCategories: [...new Set(menuItems.map((item) => item.category))],
        menuItems: mappedMenuItems,
        staffRoles: ['ADMIN', 'MANAGER', 'SERVER', 'CHEF', 'CASHIER', 'HOST'],
        staffMembers: users,
        inventoryCategories: [...new Set(inventoryItems.map((item) => item.category))],
        inventoryItems,
        tableLocations: [...new Set(tables.map((table) => table.location).filter(Boolean))],
        tableStatusOptions: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'],
        tables: mappedTables,
        orders: adminOrders,
        pricingRules: [],
        promotions: [],
        roleAccess: users,
        auditLogs: [],
      },
    }
  },

  createMenuItem(payload) {
    return api.post('/menu-items', payload)
  },

  updateMenuItem(id, payload) {
    return api.put(`/menu-items/${id}`, payload)
  },

  deleteMenuItem(id) {
    return api.delete(`/menu-items/${id}`)
  },

  createUser(payload) {
    return api.post('/users', payload)
  },

  updateUser(id, payload) {
    return api.put(`/users/${id}`, payload)
  },

  deleteUser(id) {
    return api.delete(`/users/${id}`)
  },

  createInventoryItem(payload) {
    return api.post('/inventory-items', payload)
  },

  updateInventoryItem(id, payload) {
    return api.put(`/inventory-items/${id}`, payload)
  },

  deleteInventoryItem(id) {
    return api.delete(`/inventory-items/${id}`)
  },

  createTable(payload) {
    return api.post('/tables', payload)
  },

  updateTable(id, payload) {
    return api.put(`/tables/${id}`, payload)
  },

  deleteTable(id) {
    return api.delete(`/tables/${id}`)
  },
}
