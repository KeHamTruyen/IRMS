function ActivityPanel({ items, loading }) {
  return (
    <section className="rounded-[18px] border border-[#d8e0e7] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 text-[1.06rem] font-semibold text-[#16202a]">Hoạt động gần đây</h3>
      </div>

      {loading ? (
        <p className="m-0 text-sm text-[#62707f]">Đang tải dữ liệu dashboard...</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 border-t border-[#e7edf2] py-3.5 first:border-t-0 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <strong className="block text-sm text-[#16202a]">{item.title}</strong>
                <p className="mt-1.5 text-sm text-[#62707f]">{item.description}</p>
              </div>
              <span className="text-sm text-[#62707f]">{item.time}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ActivityPanel
