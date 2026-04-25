import { useEffect, useMemo, useState } from 'react'
import AppFooter from '../../layout/AppFooter'
import ChefHeader from './ChefHeader'
import ChefSidebar from './ChefSidebar'
import InventoryManagementView from './InventoryManagementView'
import KitchenOrdersView from './KitchenOrdersView'
import MenuStatusView from './MenuStatusView'

function ChefDashboard({ session, dashboard, onSignOut }) {
  const [activeSection, setActiveSection] = useState(dashboard.navigation.sideItems[0]?.id ?? 'orders')
  const [kitchenDisplay, setKitchenDisplay] = useState(dashboard.kitchenDisplay)
  const [inventoryManagement, setInventoryManagement] = useState(dashboard.inventoryManagement)
  const [menuManagement, setMenuManagement] = useState(dashboard.menuManagement)
  const [selectedTableId, setSelectedTableId] = useState(dashboard.kitchenDisplay.tables[0]?.id ?? null)

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

  useEffect(() => {
    if (!waitingTables.length) {
      setSelectedTableId(null)
      return
    }

    if (!waitingTables.some((table) => table.id === selectedTableId)) {
      setSelectedTableId(waitingTables[0].id)
    }
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

  const handleCompleteItem = (tableId, itemId) => {
    setKitchenDisplay((current) => ({
      ...current,
      orders: current.orders.map((order) =>
        order.tableId === tableId
          ? {
              ...order,
              items: order.items.map((item) =>
                item.id === itemId ? { ...item, status: 'COMPLETED' } : item
              ),
            }
          : order
      ),
    }))
  }

  const handleChangeInventoryQuantity = (itemId, quantity) => {
    setInventoryManagement((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              status:
                quantity <= 0
                  ? 'OUT_OF_STOCK'
                  : item.status === 'OUT_OF_STOCK'
                    ? 'IN_STOCK'
                    : item.status,
            }
          : item
      ),
    }))
  }

  const handleChangeInventoryStatus = (itemId, status) => {
    setInventoryManagement((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: item.quantity <= 0 ? 'OUT_OF_STOCK' : status,
            }
          : item
      ),
    }))
  }

  const handleToggleMenuAvailability = (itemId) => {
    setMenuManagement((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              isAvailable: !item.isAvailable,
            }
          : item
      ),
    }))
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto grid min-h-screen max-w-[1500px] items-start overflow-hidden border border-[#d8e0e7] bg-white md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="md:col-span-2">
          <ChefHeader />
        </div>

        <ChefSidebar
          items={dashboard.navigation.sideItems}
          activeSection={activeSection}
          onChangeSection={setActiveSection}
          onSignOut={onSignOut}
        />

        <section className="min-w-0 self-start space-y-5 bg-[#f8fafc] p-5 lg:p-6">
          {activeSection === 'orders' ? (
            <KitchenOrdersView
              kitchenDisplay={visibleKitchenDisplay}
              selectedTableId={selectedTableId}
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

          <AppFooter session={session} dashboard={dashboard} />
        </section>
      </div>
    </main>
  )
}

export default ChefDashboard
