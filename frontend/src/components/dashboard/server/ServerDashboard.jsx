import { useMemo, useState } from 'react'
import AppFooter from '../../layout/AppFooter'
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

const buildBillTotals = (bill, subtotal) => {
  const tax = Math.round(subtotal * 0.1)
  const serviceCharge = Math.round(subtotal * 0.08)

  return {
    ...bill,
    subtotal,
    tax,
    serviceCharge,
    totalAmount: subtotal + tax + serviceCharge - Number(bill.discount || 0),
  }
}

const recalculateSession = (session) => {
  const batches = session.batches.map(normalizeBatch)
  const items = batches.flatMap((batch) => batch.items)
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)

  return {
    ...session,
    batches,
    orderResponse: {
      ...session.orderResponse,
      items,
      totalAmount: subtotal,
      updatedAt: new Date().toISOString(),
    },
    bill: buildBillTotals(session.bill, subtotal),
  }
}

const createDraftBatch = (batchNumber, items = []) => ({
  batchNumber,
  status: DRAFT_BATCH_STATUS,
  batchNote: '',
  batchTotal: getBatchTotal({ items }),
  items,
})

const normalizeSession = (session, paymentMethods) =>
  recalculateSession({
    ...session,
    batches: (session.batches ?? []).map(normalizeBatch),
    paymentMethods,
    selectedPaymentMethod: session.selectedPaymentMethod ?? '',
  })

const createSessionFromTable = (table, serverSession, paymentMethods, orderId) => {
  const now = Date.now()

  return normalizeSession(
    {
      tableId: table.id,
      orderResponse: {
        id: orderId,
        orderNumber: `ORD-${table.id}${String(now).slice(-4)}`,
        tableId: table.id,
        tableName: `Bàn ${table.tableNumber}`,
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
      batches: [],
      bill: {
        id: now + 1,
        billNumber: `BILL-${table.id}${String(now).slice(-3)}`,
        orderId,
        subtotal: 0,
        tax: 0,
        discount: 0,
        serviceCharge: 0,
        totalAmount: 0,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        paidAt: null,
        payments: [],
      },
    },
    paymentMethods
  )
}

function ServerDashboard({ session, dashboard, onSignOut }) {
  const paymentMethods = dashboard.serviceConsole.paymentMethods
  const [activeSection, setActiveSection] = useState('tables')
  const [tables, setTables] = useState(dashboard.tableManagement.tables)
  const [selectedTableId, setSelectedTableId] = useState(dashboard.tableManagement.tables[0]?.id)
  const [activeAction, setActiveAction] = useState('ordering')
  const [draftSelections, setDraftSelections] = useState(createEmptyDraft)
  const [sessions, setSessions] = useState(() =>
    dashboard.serviceConsole.sessions.map((item) => normalizeSession(item, paymentMethods))
  )

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0],
    [tables, selectedTableId]
  )

  const selectedSession = useMemo(
    () => sessions.find((item) => item.tableId === selectedTable?.id) ?? null,
    [sessions, selectedTable?.id]
  )

  const canOrder =
    selectedTable &&
    selectedTable.serviceState !== 'RESERVED' &&
    selectedTable.serviceState !== 'CLEANING'

  const canPay = Boolean(selectedSession)

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
    const menuItem = dashboard.menuCatalog.items.find((item) => item.id === menuItemId)
    const draft = draftSelections[menuItemId]

    if (!menuItem || !draft?.quantity || !selectedTable) return

    const createdOrderId = Date.now()
    let nextSession = null

    setSessions((current) => {
      const existing = current.find((item) => item.tableId === selectedTable.id)
      const nextItem = {
        id: createdOrderId + menuItemId,
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: draft.quantity,
        unitPrice: menuItem.price,
        subtotal: menuItem.price * draft.quantity,
        specialInstructions: draft.note ?? '',
        size: draft.size ?? menuItem.sizeOptions[0],
        status: 'DRAFT',
      }

      if (!existing) {
        nextSession = recalculateSession({
          ...createSessionFromTable(selectedTable, session, paymentMethods, createdOrderId),
          batches: [createDraftBatch(1, [nextItem])],
        })

        return [...current, nextSession]
      }

      return current.map((item) => {
        if (item.tableId !== selectedTable.id) return item

        const lastBatch = item.batches[item.batches.length - 1]
        const shouldAppendToDraft = lastBatch?.status === DRAFT_BATCH_STATUS
        const nextBatches = shouldAppendToDraft
          ? item.batches.map((batch, index) =>
              index === item.batches.length - 1
                ? normalizeBatch({
                    ...batch,
                    items: [...batch.items, nextItem],
                  })
                : batch
            )
          : [...item.batches, createDraftBatch(item.batches.length + 1, [nextItem])]

        nextSession = recalculateSession({
          ...item,
          batches: nextBatches,
        })

        return nextSession
      })
    })

    updateSelectedTable(nextSession, {
      serviceState: 'WAITING_FOOD',
      status: 'OCCUPIED',
      billingStatus: nextSession?.bill?.status ?? 'PENDING',
      currentGuests: selectedTable.currentGuests || selectedTable.capacity,
      elapsedMinutes: selectedTable.elapsedMinutes || 0,
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

        nextSession = recalculateSession({
          ...item,
          batches: nextBatches,
        })

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
        elapsedMinutes: 0,
      })
      return
    }

    updateSelectedTable(nextSession, {
      billingStatus: nextSession.bill.status,
    })
  }

  const handleDraftBatchNoteChange = (batchNote) => {
    setSessions((current) =>
      current.map((item) => {
        if (item.tableId !== selectedTable.id) return item

        const lastBatchIndex = item.batches.length - 1
        const lastBatch = item.batches[lastBatchIndex]

        if (!lastBatch || lastBatch.status !== DRAFT_BATCH_STATUS) return item

        return recalculateSession({
          ...item,
          batches: item.batches.map((batch, index) =>
            index === lastBatchIndex
              ? normalizeBatch({
                  ...batch,
                  batchNote,
                })
              : batch
          ),
        })
      })
    )
  }

  const handleSubmitOrder = () => {
    let nextSession = null
    let submittedOrderId = null

    setSessions((current) =>
      current.map((item) => {
        if (item.tableId !== selectedTable.id) return item

        const lastBatchIndex = item.batches.length - 1
        const lastBatch = item.batches[lastBatchIndex]

        if (!lastBatch || !lastBatch.items.length || lastBatch.status !== DRAFT_BATCH_STATUS) return item

        submittedOrderId = item.orderResponse.id
        nextSession = recalculateSession({
          ...item,
          batches: item.batches.map((batch, index) =>
            index === lastBatchIndex
              ? normalizeBatch({
                  ...batch,
                  status: SUBMITTED_BATCH_STATUS,
                  items: batch.items.map((draftItem) => ({
                    ...draftItem,
                    status: 'PENDING',
                  })),
                })
              : batch
          ),
          orderResponse: {
            ...item.orderResponse,
            status: 'CONFIRMED',
          },
        })

        return nextSession
      })
    )

    updateSelectedTable(nextSession ?? selectedSession, {
      serviceState: 'WAITING_FOOD',
      status: 'OCCUPIED',
      activeOrderId: submittedOrderId ?? selectedTable.activeOrderId,
      billingStatus: 'PENDING',
    })
  }

  const handleMarkTableServed = () => {
    let servedSession = selectedSession

    setSessions((current) =>
      current.map((item) => {
        if (item.tableId !== selectedTable.id) return item

        servedSession = recalculateSession({
          ...item,
          batches: item.batches.map((batch) =>
            normalizeBatch({
              ...batch,
              items: batch.items.map((row) => ({
                ...row,
                status: row.status === 'DRAFT' ? row.status : 'SERVED',
              })),
            })
          ),
          orderResponse: {
            ...item.orderResponse,
            status: 'SERVED',
          },
        })

        return servedSession
      })
    )

    updateSelectedTable(servedSession, {
      serviceState: 'SERVED',
      status: 'OCCUPIED',
      billingStatus: servedSession?.bill?.status ?? 'PENDING',
    })
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

  const handleConfirmPayment = () => {
    const sessionItem = sessions.find((item) => item.tableId === selectedTable.id)

    if (!sessionItem?.selectedPaymentMethod) return

    let paidSession = null

    setSessions((current) =>
      current.map((item) => {
        if (item.tableId !== selectedTable.id) return item

        paidSession = {
          ...item,
          bill: {
            ...item.bill,
            status: 'PAID',
            paidAt: new Date().toISOString(),
            payments: [
              ...item.bill.payments,
              {
                id: Date.now(),
                billId: item.bill.id,
                amount: item.bill.totalAmount,
                paymentMethod: item.selectedPaymentMethod,
                status: 'COMPLETED',
                transactionId: `TXN-${item.bill.id}`,
                paidAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                processedAt: new Date().toISOString(),
                processedBy: session.userId,
                notes: `Thanh toán bằng ${mapPaymentMethodLabel(item.selectedPaymentMethod)}`,
              },
            ],
          },
        }

        return paidSession
      })
    )

    updateSelectedTable(paidSession, {
      serviceState: 'CLEANING',
      status: 'CLEANING',
      billingStatus: 'PAID',
      currentGuests: 0,
    })
    setActiveAction('payment')
  }

  const showOrderPanel = activeSection === 'tables'

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div
        className={`mx-auto grid min-h-screen max-w-[1500px] overflow-hidden border border-[#d8e0e7] bg-white ${
          showOrderPanel
            ? 'md:grid-cols-[180px_minmax(0,1fr)_320px] lg:grid-cols-[220px_minmax(0,1fr)_390px]'
            : 'md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]'
        }`}
      >
        <div className={showOrderPanel ? 'md:col-span-3' : 'md:col-span-2'}>
          <ServerHeader placeholder={dashboard.searchPlaceholder} />
        </div>

        <ServerSidebar
          items={dashboard.navigation.sideItems}
          activeSection={activeSection}
          onChangeSection={setActiveSection}
          onSignOut={onSignOut}
        />

        <section className="min-w-0 space-y-5 bg-[#f8fafc] p-5 lg:p-6">
          {activeSection === 'tables' ? (
            <TableManagementView
              tableManagement={{ ...dashboard.tableManagement, tables }}
              menuCatalog={dashboard.menuCatalog}
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
            />
          ) : (
            <MenuCatalogView menuCatalog={dashboard.menuCatalog} />
          )}

          <AppFooter session={session} dashboard={dashboard} />
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
            canPay={canPay}
          />
        ) : null}
      </div>
    </main>
  )
}

export default ServerDashboard
