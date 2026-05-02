import { useMemo, useState } from 'react'
import {
  countTableMetrics,
  formatCurrency,
  mapBillStatusLabel,
  mapCategoryLabel,
  mapLocationLabel,
  mapServiceStateLabel,
} from './utils'

const statusTone = {
  AVAILABLE: 'border-[#d8e0e7] bg-white text-[#0d9488]',
  RESERVED: 'border-[#d8e8f6] bg-[#f6fbff] text-[#4f7ea8]',
  OCCUPIED: 'border-[#d7dde8] bg-[#f8fafc] text-[#475569]',
  WAITING_FOOD: 'border-[#f0d8a8] bg-[#fff8ef] text-[#b17a19]',
  READY_TO_SERVE: 'border-[#bdd7ff] bg-[#f7fbff] text-[#2563eb]',
  SERVED: 'border-[#d2eadf] bg-[#f5fcf8] text-[#2d7871]',
  CLEANING: 'border-[#f0d2cb] bg-[#fff6f4] text-[#c36d4b]',
}

const metricTone = {
  empty: 'bg-[#eef9f7] text-[#0d9488]',
  reserved: 'bg-[#f6fbff] text-[#4f7ea8]',
  cleaning: 'bg-[#fff4f1] text-[#c36d4b]',
}

function MetricChip({ label, value, tone }) {
  return <div className={`rounded-full px-4 py-2 text-sm font-semibold ${tone}`}>{value} {label}</div>
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
          {table.reservationName ? `Giữ bàn: ${table.reservationName}` : mapLocationLabel(table.location)}
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
    <article className={`overflow-hidden rounded-[22px] border border-[#e7edf2] bg-white ${isUnavailable ? 'opacity-70' : ''}`}>
      <div className="relative h-40 bg-[#eef2f7]">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-40 w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center px-4 text-center text-sm font-semibold text-[#62707f]">
            {item.name}
          </div>
        )}
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
            <option key={option} value={option}>{option}</option>
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
            <h3 className="text-[1.6rem] font-bold text-[#16202a]">Đặt món</h3>
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
                {category === 'Tất cả' ? category : mapCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
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
  paymentAmount,
  splitParts,
  onSelectPaymentMethod,
  onPaymentAmountChange,
  onSplitPartsChange,
  onSetSplitAmount,
  onConfirmPayment,
  canPay,
  isBusy,
}) {
  if (!bill) {
    return (
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <h3 className="text-[1.6rem] font-bold text-[#16202a]">Thanh toán</h3>
        <p className="mt-2 text-sm text-[#62707f]">Hãy gửi món và đánh dấu đã phục vụ trước khi tạo hóa đơn.</p>
      </section>
    )
  }

  const remainingDue = Number(bill.remainingDue || bill.totalAmount || 0)

  return (
    <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
      <div>
        <h3 className="text-[1.6rem] font-bold text-[#16202a]">Thanh toán</h3>
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
              {mapBillStatusLabel(bill.status)}
            </span>
          </div>

          <div className="mt-6 space-y-3 text-sm text-[#62707f]">
            <div className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(bill.subtotal)}</span></div>
            <div className="flex justify-between"><span>Thuế</span><span>{formatCurrency(bill.tax)}</span></div>
            <div className="flex justify-between"><span>Phí dịch vụ</span><span>{formatCurrency(bill.serviceCharge)}</span></div>
            <div className="flex justify-between"><span>Giảm giá</span><span>- {formatCurrency(bill.discount)}</span></div>
            <div className="flex justify-between"><span>Đã thu</span><span>{formatCurrency(bill.amountPaid)}</span></div>
            <div className="flex justify-between border-t border-[#e7edf2] pt-3 text-base font-bold text-[#16202a]">
              <span>Còn phải thu</span>
              <span>{formatCurrency(bill.remainingDue || bill.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-[24px] border border-[#e7edf2] bg-white p-4">
            <div className="text-sm font-semibold text-[#16202a]">Số tiền cần thu</div>
            <button
              type="button"
              disabled={!canPay || bill.status === 'PAID' || isBusy}
              onClick={() => onPaymentAmountChange(String(remainingDue))}
              className="mt-3 w-full rounded-2xl bg-[#eef9f7] px-4 py-3 text-sm font-bold text-[#0d9488] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Thu toàn bộ còn lại
            </button>
            <input
              className="mt-3 w-full rounded-2xl border border-[#d8e0e7] px-4 py-3 text-sm"
              type="number"
              min="0.01"
              max={remainingDue}
              step="0.01"
              placeholder={`Số tiền cần thu (${formatCurrency(remainingDue)})`}
              value={paymentAmount}
              onChange={(event) => onPaymentAmountChange(event.target.value)}
            />
          </div>

          <div className="rounded-[24px] border border-[#e7edf2] bg-white p-4">
            <div className="text-sm font-semibold text-[#16202a]">Split bill / thu từng phần</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[2, 3, 4].map((parts) => (
                <button
                  key={parts}
                  type="button"
                  disabled={!canPay || bill.status === 'PAID' || isBusy}
                  onClick={() => onSetSplitAmount(parts)}
                  className="rounded-2xl border border-[#d8e0e7] px-3 py-2 text-sm font-semibold text-[#16202a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Chia {parts}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-[90px_minmax(0,1fr)] gap-2">
              <input
                className="rounded-2xl border border-[#d8e0e7] px-3 py-3 text-sm"
                type="number"
                min="2"
                value={splitParts}
                onChange={(event) => onSplitPartsChange(event.target.value)}
                aria-label="Số phần chia bill"
              />
              <button
                type="button"
                disabled={!canPay || bill.status === 'PAID' || isBusy}
                onClick={() => onSetSplitAmount(splitParts)}
                className="rounded-2xl border border-[#0d9488] px-4 py-3 text-sm font-bold text-[#0d9488] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Áp dụng chia bill
              </button>
            </div>
          </div>

          {paymentMethods.map((method) => (
            <button
              key={method.code}
              type="button"
              disabled={!canPay || bill.status === 'PAID' || isBusy}
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
            disabled={!canPay || !selectedPaymentMethod || bill.status === 'PAID' || isBusy}
            onClick={onConfirmPayment}
            className="w-full rounded-2xl bg-[#1e293b] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
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
  onPaymentAmountChange,
  onSplitPartsChange,
  onSetSplitAmount,
  onConfirmPayment,
  selectedSession,
  paymentAmount,
  splitParts,
  draftSelections,
  isBusy,
}) {
  const metrics = countTableMetrics(tableManagement.tables)
  const submittedItems = (selectedSession?.batches ?? [])
    .flatMap((batch) => batch.items ?? [])
    .filter((item) => item.status !== 'DRAFT')
  const draftItems = (selectedSession?.batches ?? [])
    .flatMap((batch) => batch.items ?? [])
    .filter((item) => item.status === 'DRAFT')
  const allItemsReady = submittedItems.length > 0 &&
    submittedItems.every((item) => item.status === 'READY' || item.status === 'SERVED')
  const hasBill = Boolean(selectedSession?.bill?.id)
  const billIsPaid = selectedSession?.bill?.status === 'PAID'
  const canOrder = !hasBill && (
    selectedTable.serviceState === 'AVAILABLE' ||
    selectedTable.serviceState === 'RESERVED' ||
    selectedTable.serviceState === 'OCCUPIED' ||
    selectedTable.serviceState === 'WAITING_FOOD' ||
    selectedTable.serviceState === 'READY_TO_SERVE' ||
    selectedTable.serviceState === 'SERVED'
  )
  const canMarkServed = Boolean(selectedSession?.orderResponse) &&
    !hasBill &&
    (selectedSession.orderResponse.status === 'READY' || allItemsReady)
  const canPay = hasBill || canMarkServed
  const nextStepText = (() => {
    if (!selectedSession && selectedTable.serviceState === 'OCCUPIED') return 'Khách đã vào bàn, chọn món và bấm Đặt món để gửi order sang bếp.'
    if (!selectedSession) return 'Chọn món và bấm Đặt món để gửi order sang bếp.'
    if (draftItems.length > 0) return 'Có món đang chọn, bấm Đặt món để gửi thêm sang bếp.'
    if (canMarkServed) return 'Bếp đã hoàn thành món, bấm Đã phục vụ để mở hóa đơn.'
    if (!allItemsReady && !hasBill) return 'Đang chờ bếp hoàn thành toàn bộ món cho bàn này.'
    if (hasBill && !billIsPaid) return 'Hóa đơn đã mở, không nhận thêm món trên order này. Chuyển sang Thanh toán để thu tiền.'
    if (billIsPaid) return 'Bàn đã thanh toán, chuyển sang trạng thái chờ dọn.'
    return 'Theo dõi trạng thái order và hóa đơn của bàn hiện tại.'
  })()

  return (
    <section className="space-y-5">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#16202a]">Danh sách bàn</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <MetricChip label="trống" value={metrics.emptyTables} tone={metricTone.empty} />
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
            <p className="mt-2 text-sm text-[#62707f]">Cập nhật trạng thái bàn</p>
            <p className="mt-2 rounded-2xl bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-[#516072]">
              Bước tiếp theo: {nextStepText}
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
                disabled={isBusy}
                className="rounded-full bg-[#eef9f7] px-5 py-3 text-sm font-semibold text-[#0d9488] transition hover:bg-[#dff5f1] disabled:cursor-not-allowed disabled:opacity-50"
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
            Đặt món
          </button>
          <button
            type="button"
            onClick={() => (hasBill ? onSetActiveAction('payment') : onMarkTableServed())}
            disabled={!canPay || isBusy}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeAction === 'payment'
                ? 'bg-[#1e293b] text-white'
                : 'border border-[#d8e0e7] bg-white text-[#516072]'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Thanh toán
          </button>
        </div>
      </section>

      {activeAction === 'payment' ? (
        <PaymentWorkspace
          bill={selectedSession?.bill}
          paymentMethods={selectedSession?.paymentMethods ?? []}
          selectedPaymentMethod={selectedSession?.selectedPaymentMethod}
          paymentAmount={paymentAmount}
          splitParts={splitParts}
          onSelectPaymentMethod={onSelectPaymentMethod}
          onPaymentAmountChange={onPaymentAmountChange}
          onSplitPartsChange={onSplitPartsChange}
          onSetSplitAmount={onSetSplitAmount}
          onConfirmPayment={onConfirmPayment}
          canPay={canPay}
          isBusy={isBusy}
        />
      ) : (
        <OrderingWorkspace
          menuCatalog={menuCatalog}
          draftSelections={draftSelections}
          onDraftChange={onDraftChange}
          onAddItem={onAddItem}
          canOrder={canOrder && !isBusy}
        />
      )}
    </section>
  )
}

export default TableManagementView
