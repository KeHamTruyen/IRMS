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

function RevenueBars({ data, currentLabel, previousLabel }) {
  const maxValue = Math.max(...data.map((item) => Math.max(item.current, item.previous)), 1)

  return (
    <div>
      <div className="flex items-center gap-4 text-xs font-medium text-[#62707f]">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2d7871]" />
          {currentLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#cfe9e4]" />
          {previousLabel}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-3 overflow-x-auto">
        {data.map((item) => (
          <div key={item.day} className="flex min-w-[54px] flex-col items-center gap-3">
            <div className="flex h-56 w-full items-end justify-center gap-2 rounded-3xl bg-[#f8fafc] px-2 py-4">
              <div
                className="w-3 rounded-full bg-[#cfe9e4]"
                style={{ height: `${Math.max((item.previous / maxValue) * 100, 8)}%` }}
              />
              <div
                className="w-3 rounded-full bg-[#2d7871]"
                style={{ height: `${Math.max((item.current / maxValue) * 100, 8)}%` }}
              />
            </div>
            <div className="text-xs font-medium text-[#62707f]">{item.day}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonTable({ items }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#e7edf2]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#fbfcfd] text-xs font-semibold uppercase text-[#94a3b8]">
          <tr>
            <th className="px-4 py-4">So sánh</th>
            <th className="px-4 py-4">Hiện tại</th>
            <th className="px-4 py-4">Kỳ trước</th>
            <th className="px-4 py-4">Chênh lệch</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eef2f7] bg-white">
          {items.map((item) => {
            const isNegative = Number(item.difference || 0) < 0

            return (
              <tr key={item.id}>
                <td className="px-4 py-4 font-semibold text-[#16202a]">{item.label}</td>
                <td className="px-4 py-4 text-[#516072]">{formatCurrency(item.current)}</td>
                <td className="px-4 py-4 text-[#516072]">{formatCurrency(item.previous)}</td>
                <td className={`px-4 py-4 font-semibold ${isNegative ? 'text-[#c25858]' : 'text-[#2f7a52]'}`}>
                  {formatCurrency(item.difference)} ({Number(item.percentChange || 0).toFixed(1)}%)
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AnalyticsReportsPage({ analyticsReports }) {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0d9488]">Phân tích doanh thu</p>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight text-[#16202a]">
              Báo cáo doanh thu và vận hành
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#62707f]">
              Theo dõi doanh thu theo tuần, theo tháng và so sánh hôm nay với hôm qua,
              tuần này với tuần trước, tháng này với tháng trước.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {analyticsReports.salesMetrics.map((item) => (
            <MetricCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#16202a]">Bảng so sánh doanh thu</h2>
        <div className="mt-5">
          <ComparisonTable items={analyticsReports.revenueComparisons ?? []} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#16202a]">Doanh thu theo tuần</h2>
          <p className="mt-1 text-sm text-[#62707f]">So sánh từng ngày của tuần này với tuần trước</p>
          <RevenueBars
            data={analyticsReports.revenueTrend ?? []}
            currentLabel="Tuần này"
            previousLabel="Tuần trước"
          />
        </div>

        <div className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#16202a]">Doanh thu theo tháng</h2>
          <p className="mt-1 text-sm text-[#62707f]">So sánh từng ngày của tháng này với tháng trước</p>
          <RevenueBars
            data={(analyticsReports.monthlyRevenueTrend ?? []).slice(0, 31)}
            currentLabel="Tháng này"
            previousLabel="Tháng trước"
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#16202a]">Món bán chạy</h2>
          <div className="mt-5 space-y-4">
            {(analyticsReports.bestSellingItems ?? []).map((item) => (
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

        <div className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#16202a]">Chỉ số vận hành</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {(analyticsReports.operationalMetrics ?? []).map((item) => (
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
