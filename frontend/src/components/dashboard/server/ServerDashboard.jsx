import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../../services/api'
import ActiveOrderPanel from './ActiveOrderPanel'
import MenuCatalogView from './MenuCatalogView'
import ServerHeader from './ServerHeader'
import ServerSidebar from './ServerSidebar'
import TableManagementView from './TableManagementView'
import {
  DRAFT_BATCH_STATUS,
  SUBMITTED_BATCH_STATUS,
  deriveServiceState,
  getBatchTotal,
  mapPaymentMethodLabel,
  normalizeBatch,
  toBackendTableState,
} from './utils'

const createEmptyDraft = () => ({})

const fallbackPaymentMethods = [
  { code: 'CASH', label: 'Tiền mặt', hint: 'Thu tiền trực tiếp tại bàn.' },
  { code: 'CREDIT_CARD', label: 'Thẻ ngân hàng', hint: 'Xử lý qua cổng thanh toán thẻ.' },
  { code: 'DIGITAL_WALLET', label: 'Ví điện tử', hint: 'Momo, ZaloPay, VNPay hoặc ví tương tự.' },
  { code: 'BANK_TRANSFER', label: 'Chuyển khoản', hint: 'Đối chiếu giao dịch ngân hàng.' },
]

const fallbackSideItems = [
  { id: 'tables', label: 'Quản lý bàn' },
  { id: 'menu', label: 'Thực đơn' },
]

const statusRank = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED']

const createDraftBatch = (batchNumber, items = []) => ({
  batchNumber,
  status: DRAFT_BATCH_STATUS,
  batchNote: '',
  batchTotal: getBatchTotal({ items }),
  items,
})

const normalizeMenuItem = (item) => ({
  ...item,
  price: Number(item.price || 0),
  description: item.description ?? '',
  preparationTime: item.preparationTime ?? 0,
  imageUrl: item.imageUrl ?? '',
  sizeOptions: item.sizeOptions?.length ? item.sizeOptions : ['Tiêu chuẩn'],
  isAvailable: item.isAvailable ?? true,
})

const mapOrderItem = (item) => ({
  ...item,
  unitPrice: Number(item.unitPrice || 0),
  subtotal: Number(item.subtotal || 0),
  size: 'Tiêu chuẩn',
  status: item.status ?? 'PENDING',
})

const normalizeBill = (bill) => {
  if (!bill) return null

  return {
    ...bill,
    subtotal: Number(bill.subtotal || 0),
    tax: Number(bill.tax || 0),
    discount: Number(bill.discount || 0),
    serviceCharge: Number(bill.serviceCharge || 0),
    totalAmount: Number(bill.totalAmount || 0),
    payments: bill.payments ?? [],
  }
}

const createSessionFromOrder = (order, bill, paymentMethods) => ({
  tableId: order.tableId,
  orderResponse: {
    ...order,
    totalAmount: Number(order.totalAmount || 0),
    items: (order.items ?? []).map(mapOrderItem),
  },
  batches: [
    normalizeBatch({
      batchNumber: 1,
      status: SUBMITTED_BATCH_STATUS,
      batchNote: order.notes ?? '',
      items: (order.items ?? []).map(mapOrderItem),
    }),
  ],
  bill: normalizeBill(bill),
  paymentMethods,
  selectedPaymentMethod: '',
})

const mergeDraftIntoSession = (session, selectedTable, serverSession, paymentMethods, draftBatch) => {
  const orderId = Date.now()
  const baseSession =
    session ??
    createSessionFromOrder(
      {
        id: orderId,
        orderNumber: `Nháp-${selectedTable.tableNumber}`,
        tableId: selectedTable.id,
        tableName: `Bàn ${selectedTable.tableNumber}`,
        serverId: serverSession.userId,
        serverName: serverSession.fullName,
        status: 'PENDING',
        orderType: 'DINE_IN',
        items: [],
        totalAmount: 0,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      null,
      paymentMethods
    )

  return {
    ...baseSession,
    batches: [...baseSession.batches.filter((batch) => batch.items.length), draftBatch],
  }
}

const getNextStatuses = (currentStatus, targetStatus) => {
  const currentIndex = statusRank.indexOf(currentStatus)
  const targetIndex = statusRank.indexOf(targetStatus)

  if (currentIndex === -1 || targetIndex === -1 || currentIndex >= targetIndex) return []
  return statusRank.slice(currentIndex + 1, targetIndex + 1)
}

function ServerDashboard({ session, dashboard, onSignOut }) {
  const paymentMethods = dashboard?.serviceConsole?.paymentMethods ?? fallbackPaymentMethods
  const [activeSection, setActiveSection] = useState('tables')
  const [tables, setTables] = useState([])
  const [menuCatalog, setMenuCatalog] = useState({ categories: ['Tất cả'], items: [] })
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [activeAction, setActiveAction] = useState('ordering')
  const [draftSelections, setDraftSelections] = useState(createEmptyDraft)
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadServerData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [tableRows, menuRows, orderRows, billRows] = await Promise.all([
        api.get('/tables'),
        api.get('/menu-items'),
        api.get('/orders'),
        api.get('/bills'),
      ])

      const normalizedMenuItems = (menuRows ?? []).map(normalizeMenuItem)
      const categories = ['Tất cả', ...new Set(normalizedMenuItems.map((item) => item.category).filter(Boolean))]
      const activeOrders = (orderRows ?? [])
        .filter((order) => order.tableId && order.status !== 'COMPLETED' && order.status !== 'CANCELLED')
        .sort((left, right) => new Date(right.updatedAt ?? right.createdAt) - new Date(left.updatedAt ?? left.createdAt))

      const latestOrderByTable = new Map()
      activeOrders.forEach((order) => {
        if (!latestOrderByTable.has(order.tableId)) latestOrderByTable.set(order.tableId, order)
      })

      const billByOrder = new Map((billRows ?? []).map((bill) => [bill.orderId, bill]))
      const nextSessions = [...latestOrderByTable.values()].map((order) =>
        createSessionFromOrder(order, billByOrder.get(order.id), paymentMethods)
      )

      const nextTables = (tableRows ?? []).map((table) => {
        const order = latestOrderByTable.get(table.id)
        const bill = order ? billByOrder.get(order.id) : null
        const tableSession = order ? createSessionFromOrder(order, bill, paymentMethods) : null
        const baseTable = {
          ...table,
          serviceState: table.status === 'OCCUPIED' ? 'WAITING_FOOD' : table.status,
          currentGuests: table.status === 'OCCUPIED' ? table.capacity : 0,
          activeOrderId: order?.id ?? null,
          billingStatus: bill?.status ?? null,
          reservationName: null,
          elapsedMinutes: 0,
        }

        return {
          ...baseTable,
          serviceState: deriveServiceState(baseTable, tableSession),
        }
      })

      setMenuCatalog({ categories, items: normalizedMenuItems })
      setTables(nextTables)
      setSessions(nextSessions)
      setSelectedTableId((current) => current ?? nextTables[0]?.id ?? null)
    } catch (error) {
      setErrorMessage(error.message ?? 'Không thể tải dữ liệu phục vụ.')
    } finally {
      setIsLoading(false)
    }
  }, [paymentMethods])

  useEffect(() => {
    void Promise.resolve().then(loadServerData)
  }, [loadServerData])

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0],
    [tables, selectedTableId]
  )

  const selectedSession = useMemo(
    () => sessions.find((item) => item.tableId === selectedTable?.id) ?? null,
    [sessions, selectedTable?.id]
  )

  const canOrder = selectedTable && selectedTable.serviceState !== 'CLEANING'

  const updateSelectedTable = (nextSession, overrides = {}) => {
    setTables((current) =>
      current.map((table) => {
        if (table.id !== selectedTable.id) return table

        const nextServiceState = overrides.serviceState ?? deriveServiceState(table, nextSession)

        return {
          ...table,
          ...overrides,
          serviceState: nextServiceState,
          status: overrides.status ?? toBackendTableState(nextServiceState),
          activeOrderId:
            overrides.activeOrderId !== undefined
              ? overrides.activeOrderId
              : nextSession?.orderResponse?.id ?? null,
        }
      })
    )
  }

  const handleSelectTable = (tableId) => {
    setSelectedTableId(tableId)
    setActiveSection('tables')
    setErrorMessage('')
  }

  const handleDraftChange = (menuItemId, nextPatch) => {
    setDraftSelections((current) => ({
      ...current,
      [menuItemId]: {
        ...(current[menuItemId] ?? {}),
        ...nextPatch,
      },
    }))
  }

  const handleAddItem = (menuItemId) => {
    const menuItem = menuCatalog.items.find((item) => item.id === menuItemId)
    const draft = draftSelections[menuItemId]

    if (!menuItem || !draft?.quantity || !selectedTable) return

    const nextItem = {
      id: Date.now() + menuItemId,
      menuItemId: menuItem.id,
      menuItemName: menuItem.name,
      quantity: draft.quantity,
      unitPrice: menuItem.price,
      subtotal: menuItem.price * draft.quantity,
      specialInstructions: draft.note ?? '',
      size: draft.size ?? menuItem.sizeOptions[0],
      status: 'DRAFT',
    }

    let nextSession = null
    setSessions((current) => {
      const existing = current.find((item) => item.tableId === selectedTable.id)
      const lastBatch = existing?.batches?.[existing.batches.length - 1]
      const draftBatch =
        lastBatch?.status === DRAFT_BATCH_STATUS
          ? normalizeBatch({ ...lastBatch, items: [...lastBatch.items, nextItem] })
          : createDraftBatch((existing?.batches?.length ?? 0) + 1, [nextItem])

      nextSession = mergeDraftIntoSession(existing, selectedTable, session, paymentMethods, draftBatch)

      return existing
        ? current.map((item) => (item.tableId === selectedTable.id ? nextSession : item))
        : [...current, nextSession]
    })

    updateSelectedTable(nextSession, {
      serviceState: 'WAITING_FOOD',
      status: 'OCCUPIED',
      billingStatus: nextSession?.bill?.status ?? 'PENDING',
      currentGuests: selectedTable.currentGuests || selectedTable.capacity,
      reservationName: null,
    })

    setDraftSelections((current) => ({
      ...current,
      [menuItemId]: {
        quantity: 0,
        size: menuItem.sizeOptions[0],
        note: '',
      },
    }))
  }

  const handleRemoveDraftItem = (itemId) => {
    let nextSession = selectedSession

    setSessions((current) =>
      current.flatMap((item) => {
        if (item.tableId !== selectedTable.id) return [item]

        const lastBatchIndex = item.batches.length - 1
        const lastBatch = item.batches[lastBatchIndex]

        if (!lastBatch || lastBatch.status !== DRAFT_BATCH_STATUS) {
          nextSession = item
          return [item]
        }

        const nextBatches = item.batches
          .map((batch, index) =>
            index === lastBatchIndex
              ? normalizeBatch({
                  ...batch,
                  items: batch.items.filter((draftItem) => draftItem.id !== itemId),
                })
              : batch
          )
          .filter((batch) => batch.status !== DRAFT_BATCH_STATUS || batch.items.length > 0)

        if (!nextBatches.length) {
          nextSession = null
          return []
        }

        nextSession = {
          ...item,
          batches: nextBatches,
        }

        return [nextSession]
      })
    )

    if (!nextSession) {
      updateSelectedTable(null, {
        serviceState: 'AVAILABLE',
        status: 'AVAILABLE',
        activeOrderId: null,
        billingStatus: null,
        currentGuests: 0,
      })
      return
    }

    updateSelectedTable(nextSession, {
      billingStatus: nextSession.bill?.status ?? 'PENDING',
    })
  }

  const handleDraftBatchNoteChange = (batchNote) => {
    setSessions((current) =>
      current.map((item) => {
        if (item.tableId !== selectedTable.id) return item

        const lastBatchIndex = item.batches.length - 1
        const lastBatch = item.batches[lastBatchIndex]

        if (!lastBatch || lastBatch.status !== DRAFT_BATCH_STATUS) return item

        return {
          ...item,
          batches: item.batches.map((batch, index) =>
            index === lastBatchIndex
              ? normalizeBatch({
                  ...batch,
                  batchNote,
                })
              : batch
          ),
        }
      })
    )
  }

  const transitionOrderTo = async (order, targetStatus) => {
    let currentOrder = order
    const nextStatuses = getNextStatuses(order.status, targetStatus)

    for (const status of nextStatuses) {
      currentOrder = await api.patch(`/orders/${currentOrder.id}/status?status=${status}`)
    }

    return currentOrder
  }

  const handleSubmitOrder = async () => {
    const draftBatch =
      selectedSession?.batches?.length &&
      selectedSession.batches[selectedSession.batches.length - 1]?.status === DRAFT_BATCH_STATUS
        ? selectedSession.batches[selectedSession.batches.length - 1]
        : null

    if (!draftBatch?.items?.length || !selectedTable) return

    setIsBusy(true)
    setErrorMessage('')

    try {
      const order = await api.post('/orders', {
        tableId: selectedTable.id,
        serverId: session.userId,
        orderType: 'DINE_IN',
        notes: draftBatch.batchNote,
        items: draftBatch.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          specialInstructions: item.specialInstructions,
        })),
      })

      await transitionOrderTo(order, 'PREPARING')
      await loadServerData()
    } catch (error) {
      setErrorMessage(error.message ?? 'Không thể gửi order.')
    } finally {
      setIsBusy(false)
    }
  }

  const getOrCreateBill = async (order) => {
    try {
      return await api.get(`/bills/order/${order.id}`)
    } catch {
      return api.post(`/bills/order/${order.id}`, {
        orderId: order.id,
        discount: 0,
      })
    }
  }

  const handleMarkTableServed = async () => {
    if (!selectedSession?.orderResponse) return

    setIsBusy(true)
    setErrorMessage('')

    try {
      const servedOrder = await transitionOrderTo(selectedSession.orderResponse, 'SERVED')
      await getOrCreateBill(servedOrder)
      await loadServerData()
      setActiveAction('payment')
    } catch (error) {
      setErrorMessage(error.message ?? 'Không thể cập nhật trạng thái đã phục vụ.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleSelectPaymentMethod = (methodCode) => {
    setSessions((current) =>
      current.map((item) =>
        item.tableId === selectedTable.id
          ? {
              ...item,
              selectedPaymentMethod: methodCode,
            }
          : item
      )
    )
  }

  const handleConfirmPayment = async () => {
    const sessionItem = sessions.find((item) => item.tableId === selectedTable.id)

    if (!sessionItem?.selectedPaymentMethod || !sessionItem?.bill?.id) return

    setIsBusy(true)
    setErrorMessage('')

    try {
      const order = sessionItem.orderResponse
      const bill = sessionItem.bill
      const servedOrder = order.status === 'SERVED' ? order : await transitionOrderTo(order, 'SERVED')

      await api.post(`/bills/${bill.id}/payments`, {
        billId: bill.id,
        amount: bill.totalAmount,
        paymentMethod: sessionItem.selectedPaymentMethod,
        transactionId: `TXN-${bill.id}-${Date.now()}`,
        notes: `Thanh toán bằng ${mapPaymentMethodLabel(sessionItem.selectedPaymentMethod)}`,
      })

      await api.patch(`/tables/${servedOrder.tableId}/status?status=CLEANING`)
      await loadServerData()
      setActiveAction('payment')
    } catch (error) {
      setErrorMessage(error.message ?? 'Không thể xác nhận thanh toán.')
    } finally {
      setIsBusy(false)
    }
  }

  const showOrderPanel = activeSection === 'tables'

  if (isLoading && !tables.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fafc] text-sm font-semibold text-[#516072]">
        Đang tải dữ liệu phục vụ...
      </main>
    )
  }

  if (!selectedTable) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8fafc] text-sm font-semibold text-[#516072]">
        Chưa có bàn phục vụ trong hệ thống.
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div
        className={`mx-auto grid min-h-screen max-w-7xl content-start overflow-hidden border border-[#d8e0e7] bg-white ${
          showOrderPanel
            ? 'md:grid-cols-[180px_minmax(0,1fr)_320px] lg:grid-cols-[220px_minmax(0,1fr)_390px]'
            : 'md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]'
        }`}
      >
        <div className={showOrderPanel ? 'md:col-span-3' : 'md:col-span-2'}>
          <ServerHeader />
        </div>

        <ServerSidebar
          items={dashboard?.navigation?.sideItems ?? fallbackSideItems}
          activeSection={activeSection}
          onChangeSection={setActiveSection}
          onSignOut={onSignOut}
        />

        <section className="min-w-0 space-y-5 bg-[#f8fafc] p-5 lg:p-6">
          {errorMessage ? (
            <div className="rounded-2xl border border-[#f0d2cb] bg-[#fff6f4] px-4 py-3 text-sm font-semibold text-[#c36d4b]">
              {errorMessage}
            </div>
          ) : null}

          {activeSection === 'tables' ? (
            <TableManagementView
              tableManagement={{ ...(dashboard?.tableManagement ?? {}), tables }}
              menuCatalog={menuCatalog}
              selectedTable={selectedTable}
              activeAction={activeAction}
              onSetActiveAction={setActiveAction}
              onSelectTable={handleSelectTable}
              onMarkTableServed={handleMarkTableServed}
              onDraftChange={handleDraftChange}
              onAddItem={handleAddItem}
              onSelectPaymentMethod={handleSelectPaymentMethod}
              onConfirmPayment={handleConfirmPayment}
              selectedSession={selectedSession}
              draftSelections={draftSelections}
              isBusy={isBusy}
            />
          ) : (
            <MenuCatalogView menuCatalog={menuCatalog} />
          )}
        </section>

        {showOrderPanel ? (
          <ActiveOrderPanel
            selectedTable={selectedTable}
            session={selectedSession}
            activeAction={activeAction}
            onRemoveDraftItem={handleRemoveDraftItem}
            onDraftBatchNoteChange={handleDraftBatchNoteChange}
            onSubmitOrder={handleSubmitOrder}
            canOrder={canOrder}
            isBusy={isBusy}
          />
        ) : null}
      </div>
    </main>
  )
}

export default ServerDashboard
