import { IoRestaurant } from 'react-icons/io5'

function ChefHeader() {
  return (
    <header className="border-b border-[#e7edf2] bg-white px-5 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#2d7871] text-2xl font-bold text-white">
          <IoRestaurant />
        </div>
        <div>
          <div className="items-start text-2xl font-bold text-[#2d7871]">IRMS</div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
            Quản lý bếp
          </p>
        </div>
      </div>
    </header>
  )
}

export default ChefHeader
