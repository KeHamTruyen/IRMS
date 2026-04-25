export const formatQuantity = (value) =>
  new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

export const mapKitchenItemStatusLabel = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'Đã hoàn thành'
    case 'WAITING':
    default:
      return 'Đang chờ'
  }
}

export const mapInventoryStatusLabel = (status) => {
  switch (status) {
    case 'OUT_OF_STOCK':
      return 'Đã hết'
    case 'RESTOCKING':
      return 'Cần nhập'
    case 'IN_STOCK':
    default:
      return 'Đang dùng'
  }
}

export const mapMenuAvailabilityLabel = (isAvailable) =>
  isAvailable ? 'Đang phục vụ' : 'Tạm hết'

export const getPendingItemCount = (orders) =>
  orders.reduce(
    (sum, order) => sum + order.items.filter((item) => item.status !== 'COMPLETED').length,
    0
  )

export const getCompletedItemCount = (orders) =>
  orders.reduce(
    (sum, order) => sum + order.items.filter((item) => item.status === 'COMPLETED').length,
    0
  )
