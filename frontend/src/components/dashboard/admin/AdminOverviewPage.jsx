import { formatDateTime, getStatusBadgeClass } from './utils'

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
            <p className="text-sm font-semibold text-[#0d9488]">Tổng quan điều hành</p>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight text-[#16202a]">
              Theo dõi vận hành và cấu hình toàn hệ thống
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#62707f]">
              Dữ liệu đang được dựng từ các khối backend mock hiện tại để mô phỏng bức tranh quản trị tập trung.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview.summaryMetrics.map((item) => (
            <SummaryCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {overview.alerts.map((item) => (
              <AlertCard key={item.id} item={item} />
            ))}
          </section>

          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#16202a]">Nhật ký gần đây</h2>
            <div className="mt-4 space-y-4">
              {overview.auditPreview.map((log) => (
                <article key={log.id} className="rounded-2xl bg-[#f8fafc] p-4">
                  <div className="text-sm font-medium text-[#16202a]">{log.action}</div>
                  <div className="mt-1 text-sm text-[#62707f]">
                    {log.actor} • {log.module}
                  </div>
                  <div className="mt-2 text-xs text-[#94a3b8]">{formatDateTime(log.occurredAt)}</div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

export default AdminOverviewPage
