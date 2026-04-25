function AdminSidebar({ items, activeSection, onChangeSection, onSignOut }) {
  return (
    <aside className="flex flex-col border-b border-[#e7edf2] bg-white md:border-b-0 md:border-r">
      <div className="border-b border-[#eef2f7] px-5 py-6 lg:px-6 lg:py-7">
        <h2 className="text-[1.75rem] font-bold text-[#16202a]">Admin Dashboard</h2>
        <p className="mt-2 text-sm text-[#62707f]">Điều hành, báo cáo và cấu hình tập trung</p>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-4 py-5">
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

export default AdminSidebar
