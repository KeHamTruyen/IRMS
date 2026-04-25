import { useMemo, useState } from 'react'
import { countTableMetrics, formatCurrency, mapServiceStateLabel } from './utils'

const statusTone = {
  AVAILABLE: 'border-[#d8e0e7] bg-white text-[#0d9488]',
  RESERVED: 'border-[#d8e8f6] bg-[#f6fbff] text-[#4f7ea8]',
  WAITING_FOOD: 'border-[#f0d8a8] bg-[#fff8ef] text-[#b17a19]',
  SERVED: 'border-[#d2eadf] bg-[#f5fcf8] text-[#2d7871]',
  CLEANING: 'border-[#f0d2cb] bg-[#fff6f4] text-[#c36d4b]',
}

const metricTone = {
  empty: 'bg-[#eef9f7] text-[#0d9488]',
  reserved: 'bg-[#f6fbff] text-[#4f7ea8]',
  cleaning: 'bg-[#fff4f1] text-[#c36d4b]',
}

function MetricChip({ label, value, tone }) {
  return (
    <div className={`rounded-full px-4 py-2 text-sm font-semibold ${tone}`}>
      {value} {label}
    </div>
  )
}

function TableCard({ table, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(table.id)}
      className={`min-w-[196px] rounded-[24px] border p-4 text-left transition ${statusTone[table.serviceState]} ${
        isSelected ? 'ring-2 ring-[#0d9488]/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em]">
          {mapServiceStateLabel(table.serviceState)}
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-current text-2xl font-bold">
          {table.tableNumber}
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-2xl font-bold text-[#16202a]">{table.capacity}</p>
        <p className="text-sm text-[#62707f]">
          {table.currentGuests > 0 ? `${table.currentGuests} khách` : `${table.capacity} ghế`}
        </p>
        <p className="text-xs text-[#94a3b8]">
          {table.reservationName ? `Giữ bàn: ${table.reservationName}` : table.location}
        </p>
      </div>
    </button>
  )
}

function MenuOrderCard({ item, draftItem, onDraftChange, onAddItem, disabled }) {
  const quantity = draftItem?.quantity ?? 0
  const size = draftItem?.size ?? item.sizeOptions[0]
  const note = draftItem?.note ?? ''
  const isUnavailable = !item.isAvailable
  const isDisabled = disabled || isUnavailable

  return (
    <article
      className={`overflow-hidden rounded-[22px] border border-[#e7edf2] bg-white ${
        isUnavailable ? 'opacity-70' : ''
      }`}
    >
      <div className="relative">
        <img src={item.imageUrl} alt={item.name} className="h-40 w-full object-cover" />
        {isUnavailable ? (
          <span className="absolute left-4 top-4 rounded-full bg-[#fff4f1] px-3 py-1 text-xs font-semibold text-[#c36d4b]">
            Tạm hết
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[#16202a]">{item.name}</h3>
            <p className="mt-1 text-sm leading-6 text-[#62707f]">{item.description}</p>
          </div>
          <span className="text-sm font-bold text-[#2d7871]">{formatCurrency(item.price)}</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#f8fafc] px-3 py-2">
          <span className="text-sm font-medium text-[#62707f]">Số lượng</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDraftChange(item.id, { quantity: Math.max(0, quantity - 1) })}
              className="grid h-8 w-8 place-items-center rounded-full border border-[#d8e0e7] bg-white text-sm"
              disabled={isDisabled}
            >
              -
            </button>
            <span className="min-w-5 text-center text-sm font-semibold text-[#16202a]">{quantity}</span>
            <button
              type="button"
              onClick={() => onDraftChange(item.id, { quantity: quantity + 1 })}
              className="grid h-8 w-8 place-items-center rounded-full border border-[#d8e0e7] bg-white text-sm"
              disabled={isDisabled}
            >
              +
            </button>
          </div>
        </div>

        <select
          value={size}
          onChange={(event) => onDraftChange(item.id, { size: event.target.value })}
          className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-white px-3 text-sm text-[#16202a] outline-none"
          disabled={isDisabled}
        >
          {item.sizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <textarea
          value={note}
          onChange={(event) => onDraftChange(item.id, { note: event.target.value })}
          rows={2}
          placeholder="Ghi chú cho món"
          className="w-full rounded-2xl border border-[#d8e0e7] px-3 py-2 text-sm text-[#16202a] outline-none placeholder:text-[#94a3b8]"
          disabled={isDisabled}
        />

        <button
          type="button"
          onClick={() => onAddItem(item.id)}
          disabled={isDisabled || quantity <= 0}
          className="w-full rounded-2xl bg-[#2d7871] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {item.isAvailable ? 'Thêm món' : 'Món đã hết'}
        </button>
      </div>
    </article>
  )
}

function OrderingWorkspace({ menuCatalog, draftSelections, onDraftChange, onAddItem, canOrder }) {
  const [activeCategory, setActiveCategory] = useState('Tất cả')

  const items = useMemo(() => {
    if (activeCategory === 'Tất cả') return menuCatalog.items
    return menuCatalog.items.filter((item) => item.category === activeCategory)
  }, [activeCategory, menuCatalog.items])

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-[1.6rem] font-bold text-[#16202a]">Đặt món và quản lý thực đơn</h3>
            <p className="mt-2 text-sm text-[#62707f]">
              Chọn món, số lượng, kích cỡ và ghi chú rồi thêm vào lần đặt món đang thao tác.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {menuCatalog.categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category
                    ? 'border-[#0d9488] bg-[#eef9f7] text-[#0d9488]'
                    : 'border-[#d8e0e7] bg-white text-[#62707f]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <MenuOrderCard
                key={item.id}
                item={item}
                draftItem={draftSelections[item.id]}
                onDraftChange={onDraftChange}
                onAddItem={onAddItem}
                disabled={!canOrder}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PaymentWorkspace({
  bill,
  paymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onConfirmPayment,
  canPay,
}) {
  return (
    <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
      <div>
        <h3 className="text-[1.6rem] font-bold text-[#16202a]">Thanh toán và hóa đơn</h3>
        <p className="mt-2 text-sm text-[#62707f]">
          Kiểm tra tổng tiền, chọn hình thức thanh toán và xác nhận giao dịch cho bàn hiện tại.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-[#e7edf2] bg-[#fbfcfd] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#62707f]">Hóa đơn hiện tại</p>
              <h4 className="mt-1 text-xl font-bold text-[#16202a]">{bill.billNumber}</h4>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2d7871]">
              {bill.status === 'PAID'
                ? 'Đã thanh toán'
                : bill.status === 'PARTIALLY_PAID'
                  ? 'Thanh toán một phần'
                  : 'Chờ thanh toán'}
            </span>
          </div>

          <div className="mt-6 space-y-3 text-sm text-[#62707f]">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Thuế</span>
              <span>{formatCurrency(bill.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí phục vụ</span>
              <span>{formatCurrency(bill.serviceCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span>Giảm giá</span>
              <span>- {formatCurrency(bill.discount)}</span>
            </div>
            <div className="flex justify-between border-t border-[#e7edf2] pt-3 text-base font-bold text-[#16202a]">
              <span>Tổng thanh toán</span>
              <span>{formatCurrency(bill.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.code}
              type="button"
              disabled={!canPay || bill.status === 'PAID'}
              onClick={() => onSelectPaymentMethod(method.code)}
              className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                selectedPaymentMethod === method.code
                  ? 'border-[#0d9488] bg-[#eef9f7]'
                  : 'border-[#e7edf2] bg-white'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <div className="font-semibold text-[#16202a]">{method.label}</div>
              <p className="mt-1 text-sm text-[#62707f]">{method.hint}</p>
            </button>
          ))}

          <button
            type="button"
            disabled={!canPay || !selectedPaymentMethod || bill.status === 'PAID'}
            onClick={onConfirmPayment}
            className="w-full rounded-2xl bg-[#1e293b] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </section>
  )
}

function TableManagementView({
  tableManagement,
  menuCatalog,
  selectedTable,
  activeAction,
  onSetActiveAction,
  onSelectTable,
  onMarkTableServed,
  onDraftChange,
  onAddItem,
  onSelectPaymentMethod,
  onConfirmPayment,
  selectedSession,
  draftSelections,
}) {
  const metrics = countTableMetrics(tableManagement.tables)
  const canOrder =
    selectedTable.serviceState === 'AVAILABLE' ||
    selectedTable.serviceState === 'WAITING_FOOD' ||
    selectedTable.serviceState === 'SERVED'
  const canPay = Boolean(selectedSession)
  const canMarkServed = selectedTable.serviceState === 'WAITING_FOOD'

  return (
    <section className="space-y-5">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-[2rem] font-bold text-[#16202a]">Danh sách bàn</h2>
            <p className="mt-2 text-sm text-[#62707f]">
              Khu vực: {tableManagement.serviceArea} • {metrics.activeTables} bàn đang theo dõi
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <MetricChip label="bàn trống" value={metrics.emptyTables} tone={metricTone.empty} />
            <MetricChip label="đã đặt trước" value={metrics.reservedTables} tone={metricTone.reserved} />
            <MetricChip label="cần dọn" value={metrics.cleaningTables} tone={metricTone.cleaning} />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {tableManagement.tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                isSelected={table.id === selectedTable.id}
                onSelect={onSelectTable}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-[1.5rem] font-bold text-[#16202a]">Bàn {selectedTable.tableNumber}</h3>
            <p className="mt-2 text-sm text-[#62707f]">
              Trạng thái hiện tại được cập nhật theo order, phục vụ và thanh toán.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#516072]">
              {mapServiceStateLabel(selectedTable.serviceState)}
            </div>
            {canMarkServed ? (
              <button
                type="button"
                onClick={onMarkTableServed}
                className="rounded-full bg-[#eef9f7] px-5 py-3 text-sm font-semibold text-[#0d9488] transition hover:bg-[#dff5f1]"
              >
                Đã phục vụ
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onSetActiveAction('ordering')}
            disabled={!canOrder}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeAction === 'ordering'
                ? 'bg-[#eef9f7] text-[#0d9488]'
                : 'border border-[#d8e0e7] bg-white text-[#516072]'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Đặt món và thực đơn
          </button>
          <button
            type="button"
            onClick={() => onSetActiveAction('payment')}
            disabled={!canPay}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeAction === 'payment'
                ? 'bg-[#1e293b] text-white'
                : 'border border-[#d8e0e7] bg-white text-[#516072]'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Thanh toán và hóa đơn
          </button>
        </div>
      </section>

      {activeAction === 'payment' ? (
        <PaymentWorkspace
          bill={selectedSession?.bill}
          paymentMethods={selectedSession?.paymentMethods ?? []}
          selectedPaymentMethod={selectedSession?.selectedPaymentMethod}
          onSelectPaymentMethod={onSelectPaymentMethod}
          onConfirmPayment={onConfirmPayment}
          canPay={canPay}
        />
      ) : (
        <OrderingWorkspace
          menuCatalog={menuCatalog}
          draftSelections={draftSelections}
          onDraftChange={onDraftChange}
          onAddItem={onAddItem}
          canOrder={canOrder}
        />
      )}
    </section>
  )
}

export default TableManagementView
