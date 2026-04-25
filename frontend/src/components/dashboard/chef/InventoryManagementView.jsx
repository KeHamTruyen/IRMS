import { useMemo, useState } from 'react'
import { formatQuantity, mapInventoryStatusLabel } from './utils'

const inventoryTone = {
  IN_STOCK: 'bg-[#eef9f7] text-[#2d7871]',
  RESTOCKING: 'bg-[#fff8ef] text-[#b17a19]',
  OUT_OF_STOCK: 'bg-[#fff4f1] text-[#c36d4b]',
}

function InventoryCard({ item, onChangeQuantity, onChangeStatus }) {
  const isOutOfStock = item.quantity <= 0

  return (
    <article className="rounded-[24px] border border-[#e7edf2] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#16202a]">{item.name}</h3>
          <p className="mt-1 text-sm text-[#62707f]">
            {item.category} • Tồn tối thiểu {formatQuantity(item.threshold)} {item.unit}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${inventoryTone[item.status]}`}>
          {mapInventoryStatusLabel(item.status)}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">Số lượng</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeQuantity(item.id, Math.max(0, item.quantity - 1))}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#d8e0e7] bg-white text-sm"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              value={item.quantity}
              onChange={(event) => onChangeQuantity(item.id, Math.max(0, Number(event.target.value || 0)))}
              className="h-11 w-28 rounded-2xl border border-[#d8e0e7] px-3 text-sm font-semibold text-[#16202a] outline-none"
            />
            <button
              type="button"
              onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#d8e0e7] bg-white text-sm"
            >
              +
            </button>
            <span className="text-sm text-[#62707f]">{item.unit}</span>
          </div>
        </div>

        <label className="flex flex-col gap-2 text-sm text-[#62707f]">
          <span>Trạng thái</span>
          <select
            value={isOutOfStock ? 'OUT_OF_STOCK' : item.status}
            onChange={(event) => onChangeStatus(item.id, event.target.value)}
            disabled={isOutOfStock}
            className="min-h-11 rounded-2xl border border-[#d8e0e7] bg-white px-3 text-sm text-[#16202a] outline-none disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
          >
            <option value="IN_STOCK">Đang dùng</option>
            <option value="RESTOCKING">Cần nhập</option>
            <option value="OUT_OF_STOCK">Đã hết</option>
          </select>
        </label>
      </div>
    </article>
  )
}

function InventoryManagementView({ inventoryManagement, onChangeQuantity, onChangeStatus }) {
  const [activeCategory, setActiveCategory] = useState('Tất cả')

  const items = useMemo(() => {
    if (activeCategory === 'Tất cả') return inventoryManagement.items
    return inventoryManagement.items.filter((item) => item.category === activeCategory)
  }, [activeCategory, inventoryManagement.items])

  return (
    <section className="space-y-5 self-start">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0d9488]">
              Quản lý kho
            </p>
            <h2 className="mt-2 text-[2rem] font-bold text-[#16202a]">Theo dõi nguyên liệu theo đơn vị</h2>
            <p className="mt-2 text-sm text-[#62707f]">
              Cập nhật số lượng và trạng thái nguyên liệu. Khi số lượng bằng 0, hệ thống tự chuyển sang Đã hết.
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

      <section className="grid content-start gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <InventoryCard
            key={item.id}
            item={item}
            onChangeQuantity={onChangeQuantity}
            onChangeStatus={onChangeStatus}
          />
        ))}
      </section>
    </section>
  )
}

export default InventoryManagementView
