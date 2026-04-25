function DashboardSidebar({ session, navItems, roleMeta, onSignOut }) {
  return (
    <aside className="flex flex-col gap-6 border-b border-[#d8e0e7] bg-[#fbfcfd] px-[22px] py-7 md:border-b-0 md:border-r">
      <div className="rounded-[18px] border border-[#d8e0e7] bg-white p-[18px]">
        <span className="inline-block text-xs font-bold uppercase tracking-normal text-[#0d9488]">
          IRMS
        </span>
        <strong className="mt-2 block text-[1.1rem] text-[#16202a]">{roleMeta.dashboardTitle}</strong>
        <p className="mt-2 text-sm text-[#62707f]">{session.fullName}</p>
      </div>

      <nav className="flex flex-col gap-2.5" aria-label="Điều hướng chính">
        {navItems.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`min-h-[46px] rounded-xl border px-3.5 text-left font-semibold transition ${
              index === 0
                ? 'border-[#0d9488] bg-[#0d9488] text-white'
                : 'border-[#d8e0e7] bg-white text-[#16202a]'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="rounded-[14px] border border-[#d8e0e7] bg-white px-[18px] py-3 font-bold text-[#16202a] transition hover:border-[#0d9488]/40 md:mt-auto"
        onClick={onSignOut}
      >
        Đăng xuất
      </button>
    </aside>
  )
}

export default DashboardSidebar
