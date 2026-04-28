import { api } from './api'

const PAYMENT_METHODS = [
  { code: 'CASH', label: 'Tiền mặt', hint: 'Thu tiền trực tiếp tại bàn.' },
  { code: 'CREDIT_CARD', label: 'Thẻ ngân hàng', hint: 'Xử lý qua cổng thanh toán thẻ.' },
  { code: 'DIGITAL_WALLET', label: 'Ví điện tử', hint: 'Momo, ZaloPay, VNPay hoặc ví tương tự.' },
  { code: 'BANK_TRANSFER', label: 'Chuyển khoản', hint: 'Đối chiếu giao dịch ngân hàng.' },
]

const NAVIGATION = {
  sideItems: [
    { id: 'tables', label: 'Quản lý bàn' },
    { id: 'menu', label: 'Thực đơn' },
  ],
}

const mapTable = (table, activeOrderByTableId, billByOrderId) => {
  const order = activeOrderByTableId.get(table.id)
  const bill = order ? billByOrderId.get(order.id) : null
  const serviceState = table.status === 'OCCUPIED' ? 'WAITING_FOOD' : table.status

  return {
    ...table,
    serviceState,
    currentGuests: table.status === 'OCCUPIED' ? table.capacity : 0,
    activeOrderId: order?.id ?? null,
    billingStatus: bill?.status ?? null,
    reservationName: null,
    elapsedMinutes: 0,
  }
}

const buildActiveOrderByTableId = (orders) => {
  const activeOrders = (orders ?? [])
    .filter((order) => order.tableId && order.status !== 'COMPLETED' && order.status !== 'CANCELLED')
    .sort((left, right) => new Date(right.updatedAt ?? right.createdAt) - new Date(left.updatedAt ?? left.createdAt))

  return activeOrders.reduce((map, order) => {
    if (!map.has(order.tableId)) map.set(order.tableId, order)
    return map
  }, new Map())
}

export const serverApi = {
  async getDashboard() {
    const [tablesResult, menuItemsResult, ordersResult, billsResult] = await Promise.allSettled([
      api.get('/tables'),
      api.get('/menu-items'),
      api.get('/orders'),
      api.get('/bills'),
    ])

    const tables = tablesResult.status === 'fulfilled' ? tablesResult.value : []
    const menuItems = menuItemsResult.status === 'fulfilled' ? menuItemsResult.value : []
    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : []
    const bills = billsResult.status === 'fulfilled' ? billsResult.value : []
    const successfulRequests = [tablesResult, menuItemsResult, ordersResult, billsResult].filter(
      (result) => result.status === 'fulfilled'
    ).length

    const activeOrderByTableId = buildActiveOrderByTableId(orders)
    const billByOrderId = new Map((bills ?? []).map((bill) => [bill.orderId, bill]))
    const mappedTables = (tables ?? []).map((table) => mapTable(table, activeOrderByTableId, billByOrderId))

    return {
      roleLabel: 'Phục vụ',
      sourceLabel:
        successfulRequests === 4
          ? 'Dữ liệu thời gian thực từ backend'
          : 'Dữ liệu backend (một phần đang tạm gián đoạn)',
      snapshotTime: `Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      footerNote:
        successfulRequests === 4
          ? 'Đồng bộ từ bàn, thực đơn, đơn hàng và hóa đơn'
          : 'Một số dịch vụ backend chưa phản hồi, dashboard đang hiển thị phần khả dụng',
      navigation: NAVIGATION,
      tableManagement: {
        tables: mappedTables,
      },
      serviceConsole: {
        paymentMethods: PAYMENT_METHODS,
        activeOrderCount: activeOrderByTableId.size,
        availableMenuItemCount: (menuItems ?? []).filter((item) => item.isAvailable).length,
      },
    }
  },
}
