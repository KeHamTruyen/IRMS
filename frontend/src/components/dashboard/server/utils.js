export const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

export const DRAFT_BATCH_STATUS = 'Đang chọn món'
export const SUBMITTED_BATCH_STATUS = 'Đã gửi bếp'

export const mapServiceStateLabel = (serviceState) => {
  switch (serviceState) {
    case 'AVAILABLE':
      return 'Trống'
    case 'RESERVED':
      return 'Đã đặt trước'
    case 'WAITING_FOOD':
      return 'Đang chờ món'
    case 'SERVED':
      return 'Đã lên món'
    case 'CLEANING':
      return 'Chờ dọn'
    default:
      return 'Không xác định'
  }
}

export const mapCategoryLabel = (category) => {
  switch (category) {
    case 'Appetizer':
      return 'Khai vị'
    case 'Main Course':
      return 'Món chính'
    case 'Dessert':
      return 'Tráng miệng'
    case 'Beverage':
      return 'Đồ uống'
    default:
      return category
  }
}

export const mapLocationLabel = (location) => {
  switch (location) {
    case 'Main Hall':
      return 'Sảnh chính'
    case 'Private Room':
      return 'Phòng riêng'
    case 'Terrace':
      return 'Khu sân vườn'
    default:
      return location
  }
}

export const mapPaymentMethodLabel = (code) => {
  switch (code) {
    case 'CASH':
      return 'Tiền mặt'
    case 'CREDIT_CARD':
      return 'Thẻ ngân hàng'
    case 'DEBIT_CARD':
      return 'Thẻ ghi nợ'
    case 'DIGITAL_WALLET':
      return 'Ví điện tử'
    case 'BANK_TRANSFER':
      return 'Chuyển khoản'
    default:
      return code
  }
}

export const mapBillStatusLabel = (status) => {
  switch (status) {
    case 'PAID':
      return 'Đã thanh toán'
    case 'PARTIALLY_PAID':
      return 'Thanh toán một phần'
    case 'CANCELLED':
      return 'Đã hủy'
    case 'REFUNDED':
      return 'Đã hoàn tiền'
    case 'PENDING':
    default:
      return 'Chờ thanh toán'
  }
}

export const mapOrderItemStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ bếp'
    case 'PREPARING':
      return 'Đang chế biến'
    case 'READY':
      return 'Sẵn sàng phục vụ'
    case 'SERVED':
      return 'Đã phục vụ'
    case 'CANCELLED':
      return 'Đã hủy'
    case 'DRAFT':
      return 'Món nháp'
    default:
      return status
  }
}

export const countTableMetrics = (tables) => ({
  activeTables: tables.length,
  emptyTables: tables.filter((table) => table.serviceState === 'AVAILABLE').length,
  reservedTables: tables.filter((table) => table.serviceState === 'RESERVED').length,
  cleaningTables: tables.filter((table) => table.serviceState === 'CLEANING').length,
})

export const toBackendTableState = (serviceState) => {
  switch (serviceState) {
    case 'AVAILABLE':
      return 'AVAILABLE'
    case 'RESERVED':
      return 'RESERVED'
    case 'WAITING_FOOD':
    case 'SERVED':
      return 'OCCUPIED'
    case 'CLEANING':
      return 'CLEANING'
    default:
      return 'AVAILABLE'
  }
}

export const getBatchTotal = (batch) =>
  (batch?.items ?? []).reduce((sum, item) => sum + Number(item.subtotal || 0), 0)

export const normalizeBatch = (batch) => ({
  ...batch,
  batchNote: batch.batchNote ?? '',
  batchTotal: getBatchTotal(batch),
})

export const deriveServiceState = (table, session) => {
  if (table.billingStatus === 'PAID' || session?.bill?.status === 'PAID') {
    return 'CLEANING'
  }

  if (!session?.batches?.length) {
    return table.status === 'RESERVED' || table.serviceState === 'RESERVED' ? 'RESERVED' : 'AVAILABLE'
  }

  const items = session.batches.flatMap((batch) => batch.items ?? [])

  if (!items.length) {
    return table.status === 'RESERVED' || table.serviceState === 'RESERVED' ? 'RESERVED' : 'AVAILABLE'
  }

  return items.some((item) => item.status === 'READY' || item.status === 'SERVED') ? 'SERVED' : 'WAITING_FOOD'
}
