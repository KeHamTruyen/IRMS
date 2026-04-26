import { getStatusBadgeClass } from './utils'

function SummaryCard({ item }) {
  return (
    <article className="rounded-3xl border border-[#e7edf2] bg-white p-5">
      <div className="text-sm text-[#62707f]">{item.label}</div>
      <div className="mt-3 text-[1.9rem] font-bold leading-none text-[#16202a]">{item.value}</div>
      <div className="mt-3 text-sm leading-6 text-[#62707f]">{item.note}</div>
    </article>
  )
}

function AlertCard({ item }) {
  return (
    <article className="rounded-3xl border border-[#e7edf2] bg-white p-5">
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(item.tone)}`}>
        {item.tone === 'warning' ? 'Cần chú ý' : 'Đang theo dõi'}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-[#16202a]">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#62707f]">{item.description}</p>
    </article>
  )
}

function AdminOverviewPage({ overview }) {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0d9488]">Tổng quan</p>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight text-[#16202a]">
              Theo dõi tổng quan
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#62707f]">
              Trang tổng quan các thống kê cốt lõi.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview.summaryMetrics.map((item) => (
            <SummaryCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {overview.alerts.map((item) => (
          <AlertCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export default AdminOverviewPage
