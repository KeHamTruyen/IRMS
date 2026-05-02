import { api } from './api'

const FALLBACK_NAVIGATION = {
  sideItems: [
    { id: 'orders', label: 'Quản lý món' },
    { id: 'inventory', label: 'Quản lý kho' },
    { id: 'menu', label: 'Quản lý món ăn' },
  ],
}

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

const mapKitchenStatus = (status) => {
  switch (status) {
    case 'READY':
    case 'SERVED':
      return 'COMPLETED'
    case 'PENDING':
    case 'IN_PROGRESS':
    default:
      return 'WAITING'
  }
}

const mapTableServiceState = (hasPendingItems) => (hasPendingItems ? 'WAITING_FOOD' : 'SERVED')

const mapStationByCategory = (category) => {
  const normalized = String(category ?? '').trim().toLowerCase()

  if (normalized.includes('uống') || normalized.includes('drink') || normalized.includes('beverage')) {
    return 'Quầy lạnh'
  }

  if (normalized.includes('tráng miệng') || normalized.includes('dessert')) {
    return 'Tráng miệng'
  }

  if (normalized.includes('khai vị') || normalized.includes('salad') || normalized.includes('appetizer')) {
    return 'Ra món lạnh'
  }

  return 'Bếp nóng'
}

const getElapsedMinutes = (createdAt) => {
  if (!createdAt) return 0
  const diff = Date.now() - new Date(createdAt).getTime()
  if (Number.isNaN(diff)) return 0
  return Math.max(0, Math.round(diff / 60000))
}

const buildKitchenDisplay = ({ kitchenDisplayItems, orders, tables }) => {
  const orderById = new Map(orders.map((order) => [order.id, order]))
  const tableById = new Map(tables.map((table) => [table.id, table]))
  const groupedByOrderId = kitchenDisplayItems.reduce((accumulator, item) => {
    const bucket = accumulator.get(item.orderId) ?? []
    bucket.push(item)
    accumulator.set(item.orderId, bucket)
    return accumulator
  }, new Map())

  const ordersForKitchen = [...groupedByOrderId.entries()].map(([orderId, items]) => {
    const order = orderById.get(orderId)
    const table = tableById.get(order?.tableId)
    const elapsedMinutes = getElapsedMinutes(order?.createdAt)

    return {
      tableId: order?.tableId ?? -1,
      tableNumber: table?.tableNumber ?? 'N/A',
      orderId,
      orderNumber: order?.orderNumber ?? `ORD-${orderId}`,
      orderType: mapOrderTypeLabel(order?.orderType),
      elapsedMinutes,
      items: items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.itemName,
        quantity: item.quantity,
        station: mapStationByCategory(item.category),
        note: item.specialInstructions,
        status: mapKitchenStatus(item.status),
        backendStatus: item.status,
      })),
    }
  })

  const pendingCountByTableId = ordersForKitchen.reduce((accumulator, order) => {
    const pending = order.items.filter((item) => item.status !== 'COMPLETED').length
    accumulator.set(order.tableId, (accumulator.get(order.tableId) ?? 0) + pending)
    return accumulator
  }, new Map())

  const tablesForKitchen = tables
    .filter((table) => pendingCountByTableId.has(table.id))
    .map((table) => {
      const relatedOrders = ordersForKitchen.filter((order) => order.tableId === table.id)
      const oldestElapsedMinutes = relatedOrders.reduce(
        (max, order) => Math.max(max, order.elapsedMinutes),
        0
      )
      const guests = relatedOrders.reduce(
        (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0),
        0
      )
      const hasPendingItems = (pendingCountByTableId.get(table.id) ?? 0) > 0

      return {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        serviceState: mapTableServiceState(hasPendingItems),
        location: table.location,
        currentGuests: guests || table.capacity,
        elapsedMinutes: oldestElapsedMinutes,
      }
    })
    .sort((left, right) => right.elapsedMinutes - left.elapsedMinutes)

  return {
    stationName: 'Bếp chính',
    tables: tablesForKitchen,
    orders: ordersForKitchen.sort((left, right) => right.elapsedMinutes - left.elapsedMinutes),
  }
}

const buildKitchenHistory = ({ kitchenOrders, orders, tables, menuItems }) => {
  const orderById = new Map(orders.map((order) => [order.id, order]))
  const tableById = new Map(tables.map((table) => [table.id, table]))
  const menuById = new Map(menuItems.map((item) => [item.id, item]))

  return kitchenOrders
    .filter((item) => item.status === 'READY' || item.status === 'SERVED')
    .map((item) => {
      const order = orderById.get(item.orderId)
      const table = tableById.get(order?.tableId)
      const menuItem = menuById.get(item.menuItemId)

      return {
        id: item.id,
        orderId: item.orderId,
        orderNumber: order?.orderNumber ?? `ORD-${item.orderId}`,
        tableId: order?.tableId ?? -1,
        tableNumber: table?.tableNumber ?? 'N/A',
        itemName: item.itemName,
        quantity: item.quantity,
        station: mapStationByCategory(menuItem?.category),
        status: item.status,
        statusLabel: item.status === 'SERVED' ? 'Đã phục vụ' : 'Đã hoàn thành',
        completedAt: item.completedAt,
        receivedAt: item.receivedAt,
      }
    })
    .sort((left, right) =>
      new Date(right.completedAt ?? right.receivedAt ?? 0) - new Date(left.completedAt ?? left.receivedAt ?? 0)
    )
}

const buildMenuManagement = (menuItems) => {
  const categories = ['Tất cả', ...new Set(menuItems.map((item) => item.category))]

  return {
    categories,
    items: menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      station: mapStationByCategory(item.category),
      preparationTime: item.preparationTime ?? 0,
      isAvailable: item.isAvailable,
    })),
  }
}

const buildInventoryManagement = (inventoryItems) => {
  const categories = ['Tất cả', ...new Set(inventoryItems.map((item) => item.category))]

  return {
    categories,
    items: inventoryItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      threshold: item.threshold,
      status: item.status,
    })),
  }
}

export const chefApi = {
  async getDashboard() {
    const [kitchenDisplayResult, kitchenOrdersResult, ordersResult, tablesResult, menuItemsResult, inventoryItemsResult] =
      await Promise.allSettled([
        api.get('/kitchen/display'),
        api.get('/kitchen/orders'),
        api.get('/orders'),
        api.get('/tables'),
        api.get('/menu-items'),
        api.get('/inventory-items'),
      ])

    const kitchenDisplayItems =
      kitchenDisplayResult.status === 'fulfilled' ? kitchenDisplayResult.value : []
    const kitchenOrders = kitchenOrdersResult.status === 'fulfilled' ? kitchenOrdersResult.value : []
    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : []
    const tables = tablesResult.status === 'fulfilled' ? tablesResult.value : []
    const menuItems = menuItemsResult.status === 'fulfilled' ? menuItemsResult.value : []
    const inventoryItems = inventoryItemsResult.status === 'fulfilled' ? inventoryItemsResult.value : []
    const successfulRequests = [
      kitchenDisplayResult,
      kitchenOrdersResult,
      ordersResult,
      tablesResult,
      menuItemsResult,
      inventoryItemsResult,
    ].filter((result) => result.status === 'fulfilled').length

    return {
      roleLabel: 'Bếp',
      sourceLabel:
          successfulRequests === 6
          ? 'Dữ liệu thời gian thực từ backend'
          : 'Dữ liệu backend (một phần đang tạm gián đoạn)',
      snapshotTime: `Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      footerNote:
        successfulRequests === 6
          ? 'Đồng bộ từ bếp, menu và kho nguyên liệu'
          : 'Một số dịch vụ backend chưa phản hồi, dữ liệu đang hiển thị phần khả dụng',
      navigation: FALLBACK_NAVIGATION,
      kitchenDisplay: {
        ...buildKitchenDisplay({ kitchenDisplayItems, orders, tables }),
        history: buildKitchenHistory({ kitchenOrders, orders, tables, menuItems }),
      },
      menuManagement: buildMenuManagement(menuItems),
      inventoryManagement: buildInventoryManagement(inventoryItems),
    }
  },

  async completeKitchenItem(itemId, currentStatus) {
    if (currentStatus === 'PENDING') {
      await api.patch(`/kitchen/order-items/${itemId}/start`)
    }
    return api.patch(`/kitchen/order-items/${itemId}/ready`)
  },

  async updateMenuAvailability(itemId, isAvailable) {
    return api.patch(`/menu-items/${itemId}/availability?available=${isAvailable}`)
  },

  async updateInventoryQuantity(itemId, quantity) {
    return api.patch(`/inventory-items/${itemId}/quantity`, { quantity })
  },

  async updateInventoryStatus(itemId, status) {
    return api.patch(`/inventory-items/${itemId}/status`, { status })
  },
}
