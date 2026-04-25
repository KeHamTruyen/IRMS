function ChefHeader() {
  return (
    <header className="border-b border-[#e7edf2] bg-white px-5 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#2d7871] text-sm font-bold text-white">
          BP
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#16202a]">IRMS Pro</h1>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
            Điều phối bếp
          </p>
        </div>
      </div>
    </header>
  )
}

export default ChefHeader
