import { useMemo, useState } from 'react'
import AdminHeader from './AdminHeader'
import AdminOverviewPage from './AdminOverviewPage'
import AdminSidebar from './AdminSidebar'
import AnalyticsReportsPage from './AnalyticsReportsPage'
import CentralManagementPage from './CentralManagementPage'
import { createEmptyMenuForm, normalizeSizeOptions } from './utils'
import { adminApi } from '../../../services/adminApi'

const toFormState = (item) => ({
  name: item.name ?? '',
  category: item.category ?? 'Món chính',
  price: String(item.price ?? ''),
  preparationTime: String(item.preparationTime ?? ''),
  description: item.description ?? '',
  imageUrl: item.imageUrl ?? '',
  station: item.station ?? '',
  isAvailable: Boolean(item.isAvailable),
  sizeOptions: (item.sizeOptions ?? []).join(', '),
})

const createEmptyStaffForm = (roles = []) => ({
  fullName: '',
  username: '',
  email: '',
  phone: '',
  role: roles[0] ?? 'SERVER',
  authMethod: 'PIN',
  isActive: true,
})

const toStaffFormState = (staff, roles = []) => ({
  fullName: staff.fullName ?? '',
  username: staff.username ?? '',
  email: staff.email ?? '',
  phone: staff.phone ?? '',
  role: staff.role ?? roles[0] ?? 'SERVER',
  authMethod: staff.authMethod ?? 'PIN',
  isActive: Boolean(staff.isActive),
})

const createEmptyInventoryForm = (categories = []) => ({
  name: '',
  category: categories[0] ?? 'Rau củ',
  unit: 'g',
  quantity: '',
  threshold: '',
  status: 'IN_STOCK',
})

const toInventoryFormState = (item, categories = []) => ({
  name: item.name ?? '',
  category: item.category ?? categories[0] ?? 'Rau củ',
  unit: item.unit ?? 'g',
  quantity: String(item.quantity ?? ''),
  threshold: String(item.threshold ?? ''),
  status: item.status ?? 'IN_STOCK',
})

const createEmptyTableForm = (locations = []) => ({
  tableNumber: '',
  capacity: '4',
  location: locations[0] ?? 'Sảnh chính',
  serviceState: 'AVAILABLE',
  currentGuests: '0',
  reservationName: '',
})

const toTableFormState = (table, locations = []) => ({
  tableNumber: table.tableNumber ?? '',
  capacity: String(table.capacity ?? 4),
  location: table.location ?? locations[0] ?? 'Sảnh chính',
  serviceState: table.serviceState ?? 'AVAILABLE',
  currentGuests: String(table.currentGuests ?? 0),
  reservationName: table.reservationName ?? '',
})

function AdminDashboard({ session, dashboard, onSignOut }) {
  const [activeSection, setActiveSection] = useState(dashboard.navigation.sideItems[0]?.id ?? 'overview')
  const [menuItems, setMenuItems] = useState(dashboard.centralizedManagement.menuItems ?? [])
  const [menuCategory, setMenuCategory] = useState('Tất cả')
  const [editingMenuItemId, setEditingMenuItemId] = useState(null)
  const [menuForm, setMenuForm] = useState(() =>
    createEmptyMenuForm(dashboard.centralizedManagement.menuCategories)
  )
  const [staffMembers, setStaffMembers] = useState(dashboard.centralizedManagement.staffMembers ?? [])
  const [staffRoleFilter, setStaffRoleFilter] = useState('Tất cả')
  const [editingStaffId, setEditingStaffId] = useState(null)
  const [staffForm, setStaffForm] = useState(() =>
    createEmptyStaffForm(dashboard.centralizedManagement.staffRoles)
  )
  const [inventoryItems, setInventoryItems] = useState(
    dashboard.centralizedManagement.inventoryItems ?? []
  )
  const [inventoryCategory, setInventoryCategory] = useState('Tất cả')
  const [editingInventoryId, setEditingInventoryId] = useState(null)
  const [inventoryForm, setInventoryForm] = useState(() =>
    createEmptyInventoryForm(dashboard.centralizedManagement.inventoryCategories)
  )
  const [tables, setTables] = useState(dashboard.centralizedManagement.tables ?? [])
  const [tableStatusFilter, setTableStatusFilter] = useState('Tất cả')
  const [editingTableId, setEditingTableId] = useState(null)
  const [tableForm, setTableForm] = useState(() =>
    createEmptyTableForm(dashboard.centralizedManagement.tableLocations)
  )
  const [orderStatusFilter, setOrderStatusFilter] = useState('Tất cả')

  const menuFormMode = editingMenuItemId ? 'edit' : 'create'
  const staffFormMode = editingStaffId ? 'edit' : 'create'
  const inventoryFormMode = editingInventoryId ? 'edit' : 'create'
  const tableFormMode = editingTableId ? 'edit' : 'create'

  const management = useMemo(() => {
    const orders = (dashboard.centralizedManagement.orders ?? []).map((order) => {
      const table = tables.find((item) => item.id === order.tableId)

      return {
        ...order,
        tableNumber: table?.tableNumber ?? order.tableNumber,
      }
    })

    return {
      ...dashboard.centralizedManagement,
      menuItems,
      staffMembers,
      inventoryItems,
      tables,
      orders,
    }
  }, [dashboard.centralizedManagement, inventoryItems, menuItems, staffMembers, tables])

  const overview = useMemo(() => {
    const waitingOrders = management.orders.filter((order) => order.status === 'WAITING').length
    const availableTables = management.tables.filter((table) => table.serviceState === 'AVAILABLE').length

    return {
      ...dashboard.overview,
      summaryMetrics: (dashboard.overview.summaryMetrics ?? []).map((metric) => {
        if (metric.id === 'availableTables') {
          return {
            ...metric,
            value: `${availableTables}`,
            note: `${management.tables.filter((table) => table.serviceState === 'RESERVED').length} bàn đặt trước, ${management.tables.filter((table) => table.serviceState === 'CLEANING').length} bàn cần dọn`,
          }
        }

        if (metric.id === 'waitingOrders') {
          const pendingItems = management.orders.reduce((sum, order) => sum + Number(order.pendingItems || 0), 0)

          return {
            ...metric,
            value: `${waitingOrders}`,
            note: `${pendingItems} món chờ hoàn tất từ luồng chef`,
          }
        }

        return metric
      }),
      alerts: (dashboard.overview.alerts ?? []).map((alert) => {
        if (alert.id === 'kitchen') {
          return {
            ...alert,
            description: `${waitingOrders} đơn đang cần theo dõi từ phía bếp.`,
          }
        }

        return alert
      }),
    }
  }, [dashboard.overview, management.orders, management.tables])

  const handleFormChange = (field, value) => {
    setMenuForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setEditingMenuItemId(null)
    setMenuForm(createEmptyMenuForm(dashboard.centralizedManagement.menuCategories))
  }

  const handleSubmitMenu = async (event) => {
    event.preventDefault()

    const payload = {
      name: menuForm.name.trim(),
      category: menuForm.category,
      price: Number(menuForm.price || 0),
      description: menuForm.description.trim(),
      isAvailable: menuForm.isAvailable,
      preparationTime: Number(menuForm.preparationTime || 0),
      imageUrl: menuForm.imageUrl.trim(),
    }

    if (!payload.name) return

    const saved = editingMenuItemId
      ? await adminApi.updateMenuItem(editingMenuItemId, payload)
      : await adminApi.createMenuItem(payload)

    const nextItem = {
      ...saved,
      sku: `MN-${saved.id}`,
      sizeOptions: normalizeSizeOptions(menuForm.sizeOptions || 'Mặc định'),
      station: menuForm.station.trim() || 'Chưa gán quầy',
      featured: false,
      lastUpdated: saved.updatedAt ?? new Date().toISOString(),
    }

    setMenuItems((current) => {
      if (editingMenuItemId) {
        return current.map((item) =>
          item.id === editingMenuItemId ? { ...item, ...nextItem } : item
        )
      }

      return [nextItem, ...current]
    })

    resetForm()
  }

  const handleStartEdit = (item) => {
    setEditingMenuItemId(item.id)
    setMenuForm(toFormState(item))
  }

  const handleDeleteItem = async (itemId) => {
    await adminApi.deleteMenuItem(itemId)
    setMenuItems((current) => current.filter((item) => item.id !== itemId))

    if (editingMenuItemId === itemId) {
      resetForm()
    }
  }

  const handleStaffFormChange = (field, value) => {
    setStaffForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetStaffForm = () => {
    setEditingStaffId(null)
    setStaffForm(createEmptyStaffForm(dashboard.centralizedManagement.staffRoles))
  }

  const handleSubmitStaff = async (event) => {
    event.preventDefault()

    const nextStaff = {
      id: editingStaffId ?? Date.now(),
      fullName: staffForm.fullName.trim(),
      username: staffForm.username.trim(),
      email: staffForm.email.trim(),
      phone: staffForm.phone.trim(),
      role: staffForm.role,
      authMethod: staffForm.authMethod,
      isActive: staffForm.isActive,
    }

    if (!nextStaff.fullName || !nextStaff.username) return

    const payload = {
      ...nextStaff,
      password: nextStaff.authMethod === 'PASSWORD' ? 'password123' : undefined,
      pin: nextStaff.authMethod === 'PIN' ? '1234' : undefined,
    }

    const saved = editingStaffId
      ? await adminApi.updateUser(editingStaffId, payload)
      : await adminApi.createUser(payload)

    setStaffMembers((current) => {
      if (editingStaffId) {
        return current.map((staff) => (staff.id === editingStaffId ? { ...staff, ...saved } : staff))
      }

      return [saved, ...current]
    })

    resetStaffForm()
  }

  const handleStartEditStaff = (staff) => {
    setEditingStaffId(staff.id)
    setStaffForm(toStaffFormState(staff, dashboard.centralizedManagement.staffRoles))
  }

  const handleDeleteStaff = async (staffId) => {
    await adminApi.deleteUser(staffId)
    setStaffMembers((current) => current.filter((staff) => staff.id !== staffId))

    if (editingStaffId === staffId) {
      resetStaffForm()
    }
  }

  const handleInventoryFormChange = (field, value) => {
    setInventoryForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetInventoryForm = () => {
    setEditingInventoryId(null)
    setInventoryForm(createEmptyInventoryForm(dashboard.centralizedManagement.inventoryCategories))
  }

  const handleSubmitInventory = async (event) => {
    event.preventDefault()

    const quantity = Math.max(0, Number(inventoryForm.quantity || 0))
    const threshold = Math.max(0, Number(inventoryForm.threshold || 0))
    const status = quantity <= 0 ? 'OUT_OF_STOCK' : inventoryForm.status

    const payload = {
      name: inventoryForm.name.trim(),
      category: inventoryForm.category,
      unit: inventoryForm.unit.trim() || 'g',
      quantity,
      threshold,
      status,
    }

    if (!payload.name) return

    const saved = editingInventoryId
      ? await adminApi.updateInventoryItem(editingInventoryId, payload)
      : await adminApi.createInventoryItem(payload)

    setInventoryItems((current) => {
      if (editingInventoryId) {
        return current.map((item) =>
          item.id === editingInventoryId ? { ...item, ...saved } : item
        )
      }

      return [saved, ...current]
    })

    resetInventoryForm()
  }

  const handleStartEditInventory = (item) => {
    setEditingInventoryId(item.id)
    setInventoryForm(toInventoryFormState(item, dashboard.centralizedManagement.inventoryCategories))
  }

  const handleDeleteInventory = async (itemId) => {
    await adminApi.deleteInventoryItem(itemId)
    setInventoryItems((current) => current.filter((item) => item.id !== itemId))

    if (editingInventoryId === itemId) {
      resetInventoryForm()
    }
  }

  const handleTableFormChange = (field, value) => {
    setTableForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetTableForm = () => {
    setEditingTableId(null)
    setTableForm(createEmptyTableForm(dashboard.centralizedManagement.tableLocations))
  }

  const handleSubmitTable = async (event) => {
    event.preventDefault()

    const serviceState = tableForm.serviceState
    const currentGuests = Math.max(0, Number(tableForm.currentGuests || 0))
    const status = serviceState === 'WAITING_FOOD' || serviceState === 'SERVED' ? 'OCCUPIED' : serviceState
    const payload = {
      tableNumber: tableForm.tableNumber.trim(),
      capacity: Math.max(1, Number(tableForm.capacity || 1)),
      location: tableForm.location,
      status: status === 'CLEANING' ? 'CLEANING' : status,
    }

    if (!payload.tableNumber) return

    const saved = editingTableId
      ? await adminApi.updateTable(editingTableId, payload)
      : await adminApi.createTable(payload)

    const nextTable = {
      ...saved,
      serviceState: saved.status,
      currentGuests: saved.status === 'OCCUPIED' ? currentGuests || saved.capacity : 0,
      reservationName: tableForm.reservationName.trim() || null,
      elapsedMinutes: saved.status === 'OCCUPIED' ? 5 : 0,
      activeOrderId: saved.status === 'OCCUPIED' ? tables.find((item) => item.id === editingTableId)?.activeOrderId ?? null : null,
      billingStatus: saved.status === 'OCCUPIED' ? 'PENDING' : saved.status === 'CLEANING' ? 'PAID' : null,
    }

    setTables((current) => {
      if (editingTableId) {
        return current.map((table) => (table.id === editingTableId ? { ...table, ...nextTable } : table))
      }

      return [nextTable, ...current]
    })

    resetTableForm()
  }

  const handleStartEditTable = (table) => {
    setEditingTableId(table.id)
    setTableForm(toTableFormState(table, dashboard.centralizedManagement.tableLocations))
  }

  const handleDeleteTable = async (tableId) => {
    await adminApi.deleteTable(tableId)
    setTables((current) => current.filter((table) => table.id !== tableId))

    if (editingTableId === tableId) {
      resetTableForm()
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto grid min-h-screen max-w-7xl content-start overflow-hidden border border-[#d8e0e7] bg-white md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="md:col-span-2">
          <AdminHeader session={session} placeholder={dashboard.searchPlaceholder} />
        </div>

        <AdminSidebar
          items={dashboard.navigation.sideItems}
          activeSection={activeSection}
          onChangeSection={setActiveSection}
          onSignOut={onSignOut}
        />

        <section className="min-w-0 space-y-5 bg-[#f8fafc] p-4 md:p-5 lg:p-6">
          {activeSection === 'overview' ? <AdminOverviewPage overview={overview} /> : null}
          {activeSection === 'analytics' ? (
            <AnalyticsReportsPage analyticsReports={dashboard.analyticsReports} />
          ) : null}
          {activeSection === 'management' ? (
            <CentralManagementPage
              management={management}
              menuItems={menuItems}
              menuCategory={menuCategory}
              onChangeMenuCategory={setMenuCategory}
              menuForm={menuForm}
              menuFormMode={menuFormMode}
              onMenuFormChange={handleFormChange}
              onSubmitMenuForm={handleSubmitMenu}
              onStartEditMenu={handleStartEdit}
              onDeleteMenuItem={handleDeleteItem}
              onCancelMenuEdit={resetForm}
              staffRoleFilter={staffRoleFilter}
              onChangeStaffRoleFilter={setStaffRoleFilter}
              staffForm={staffForm}
              staffFormMode={staffFormMode}
              onStaffFormChange={handleStaffFormChange}
              onSubmitStaffForm={handleSubmitStaff}
              onStartEditStaff={handleStartEditStaff}
              onDeleteStaff={handleDeleteStaff}
              onCancelStaffEdit={resetStaffForm}
              inventoryCategory={inventoryCategory}
              onChangeInventoryCategory={setInventoryCategory}
              inventoryForm={inventoryForm}
              inventoryFormMode={inventoryFormMode}
              onInventoryFormChange={handleInventoryFormChange}
              onSubmitInventoryForm={handleSubmitInventory}
              onStartEditInventory={handleStartEditInventory}
              onDeleteInventoryItem={handleDeleteInventory}
              onCancelInventoryEdit={resetInventoryForm}
              tableStatusFilter={tableStatusFilter}
              onChangeTableStatusFilter={setTableStatusFilter}
              tableForm={tableForm}
              tableFormMode={tableFormMode}
              onTableFormChange={handleTableFormChange}
              onSubmitTableForm={handleSubmitTable}
              onStartEditTable={handleStartEditTable}
              onDeleteTable={handleDeleteTable}
              onCancelTableEdit={resetTableForm}
              orderStatusFilter={orderStatusFilter}
              onChangeOrderStatusFilter={setOrderStatusFilter}
            />
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default AdminDashboard
