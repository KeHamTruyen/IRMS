import { useEffect, useMemo, useState } from 'react'
import ChefHeader from './ChefHeader'
import ChefSidebar from './ChefSidebar'
import InventoryManagementView from './InventoryManagementView'
import KitchenOrdersView from './KitchenOrdersView'
import MenuStatusView from './MenuStatusView'
import { chefApi } from '../../../services/chefApi'

function ChefDashboard({ dashboard, onSignOut }) {
  const [activeSection, setActiveSection] = useState(dashboard.navigation.sideItems[0]?.id ?? 'orders')
  const [kitchenDisplay, setKitchenDisplay] = useState(dashboard.kitchenDisplay)
  const [inventoryManagement, setInventoryManagement] = useState(dashboard.inventoryManagement)
  const [menuManagement, setMenuManagement] = useState(dashboard.menuManagement)
  const [selectedTableId, setSelectedTableId] = useState(dashboard.kitchenDisplay.tables[0]?.id ?? null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    setActiveSection(dashboard.navigation.sideItems[0]?.id ?? 'orders')
    setKitchenDisplay(dashboard.kitchenDisplay)
    setInventoryManagement(dashboard.inventoryManagement)
    setMenuManagement(dashboard.menuManagement)
    setSelectedTableId(dashboard.kitchenDisplay.tables[0]?.id ?? null)
    setActionError('')
  }, [dashboard])

  const waitingTables = useMemo(
    () =>
      kitchenDisplay.tables.filter((table) =>
        kitchenDisplay.orders.some(
          (order) =>
            order.tableId === table.id &&
            order.items.some((item) => item.status !== 'COMPLETED')
        )
      ),
    [kitchenDisplay.orders, kitchenDisplay.tables]
  )

  const selectedWaitingTableId = useMemo(() => {
    if (!waitingTables.length) return null

    return waitingTables.some((table) => table.id === selectedTableId)
      ? selectedTableId
      : waitingTables[0].id
  }, [selectedTableId, waitingTables])

  const visibleKitchenDisplay = useMemo(
    () => ({
      ...kitchenDisplay,
      tables: waitingTables,
      orders: kitchenDisplay.orders.filter((order) =>
        order.items.some((item) => item.status !== 'COMPLETED')
      ),
    }),
    [kitchenDisplay, waitingTables]
  )

  const handleCompleteItem = async (tableId, itemId) => {
    const targetOrder = kitchenDisplay.orders.find((order) =>
      order.items.some((item) => item.id === itemId)
    )
    const targetItem = targetOrder?.items.find((item) => item.id === itemId)
    if (!targetItem) return

    try {
      setActionError('')
      await chefApi.completeKitchenItem(itemId, targetItem.backendStatus)
      setKitchenDisplay((current) => ({
        ...current,
        orders: current.orders.map((order) =>
          order.tableId === tableId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.id === itemId
                    ? { ...item, status: 'COMPLETED', backendStatus: 'READY' }
                    : item
                ),
              }
            : order
        ),
      }))
    } catch (error) {
      setActionError(error.message ?? 'Không thể cập nhật trạng thái món.')
    }
  }

  const handleChangeInventoryQuantity = async (itemId, quantity) => {
    try {
      setActionError('')
      const updated = await chefApi.updateInventoryQuantity(itemId, quantity)
      setInventoryManagement((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: updated.quantity,
                status: updated.status,
              }
            : item
        ),
      }))
    } catch (error) {
      setActionError(error.message ?? 'Không thể cập nhật tồn kho.')
    }
  }

  const handleChangeInventoryStatus = async (itemId, status) => {
    try {
      setActionError('')
      const updated = await chefApi.updateInventoryStatus(itemId, status)
      setInventoryManagement((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: updated.quantity,
                status: updated.status,
              }
            : item
        ),
      }))
    } catch (error) {
      setActionError(error.message ?? 'Không thể cập nhật trạng thái nguyên liệu.')
    }
  }

  const handleToggleMenuAvailability = async (itemId) => {
    const target = menuManagement.items.find((item) => item.id === itemId)
    if (!target) return

    try {
      setActionError('')
      const updated = await chefApi.updateMenuAvailability(itemId, !target.isAvailable)
      setMenuManagement((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isAvailable: updated.isAvailable,
              }
            : item
        ),
      }))
    } catch (error) {
      setActionError(error.message ?? 'Không thể cập nhật trạng thái phục vụ.')
    }
  }

  return (
    <main className="max-h-screen bg-[#f8fafc]">
      <div className="mx-auto grid min-h-screen max-w-7xl content-start items-start overflow-hidden border border-[#d8e0e7] bg-white md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="md:col-span-2">
          <ChefHeader />
        </div>

        <ChefSidebar
          items={dashboard.navigation.sideItems}
          activeSection={activeSection}
          onChangeSection={setActiveSection}
          onSignOut={onSignOut}
        />

        <section className="min-w-0 max-h-full self-start space-y-5 bg-[#f8fafc] p-5 lg:p-6">
          {actionError ? (
            <div className="rounded-2xl border border-[#f0d2cb] bg-[#fff6f4] px-4 py-3 text-sm font-medium text-[#a24a2f]">
              {actionError}
            </div>
          ) : null}

          {activeSection === 'orders' ? (
            <KitchenOrdersView
              kitchenDisplay={visibleKitchenDisplay}
              selectedTableId={selectedWaitingTableId}
              onSelectTable={setSelectedTableId}
              onCompleteItem={handleCompleteItem}
            />
          ) : null}

          {activeSection === 'inventory' ? (
            <InventoryManagementView
              inventoryManagement={inventoryManagement}
              onChangeQuantity={handleChangeInventoryQuantity}
              onChangeStatus={handleChangeInventoryStatus}
            />
          ) : null}

          {activeSection === 'menu' ? (
            <MenuStatusView
              menuManagement={menuManagement}
              onToggleAvailability={handleToggleMenuAvailability}
            />
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default ChefDashboard
