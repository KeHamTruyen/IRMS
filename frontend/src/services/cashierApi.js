import { api } from './api'

const mapOrderType = (type) => {
  if (type === 'TAKEAWAY') return 'Mang về'
  if (type === 'DELIVERY') return 'Giao hàng'
  return 'Tại bàn'
}

const normalizeBill = (bill, order, table) => ({
  ...bill,
  order,
  table,
  orderTypeLabel: mapOrderType(order?.orderType),
  subtotal: Number(bill.subtotal || 0),
  tax: Number(bill.tax || 0),
  discount: Number(bill.discount || 0),
  serviceCharge: Number(bill.serviceCharge || 0),
  tipAmount: Number(bill.tipAmount || 0),
  totalAmount: Number(bill.totalAmount || 0),
  amountPaid: Number(bill.amountPaid || 0),
  remainingDue: Number(bill.remainingDue || 0),
  payments: (bill.payments ?? []).map((payment) => ({
    ...payment,
    amount: Number(payment.amount || 0),
  })),
})

export const cashierApi = {
  async getDashboard() {
    const [bills, orders, tables] = await Promise.all([
      api.get('/bills'),
      api.get('/orders'),
      api.get('/tables'),
    ])

    const orderById = new Map((orders ?? []).map((order) => [order.id, order]))
    const tableById = new Map((tables ?? []).map((table) => [table.id, table]))
    const normalizedBills = (bills ?? []).map((bill) => {
      const order = orderById.get(bill.orderId)
      return normalizeBill(bill, order, tableById.get(order?.tableId))
    })

    return {
      roleLabel: 'Thu ngân',
      sourceLabel: 'Dữ liệu hóa đơn từ backend',
      snapshotTime: `Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      bills: normalizedBills.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
      orders,
      tables,
    }
  },

  createBill(orderId, discount = 0) {
    return api.post(`/bills/order/${orderId}`, { orderId, discount })
  },

  processPayment(billId, payload) {
    return api.post(`/bills/${billId}/payments`, payload)
  },
}
