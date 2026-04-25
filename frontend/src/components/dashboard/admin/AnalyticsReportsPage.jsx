import { formatCurrency } from './utils'

function MetricCard({ item }) {
  const isNegative = item.change?.startsWith('-')

  return (
    <article className="rounded-3xl border border-[#e7edf2] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-[#62707f]">{item.label}</div>
          <div className="mt-3 text-[1.8rem] font-bold leading-none text-[#16202a]">{item.value}</div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isNegative ? 'bg-[#fff1f1] text-[#c25858]' : 'bg-[#eef9f2] text-[#2f7a52]'
          }`}
        >
          {item.change}
        </span>
      </div>
    </article>
  )
}

function RevenueBars({ data }) {
  const maxValue = Math.max(...data.map((item) => Math.max(item.current, item.previous)), 1)

  return (
    <div className="mt-6 grid grid-cols-7 gap-3">
      {data.map((item) => (
        <div key={item.day} className="flex min-w-0 flex-col items-center gap-3">
          <div className="flex h-56 w-full items-end justify-center gap-2 rounded-3xl bg-[#f8fafc] px-2 py-4">
            <div
              className="w-3 rounded-full bg-[#cfe9e4]"
              style={{ height: `${Math.max((item.previous / maxValue) * 100, 10)}%` }}
            />
            <div
              className="w-3 rounded-full bg-[#2d7871]"
              style={{ height: `${Math.max((item.current / maxValue) * 100, 10)}%` }}
            />
          </div>
          <div className="text-xs font-medium text-[#62707f]">{item.day}</div>
        </div>
      ))}
    </div>
  )
}

function AnalyticsReportsPage({ analyticsReports }) {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0d9488]">6. Analytics & Reports</p>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight text-[#16202a]">
              Báo cáo doanh thu và vận hành
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#62707f]">
              Tập trung vào peak hours, món bán chạy, hiệu suất doanh thu, độ trễ phục vụ, điểm nghẽn bếp và hiệu suất nhân sự.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {analyticsReports.rangeOptions.map((option, index) => (
              <button
                key={option}
                type="button"
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                  index === 1
                    ? 'border-[#0d9488] bg-[#eef9f7] text-[#2d7871]'
                    : 'border-[#d8e0e7] bg-white text-[#516072]'
                }`}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              className="rounded-2xl border border-[#d8e0e7] bg-white px-4 py-2 text-sm font-semibold text-[#16202a]"
            >
              Xuất báo cáo
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {analyticsReports.salesMetrics.map((item) => (
            <MetricCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#16202a]">Xu hướng doanh thu</h2>
              <p className="mt-1 text-sm text-[#62707f]">So sánh tuần hiện tại và tuần trước</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-[#62707f]">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2d7871]" />
                Tuần này
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#cfe9e4]" />
                Tuần trước
              </span>
            </div>
          </div>

          <RevenueBars data={analyticsReports.revenueTrend} />
        </div>

        <div className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#16202a]">Món bán chạy</h2>
          <div className="mt-5 space-y-4">
            {analyticsReports.bestSellingItems.map((item) => (
              <article key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] p-4">
                <div className="min-w-0">
                  <div className="truncate font-medium text-[#16202a]">{item.name}</div>
                  <div className="mt-1 text-sm text-[#62707f]">{item.orders} lượt gọi món</div>
                </div>
                <div className="text-sm font-semibold text-[#2d7871]">{formatCurrency(item.revenue)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#16202a]">Khung giờ cao điểm</h2>
          <div className="mt-5 space-y-4">
            {analyticsReports.peakHours.map((item) => (
              <article key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-[#16202a]">{item.label}</span>
                  <span className="text-[#62707f]">
                    {item.orders} đơn • {formatCurrency(item.revenue)}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#eef2f7]">
                  <div
                    className="h-2 rounded-full bg-[#2d7871]"
                    style={{ width: `${Math.min((item.orders / 24) * 100, 100)}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#16202a]">Operational analytics</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {analyticsReports.operationalMetrics.map((item) => (
              <article key={item.id} className="rounded-2xl bg-[#f8fafc] p-4">
                <div className="text-sm text-[#62707f]">{item.label}</div>
                <div className="mt-3 text-2xl font-bold text-[#16202a]">{item.value}</div>
                <div className="mt-2 text-sm leading-6 text-[#62707f]">{item.note}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AnalyticsReportsPage
