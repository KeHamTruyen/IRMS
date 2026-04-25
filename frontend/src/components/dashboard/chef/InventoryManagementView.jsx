import { useEffect, useMemo, useState } from 'react'
import { formatQuantity, mapInventoryStatusLabel } from './utils'

const inventoryTone = {
  IN_STOCK: 'bg-[#eef9f7] text-[#2d7871]',
  RESTOCKING: 'bg-[#fff8ef] text-[#b17a19]',
  OUT_OF_STOCK: 'bg-[#fff4f1] text-[#c36d4b]',
}

function SummaryCard({ label, value, note, tone = 'default' }) {
  const toneClass =
    tone === 'alert'
      ? 'border-[#f0d2cb] bg-[#fff6f4]'
      : 'border-[#e7edf2] bg-white'

  return (
    <article className={`rounded-[24px] border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">{label}</p>
      <div className="mt-3 text-[2rem] font-bold text-[#16202a]">{value}</div>
      <p className="mt-2 text-sm text-[#62707f]">{note}</p>
    </article>
  )
}

function StockBar({ item }) {
  const ratio = item.threshold > 0 ? Math.min((item.quantity / item.threshold) * 100, 100) : 100
  const barTone =
    item.status === 'OUT_OF_STOCK'
      ? 'bg-[#c36d4b]'
      : item.status === 'RESTOCKING'
        ? 'bg-[#b17a19]'
        : 'bg-[#2d7871]'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-[#62707f]">
        <span>
          {formatQuantity(item.quantity)} / {formatQuantity(item.threshold)} {item.unit}
        </span>
        <span>{Math.round(ratio)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#eef2f7]">
        <div className={`h-full rounded-full ${barTone}`} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  )
}

function InventoryTable({ items, selectedItemId, onSelectItem }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#e7edf2] bg-white">
      <div className="grid grid-cols-[2.4fr_1.3fr_0.9fr_1fr] gap-3 border-b border-[#eef2f7] bg-[#fbfcfd] px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
        <span>Nguyên liệu</span>
        <span>Tồn hiện tại</span>
        <span>Đơn vị</span>
        <span>Trạng thái</span>
      </div>

      <div className="divide-y divide-[#eef2f7]">
        {items.map((item) => {
          const isSelected = item.id === selectedItemId

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item.id)}
              className={`grid w-full grid-cols-[2.4fr_1.3fr_0.9fr_1fr] gap-3 px-5 py-5 text-left transition ${
                isSelected ? 'bg-[#f8fcfb]' : 'bg-white hover:bg-[#fbfcfd]'
              }`}
            >
              <div>
                <div className="font-semibold text-[#16202a]">{item.name}</div>
                <p className="mt-1 text-sm text-[#62707f]">
                  {item.category} • Tồn tối thiểu {formatQuantity(item.threshold)} {item.unit}
                </p>
              </div>

              <div className="pr-3">
                <StockBar item={item} />
              </div>

              <div className="self-center text-sm font-semibold text-[#516072]">{item.unit}</div>

              <div className="self-center">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${inventoryTone[item.status]}`}>
                  {mapInventoryStatusLabel(item.status)}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AdjustmentPanel({ item, onChangeQuantity, onChangeStatus }) {
  const isOutOfStock = item.quantity <= 0

  return (
    <aside className="rounded-[24px] border border-[#e7edf2] bg-white p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
          Điều chỉnh nhanh
        </p>
        <h3 className="mt-2 text-xl font-bold text-[#16202a]">{item.name}</h3>
        <p className="mt-1 text-sm text-[#62707f]">
          {item.category} • Tồn tối thiểu {formatQuantity(item.threshold)} {item.unit}
        </p>
      </div>

      <div className="mt-5">
        <StockBar item={item} />
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#16202a]">Số lượng hiện tại</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeQuantity(item.id, Math.max(0, item.quantity - 1))}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#d8e0e7] bg-white text-sm"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              value={item.quantity}
              onChange={(event) => onChangeQuantity(item.id, Math.max(0, Number(event.target.value || 0)))}
              className="h-11 flex-1 rounded-2xl border border-[#d8e0e7] px-4 text-sm font-semibold text-[#16202a] outline-none"
            />
            <button
              type="button"
              onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#d8e0e7] bg-white text-sm"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#16202a]">Trạng thái</label>
          <select
            value={isOutOfStock ? 'OUT_OF_STOCK' : item.status}
            onChange={(event) => onChangeStatus(item.id, event.target.value)}
            disabled={isOutOfStock}
            className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-white px-3 text-sm text-[#16202a] outline-none disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
          >
            <option value="IN_STOCK">Đang dùng</option>
            <option value="RESTOCKING">Cần nhập</option>
            <option value="OUT_OF_STOCK">Đã hết</option>
          </select>
        </div>

        <div className="rounded-[20px] bg-[#fbfcfd] px-4 py-3 text-sm text-[#62707f]">
          Nếu số lượng bằng 0, trạng thái sẽ tự chuyển sang <span className="font-semibold text-[#c36d4b]">Đã hết</span>.
        </div>
      </div>
    </aside>
  )
}

function InventoryManagementView({ inventoryManagement, onChangeQuantity, onChangeStatus }) {
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const [selectedItemId, setSelectedItemId] = useState(inventoryManagement.items[0]?.id ?? null)

  const items = useMemo(() => {
    if (activeCategory === 'Tất cả') return inventoryManagement.items
    return inventoryManagement.items.filter((item) => item.category === activeCategory)
  }, [activeCategory, inventoryManagement.items])

  useEffect(() => {
    if (!items.length) {
      setSelectedItemId(null)
      return
    }

    if (!items.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(items[0].id)
    }
  }, [items, selectedItemId])

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? items[0] ?? null
  const outOfStockCount = inventoryManagement.items.filter((item) => item.quantity <= 0).length
  const restockingCount = inventoryManagement.items.filter((item) => item.status === 'RESTOCKING').length

  return (
    <section className="space-y-5 self-start">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0d9488]">
              Quản lý kho
            </p>
            <h2 className="mt-2 text-[2rem] font-bold text-[#16202a]">Danh sách nguyên liệu</h2>
            <p className="mt-2 text-sm text-[#62707f]">
              Theo dõi tồn kho theo dạng bảng, chọn từng nguyên liệu để điều chỉnh nhanh số lượng và trạng thái.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {inventoryManagement.categories.map((category) => (
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
      </section>

      <section className="grid content-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_320px] xl:grid-cols-[minmax(0,1.9fr)_340px]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Tổng nguyên liệu"
              value={inventoryManagement.items.length}
              note="Đang theo dõi trong ca"
            />
            <SummaryCard
              label="Cần nhập"
              value={restockingCount}
              note="Nguyên liệu dưới mức an toàn"
              tone="alert"
            />
            <SummaryCard
              label="Đã hết"
              value={outOfStockCount}
              note="Cần xử lý ngay"
              tone="alert"
            />
          </div>

          <InventoryTable items={items} selectedItemId={selectedItemId} onSelectItem={setSelectedItemId} />
        </div>

        {selectedItem ? (
          <AdjustmentPanel
            item={selectedItem}
            onChangeQuantity={onChangeQuantity}
            onChangeStatus={onChangeStatus}
          />
        ) : null}
      </section>
    </section>
  )
}

export default InventoryManagementView
