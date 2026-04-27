import {
  DRAFT_BATCH_STATUS,
  formatCurrency,
  mapBillStatusLabel,
  mapOrderItemStatusLabel,
  mapServiceStateLabel,
} from './utils'

function BatchItem({ item, removable, onRemove }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eef9f7] text-sm font-bold text-[#0d9488]">
          {item.quantity}
        </span>
        <div>
          <div className="flex items-start gap-2">
            <h5 className="font-semibold text-[#16202a]">{item.menuItemName}</h5>
            {removable ? (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="grid h-6 w-6 place-items-center rounded-full border border-[#d8e0e7] text-sm font-semibold text-[#516072] transition hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                aria-label={`Xóa món ${item.menuItemName}`}
              >
                -
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-[#62707f]">
            {item.size}
            {item.specialInstructions ? ` • ${item.specialInstructions}` : ''}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#94a3b8]">
            {mapOrderItemStatusLabel(item.status)}
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold text-[#516072]">{formatCurrency(item.subtotal)}</span>
    </div>
  )
}

function DraftBatchNote({ batch, onChange }) {
  return (
    <div className="rounded-[20px] border border-[#e7edf2] bg-[#fbfcfd] p-4">
      <label className="block text-sm font-semibold text-[#16202a]" htmlFor="batch-note">
        Ghi chú cho lần đặt món
      </label>
      <textarea
        id="batch-note"
        rows={3}
        value={batch.batchNote ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ví dụ: lên món chính sau khi khách dùng xong khai vị."
        className="mt-3 w-full rounded-2xl border border-[#d8e0e7] bg-white px-3 py-2 text-sm text-[#16202a] outline-none placeholder:text-[#94a3b8]"
      />
    </div>
  )
}

function OrderBatch({ batch, onRemoveDraftItem }) {
  const isDraftBatch = batch.status === DRAFT_BATCH_STATUS

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-[#16202a]">Lần gọi món {batch.batchNumber}</h4>
        <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#62707f]">
          {batch.status}
        </span>
      </div>

      <div className="space-y-3">
        {batch.items.map((item) => (
          <BatchItem
            key={item.id}
            item={item}
            removable={isDraftBatch && item.status !== 'SERVED'}
            onRemove={onRemoveDraftItem}
          />
        ))}
      </div>

      {batch.batchNote ? (
        <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-sm text-[#516072]">{batch.batchNote}</div>
      ) : null}

      <div className="flex items-center justify-between border-t border-[#e7edf2] pt-3 text-sm font-semibold text-[#16202a]">
        <span>Tổng tiền</span>
        <span>{formatCurrency(batch.batchTotal)}</span>
      </div>
    </section>
  )
}

function ActiveOrderPanel({
  selectedTable,
  session,
  activeAction,
  onRemoveDraftItem,
  onDraftBatchNoteChange,
  onSubmitOrder,
  canOrder,
  isBusy,
}) {
  const hasSession = Boolean(session)
  const draftBatch =
    session?.batches?.length && session.batches[session.batches.length - 1]?.status === DRAFT_BATCH_STATUS
      ? session.batches[session.batches.length - 1]
      : null

  const hasDraftItems = Boolean(draftBatch?.items?.length)

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-[#e7edf2] bg-white">
      <div className="border-b border-[#eef2f7] p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="rounded-full bg-[#2d7871] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
              Hóa đơn
            </span>
            <h3 className="mt-2 text-[1.9rem] font-bold text-[#16202a]">Bàn {selectedTable.tableNumber}</h3>
            <p className="mt-1 text-sm text-[#94a3b8]">
              Trạng thái: {mapServiceStateLabel(selectedTable.serviceState)}
            </p>
          </div>

          <div className="text-right">
            <div className="text-[2rem] font-bold text-[#2d7871]">
              {formatCurrency(session?.bill?.subtotal ?? session?.orderResponse?.totalAmount ?? 0)}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
              Tổng hóa đơn
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {!hasSession ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#eef9f7] text-2xl text-[#2d7871]">
              +
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#16202a]">Chưa có order cho bàn này</h4>
              <p className="mt-2 text-sm leading-6 text-[#62707f]">
                Chọn khu vực đặt món để tạo order mới, thêm món và theo dõi hóa đơn ngay tại panel này.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-[20px] border border-[#e7edf2] bg-[#fbfcfd] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#62707f]">Mã hóa đơn</p>
                  <p className="mt-1 text-lg font-bold text-[#16202a]">
                    {session.bill?.billNumber ?? session.orderResponse?.orderNumber ?? 'Chưa tạo hóa đơn'}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#516072]">
                  {mapBillStatusLabel(session.bill?.status ?? 'PENDING')}
                </span>
              </div>
            </div>

            <div className="max-h-[calc(100vh-23rem)] space-y-6 overflow-y-auto pr-1">
              {session.batches.map((batch, index) => (
                <div
                  key={`${batch.batchNumber}-${batch.status}`}
                  className={index === 0 ? '' : 'border-t border-dashed border-[#d8e0e7] pt-6'}
                >
                  <OrderBatch batch={batch} onRemoveDraftItem={onRemoveDraftItem} />
                </div>
              ))}
            </div>

            {activeAction === 'ordering' && draftBatch ? (
              <DraftBatchNote batch={draftBatch} onChange={onDraftBatchNoteChange} />
            ) : null}
          </div>
        )}
      </div>

      {activeAction === 'ordering' && canOrder ? (
        <div className="border-t border-[#eef2f7] p-5">
          <button
            type="button"
            onClick={onSubmitOrder}
            disabled={!hasDraftItems || isBusy}
            className="w-full rounded-2xl bg-[#2d7871] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? 'Đang gửi...' : 'Đặt món'}
          </button>
        </div>
      ) : null}
    </aside>
  )
}

export default ActiveOrderPanel
