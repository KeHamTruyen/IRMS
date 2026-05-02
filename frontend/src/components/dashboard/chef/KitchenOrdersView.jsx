import { useMemo } from 'react'
import { mapKitchenItemStatusLabel } from './utils'

const tableTone = {
  WAITING_FOOD: 'border-[#f0d8a8] bg-[#fff8ef] text-[#b17a19]',
  SERVED: 'border-[#d2eadf] bg-[#f5fcf8] text-[#2d7871]',
}

function TableChip({ table, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(table.id)}
      className={`min-w-[168px] rounded-[22px] border px-4 py-4 text-left transition ${
        tableTone[table.serviceState] ?? 'border-[#d8e0e7] bg-white text-[#516072]'
      } ${isSelected ? 'ring-2 ring-[#0d9488]/20' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-bold uppercase tracking-[0.12em]">Bàn {table.tableNumber}</div>
        <div className="text-sm font-semibold">{table.currentGuests} khách</div>
      </div>
      <p className="mt-3 text-sm font-semibold">{table.location}</p>
      <p className="mt-1 text-xs text-[#62707f]">{table.elapsedMinutes} phút chờ món</p>
    </button>
  )
}

function KitchenOrderCard({ order, isSelected, onSelectTable, onCompleteItem }) {
  const pendingItems = order.items.filter((item) => item.status !== 'COMPLETED')

  return (
    <article
      className={`rounded-[26px] border bg-white p-5 transition ${
        isSelected ? 'border-[#0d9488] shadow-[0_12px_30px_rgba(13,148,136,0.08)]' : 'border-[#e7edf2]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
            Bàn {order.tableNumber}
          </div>
          <h3 className="mt-2 text-xl font-bold text-[#16202a]">{order.orderNumber}</h3>
          <p className="mt-1 text-sm text-[#62707f]">
            {order.orderType} • {order.elapsedMinutes} phút • {pendingItems.length} món đang chờ
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectTable(order.tableId)}
          className="rounded-full border border-[#d8e0e7] px-4 py-2 text-xs font-semibold text-[#516072] transition hover:border-[#0d9488]/40"
        >
          Xem bàn
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {order.items.map((item) => {
          const isCompleted = item.status === 'COMPLETED'

          return (
            <div
              key={item.id}
              className={`rounded-[20px] border px-4 py-4 ${
                isCompleted ? 'border-[#d2eadf] bg-[#f5fcf8]' : 'border-[#e7edf2] bg-[#fbfcfd]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-bold text-[#2d7871]">
                    {item.quantity}
                  </span>
                  <div>
                    <h4 className="font-semibold text-[#16202a]">{item.name}</h4>
                    <p className="mt-1 text-sm text-[#62707f]">
                      {item.station}
                      {item.note ? ` • ${item.note}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isCompleted ? 'bg-[#eef9f7] text-[#2d7871]' : 'bg-[#fff8ef] text-[#b17a19]'
                    }`}
                  >
                    {mapKitchenItemStatusLabel(item.status)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCompleteItem(order.tableId, item.id)}
                    disabled={isCompleted}
                    className="rounded-full bg-[#2d7871] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#d8e0e7] disabled:text-[#62707f]"
                  >
                    {isCompleted ? 'Đã hoàn thành' : 'Hoàn thành món'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function KitchenOrdersView({ kitchenDisplay, selectedTableId, onSelectTable, onCompleteItem }) {
  const waitingTables = kitchenDisplay.tables
  const servedHistory = kitchenDisplay.history ?? []
  const prioritizedOrders = useMemo(() => {
    if (!selectedTableId) return kitchenDisplay.orders

    return [...kitchenDisplay.orders].sort((left, right) => {
      if (left.tableId === selectedTableId) return -1
      if (right.tableId === selectedTableId) return 1
      return 0
    })
  }, [kitchenDisplay.orders, selectedTableId])

  return (
    <section className="space-y-5 self-start">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0d9488]">
              Quản lý đơn theo bàn
            </p>
            <h2 className="mt-2 text-[2rem] font-bold text-[#16202a]">Các món đang chờ chế biến</h2>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {waitingTables.map((table) => (
              <TableChip
                key={table.id}
                table={table}
                isSelected={table.id === selectedTableId}
                onSelect={onSelectTable}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid content-start gap-4 xl:grid-cols-2">
        {prioritizedOrders.map((order) => (
          <KitchenOrderCard
            key={order.orderId}
            order={order}
            isSelected={order.tableId === selectedTableId}
            onSelectTable={onSelectTable}
            onCompleteItem={onCompleteItem}
          />
        ))}
      </section>

      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0d9488]">
              Lịch sử bếp
            </p>
            <h2 className="mt-2 text-[1.5rem] font-bold text-[#16202a]">Các món đã hoàn thành</h2>
          </div>
          <span className="rounded-full bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#516072]">
            {servedHistory.length} món
          </span>
        </div>

        <div className="mt-5 divide-y divide-[#e7edf2]">
          {servedHistory.length ? (
            servedHistory.slice(0, 12).map((item) => (
              <div key={item.id} className="grid gap-3 py-4 md:grid-cols-[120px_minmax(0,1fr)_130px] md:items-center">
                <div className="text-sm font-bold text-[#16202a]">Bàn {item.tableNumber}</div>
                <div>
                  <div className="font-semibold text-[#16202a]">{item.itemName}</div>
                  <div className="mt-1 text-sm text-[#62707f]">
                    {item.orderNumber} • SL {item.quantity} • {item.station}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <span className="rounded-full bg-[#eef9f7] px-3 py-1 text-xs font-semibold text-[#2d7871]">
                    {item.statusLabel}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-sm font-semibold text-[#62707f]">Chưa có món nào hoàn thành.</div>
          )}
        </div>
      </section>
    </section>
  )
}

export default KitchenOrdersView
