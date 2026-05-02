import { api } from './api'

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const percentLabel = (value) => `${Number(value || 0) >= 0 ? '+' : ''}${Number(value || 0).toFixed(1)}%`

const buildBestSellingItems = (orders, menuItems) =>
  [...orders.reduce((map, order) => {
    if (order.status !== 'COMPLETED') return map

    ;(order.items ?? []).forEach((item) => {
      const menuItem = menuItems.find((row) => row.id === item.menuItemId)
      const current = map.get(item.menuItemId) ?? {
        id: item.menuItemId,
        name: item.menuItemName ?? menuItem?.name ?? 'Món chưa xác định',
        quantity: 0,
        revenue: 0,
      }
      current.quantity += Number(item.quantity || 0)
      current.revenue += Number(item.subtotal || 0)
      map.set(item.menuItemId, current)
    })

    return map
  }, new Map()).values()]
    .sort((left, right) => right.quantity - left.quantity || right.revenue - left.revenue)
    .slice(0, 6)

export const managerApi = {
  async getDashboard() {
    const [stats, revenue, orders, menuItems, inventoryItems, tables] = await Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/revenue'),
      api.get('/orders'),
      api.get('/menu-items'),
      api.get('/inventory-items'),
      api.get('/tables'),
    ])

    const comparisons = revenue.comparisons ?? []
    const today = comparisons.find((item) => item.id === 'today')
    const week = comparisons.find((item) => item.id === 'week')
    const month = comparisons.find((item) => item.id === 'month')

    return {
      roleLabel: 'Quản lý',
      sourceLabel: 'Dữ liệu thời gian thực từ backend',
      snapshotTime: `Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      stats,
      metrics: [
        { id: 'today', label: 'Doanh thu hôm nay', value: formatCurrency(revenue.todayRevenue), change: percentLabel(today?.percentChange), note: `Hôm qua: ${formatCurrency(revenue.yesterdayRevenue)}` },
        { id: 'week', label: 'Doanh thu tuần này', value: formatCurrency(revenue.thisWeekRevenue), change: percentLabel(week?.percentChange), note: `Tuần trước: ${formatCurrency(revenue.lastWeekRevenue)}` },
        { id: 'month', label: 'Doanh thu tháng này', value: formatCurrency(revenue.thisMonthRevenue), change: percentLabel(month?.percentChange), note: `Tháng trước: ${formatCurrency(revenue.lastMonthRevenue)}` },
        { id: 'orders', label: 'Đơn đang hoạt động', value: `${stats.activeOrders ?? 0}`, change: `${stats.completedOrders ?? 0} hoàn tất`, note: `${orders.length} đơn trong hệ thống` },
      ],
      weeklyTrend: (revenue.weeklyTrend ?? []).map((item) => ({
        label: item.label,
        current: Number(item.current || 0),
        previous: Number(item.previous || 0),
      })),
      comparisons,
      bestSellingItems: buildBestSellingItems(orders, menuItems),
      lowStockItems: inventoryItems.filter((item) => Number(item.quantity || 0) <= Number(item.threshold || 0)),
      tables,
      orders,
    }
  },
}
