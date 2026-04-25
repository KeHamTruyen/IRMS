import { getInitials } from './utils'

function AdminHeader({ session, placeholder }) {
  return (
    <header className="grid grid-cols-1 gap-4 border-b border-[#e7edf2] bg-white px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:px-6 lg:px-7">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-lg font-semibold text-[#16202a]">IRMS Pro</div>
          <p className="mt-1 text-sm text-[#62707f]">Bảng quản trị vận hành nhà hàng</p>
        </div>

        <input
          type="search"
          className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-[#f8fafc] px-4 text-sm text-[#16202a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/10 lg:max-w-[360px]"
          placeholder={placeholder}
          aria-label="Tìm kiếm trong trang quản trị"
        />
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <button
          type="button"
          className="rounded-2xl border border-[#d8e0e7] bg-white px-3 py-2 text-sm font-medium text-[#516072]"
        >
          30 ngày gần đây
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-[#e7edf2] bg-[#fbfcfd] px-3 py-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1f2937] text-sm font-semibold text-white">
            {getInitials(session.fullName || session.username)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#16202a]">{session.fullName}</div>
            <div className="text-xs text-[#62707f]">Tài khoản quản trị</div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
