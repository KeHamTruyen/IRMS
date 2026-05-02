import AppFooter from '../../layout/AppFooter'
import AnalyticsReportsPage from '../admin/AnalyticsReportsPage'
import { formatCurrency } from '../admin/utils'

function MetricCard({ item }) {
  const negative = String(item.change ?? '').startsWith('-')

  return (
    <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-[#62707f]">{item.label}</div>
          <div className="mt-3 text-2xl font-bold text-[#16202a]">{item.value}</div>
          <div className="mt-2 text-sm text-[#62707f]">{item.note}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${negative ? 'bg-[#fff1f1] text-[#c25858]' : 'bg-[#eef9f2] text-[#2f7a52]'}`}>
          {item.change}
        </span>
      </div>
    </article>
  )
}

function ManagerDashboard({ session, dashboard, onSignOut }) {
  const analyticsReports = {
    salesMetrics: dashboard.metrics.slice(0, 3),
    revenueTrend: dashboard.weeklyTrend.map((item) => ({
      day: item.label.slice(5),
      current: item.current,
      previous: item.previous,
    })),
    monthlyRevenueTrend: dashboard.weeklyTrend.map((item) => ({
      day: item.label.slice(5),
      current: item.current,
      previous: item.previous,
    })),
    revenueComparisons: dashboard.comparisons ?? [],
    bestSellingItems: dashboard.bestSellingItems.map((item) => ({
      id: item.id,
      name: item.name,
      orders: item.quantity,
      revenue: item.revenue,
    })),
    operationalMetrics: [
      { id: 'tables', label: 'Bàn đang trống', value: `${dashboard.stats.availableTables ?? 0}`, note: `${dashboard.stats.occupiedTables ?? 0} bàn đang phục vụ` },
      { id: 'kitchen', label: 'Món chờ bếp', value: `${dashboard.stats.pendingKitchenOrders ?? 0}`, note: `${dashboard.stats.readyToServeOrders ?? 0} món sẵn sàng phục vụ` },
      { id: 'stock', label: 'Tồn kho thấp', value: `${dashboard.lowStockItems.length}`, note: 'Cần kiểm tra nguyên liệu' },
    ],
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6">
        <header className="flex flex-col gap-4 rounded-[24px] border border-[#d8e0e7] bg-white p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0d9488]">Dashboard quản lý</p>
            <h1 className="mt-2 text-3xl font-bold text-[#16202a]">Điều phối doanh thu và vận hành</h1>
            <p className="mt-2 text-sm text-[#62707f]">{dashboard.snapshotTime}</p>
          </div>
          <button className="rounded-[14px] border border-[#d8e0e7] bg-white px-4 py-3 font-semibold text-[#16202a]" onClick={onSignOut}>
            Đăng xuất
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((item) => <MetricCard key={item.id} item={item} />)}
        </section>

        <AnalyticsReportsPage analyticsReports={analyticsReports} />

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#d8e0e7] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#16202a]">Nguyên liệu cần chú ý</h2>
            <div className="mt-4 space-y-3">
              {dashboard.lowStockItems.length ? dashboard.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[#fff7ed] p-4">
                  <div>
                    <div className="font-semibold text-[#16202a]">{item.name}</div>
                    <div className="text-sm text-[#62707f]">{item.category}</div>
                  </div>
                  <div className="text-right text-sm font-semibold text-[#c25858]">
                    {item.quantity} / {item.threshold} {item.unit}
                  </div>
                </div>
              )) : <p className="text-sm text-[#62707f]">Không có nguyên liệu dưới ngưỡng.</p>}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d8e0e7] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#16202a]">Đơn hoàn tất gần đây</h2>
            <div className="mt-4 space-y-3">
              {dashboard.orders.filter((order) => order.status === 'COMPLETED').slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl bg-[#f8fafc] p-4">
                  <div>
                    <div className="font-semibold text-[#16202a]">{order.orderNumber}</div>
                    <div className="text-sm text-[#62707f]">{order.orderType}</div>
                  </div>
                  <div className="font-semibold text-[#2d7871]">{formatCurrency(order.totalAmount)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AppFooter session={session} dashboard={dashboard} />
      </section>
    </main>
  )
}

export default ManagerDashboard
