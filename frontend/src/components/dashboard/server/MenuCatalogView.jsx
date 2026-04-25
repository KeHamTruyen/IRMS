import { useMemo, useState } from 'react'
import { formatCurrency } from './utils'

function MenuCard({ item }) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-[#e7edf2] bg-white">
      <img src={item.imageUrl} alt={item.name} className="h-48 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[#16202a]">{item.name}</h3>
            <p className="mt-1 text-sm leading-6 text-[#62707f]">{item.description}</p>
          </div>
          <span className="text-sm font-bold text-[#2d7871]">{formatCurrency(item.price)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#62707f]">
            {item.category}
          </span>
          <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#62707f]">
            {item.preparationTime} phút
          </span>
          {item.isAvailable ? (
            <span className="rounded-full bg-[#eef9f7] px-3 py-1 text-xs font-medium text-[#0d9488]">
              Đang bán
            </span>
          ) : (
            <span className="rounded-full bg-[#fff4f1] px-3 py-1 text-xs font-medium text-[#c36d4b]">
              Tạm hết
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function MenuCatalogView({ menuCatalog }) {
  const [activeCategory, setActiveCategory] = useState(menuCatalog.categories[0] ?? 'Tất cả')

  const items = useMemo(() => {
    if (activeCategory === 'Tất cả') return menuCatalog.items
    return menuCatalog.items.filter((item) => item.category === activeCategory)
  }, [activeCategory, menuCatalog.items])

  return (
    <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-[2rem] font-bold text-[#16202a]">Thực đơn chung</h2>
          <p className="mt-2 text-sm text-[#62707f]">
            Chế độ xem nhanh thực đơn để đối chiếu món, danh mục và tình trạng bán.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {menuCatalog.categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeCategory === category
                  ? 'border-[#0d9488] bg-[#eef9f7] text-[#0d9488]'
                  : 'border-[#d8e0e7] bg-white text-[#62707f]'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default MenuCatalogView
