import { useMemo, useState } from 'react'
import { mapMenuAvailabilityLabel } from './utils'

function MenuStatusCard({ item, onToggleAvailability }) {
  return (
    <article className="rounded-[24px] border border-[#e7edf2] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#16202a]">{item.name}</h3>
          <p className="mt-1 text-sm text-[#62707f]">
            {item.category} • {item.station} • {item.preparationTime} phút
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            item.isAvailable ? 'bg-[#eef9f7] text-[#2d7871]' : 'bg-[#fff4f1] text-[#c36d4b]'
          }`}
        >
          {mapMenuAvailabilityLabel(item.isAvailable)}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-[20px] bg-[#fbfcfd] px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-[#16202a]">Trạng thái phục vụ</div>
          <p className="mt-1 text-sm text-[#62707f]">
            Dùng để phản ánh món đang phục vụ hoặc tạm hết trên menu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleAvailability(item.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            item.isAvailable ? 'bg-[#fff4f1] text-[#c36d4b]' : 'bg-[#eef9f7] text-[#2d7871]'
          }`}
        >
          {item.isAvailable ? 'Chuyển tạm hết' : 'Mở lại phục vụ'}
        </button>
      </div>
    </article>
  )
}

function MenuStatusView({ menuManagement, onToggleAvailability }) {
  const [activeCategory, setActiveCategory] = useState('Tất cả')

  const items = useMemo(() => {
    if (activeCategory === 'Tất cả') return menuManagement.items
    return menuManagement.items.filter((item) => item.category === activeCategory)
  }, [activeCategory, menuManagement.items])

  return (
    <section className="space-y-5 self-start">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0d9488]">
              Quản lý món ăn
            </p>
            <h2 className="mt-2 text-[2rem] font-bold text-[#16202a]">Điều chỉnh trạng thái trên menu</h2>
            <p className="mt-2 text-sm text-[#62707f]">
              Cập nhật từng món giữa hai trạng thái Tạm hết và Đang phục vụ theo tình hình bếp.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {menuManagement.categories.map((category) => (
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
          <MenuStatusCard key={item.id} item={item} onToggleAvailability={onToggleAvailability} />
        ))}
      </section>
    </section>
  )
}

export default MenuStatusView
