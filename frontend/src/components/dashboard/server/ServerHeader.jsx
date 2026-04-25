function ServerHeader({ placeholder }) {
  return (
    <header className="grid grid-cols-1 items-center gap-4 border-b border-[#e7edf2] bg-white px-6 py-5 md:grid-cols-[100px_minmax(0,1fr)_124px] lg:grid-cols-[140px_minmax(0,1fr)_140px]">
      <div className="text-2xl font-bold text-[#2d7871]">IRMS</div>

      <div className="flex justify-center">
        <input
          type="search"
          className="min-h-11 w-full max-w-[420px] rounded-full border border-[#d8e0e7] bg-[#f8fafc] px-5 text-sm text-[#16202a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/10"
          placeholder={placeholder}
          aria-label="Tìm kiếm"
        />
      </div>

      <div className="flex items-center justify-end gap-3 text-[#62707f]">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#e7edf2] bg-white text-sm"
        >
          !
        </button>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#e7edf2] bg-white text-sm"
        >
          ⚙
        </button>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1e293b] text-sm font-bold text-white">
          NV
        </div>
      </div>
    </header>
  )
}

export default ServerHeader
