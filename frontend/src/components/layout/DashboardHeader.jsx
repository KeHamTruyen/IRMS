function DashboardHeader({ session, roleMeta }) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <label className="flex-1">
        <input
          type="search"
          className="min-h-12 w-full rounded-[14px] border border-[#d8e0e7] bg-white px-4 text-[#16202a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/10"
          placeholder="Tìm đơn hàng, bàn, người dùng..."
          aria-label="Tìm kiếm"
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-[128px] rounded-[18px] border border-[#d8e0e7] bg-white px-3.5 py-2.5">
          <strong>{roleMeta.title}</strong>
          <span className="block text-sm text-[#62707f]">{session.username}</span>
        </div>
        <div className="min-w-[128px] rounded-[18px] border border-[#d8e0e7] bg-white px-3.5 py-2.5">
          <strong>Nguồn dữ liệu</strong>
          <span className="block text-sm text-[#62707f]">{session.source}</span>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
