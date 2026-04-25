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

export const mapPaymentMethodLabel = (code) => {
  switch (code) {
    case 'CASH':
      return 'Tiền mặt'
    case 'CREDIT_CARD':
      return 'Thẻ ngân hàng'
    case 'DIGITAL_WALLET':
      return 'Ví điện tử'
    default:
      return code
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
