function ChefSidebar({ items, activeSection, onChangeSection, onSignOut }) {
  return (
    <aside className="flex h-full flex-col border-b border-[#e7edf2] bg-white md:border-b-0 md:border-r">
      <nav className="flex flex-1 flex-col gap-3 px-4 py-5">
        {items.map((item) => {
          const isActive = item.id === activeSection

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeSection(item.id)}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                isActive ? 'bg-[#eef9f7] text-[#2d7871]' : 'text-[#516072] hover:bg-[#f8fafc]'
              }`}
            >
              <span>{item.label}</span>
              {isActive ? <span className="h-6 w-1 rounded-full bg-[#0d9488]" /> : null}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-[#eef2f7] px-4 py-5">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-2xl border border-[#d8e0e7] px-4 py-3 text-left text-sm font-semibold text-[#62707f] transition hover:border-[#0d9488]/40"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}

export default ChefSidebar
