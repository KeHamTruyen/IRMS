import ActivityPanel from './ActivityPanel'
import InsightsPanel from './InsightsPanel'
import QuickActions from './QuickActions'
import DashboardHeader from '../layout/DashboardHeader'
import DashboardSidebar from '../layout/DashboardSidebar'
import AppFooter from '../layout/AppFooter'

function MetricCard({ item }) {
  return (
    <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-[18px]">
      <span className="block text-[0.82rem] text-[#62707f]">{item.label}</span>
      <strong className="my-2.5 block text-[2rem] leading-none text-[#16202a]">{item.value}</strong>
      <small className="text-sm text-[#62707f]">{item.note}</small>
    </article>
  )
}

function GenericDashboard({ session, dashboard, dashboardConfig, roleMeta, loadingDashboard, onSignOut }) {
  const welcomeName = session.fullName?.split(' ')[0] ?? session.username

  return (
    <main className="grid min-h-screen content-start grid-cols-1 bg-[#f8fafc] md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[270px_minmax(0,1fr)]">
      <DashboardSidebar
        session={session}
        navItems={dashboardConfig.nav}
        roleMeta={roleMeta}
        onSignOut={onSignOut}
      />

      <section className="flex min-w-0 flex-col gap-[18px] p-6 lg:p-7">
        <DashboardHeader session={session} roleMeta={roleMeta} />

        <section className="flex flex-col gap-4 rounded-[22px] border border-[#d8e0e7] bg-white p-6 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-normal text-[#0d9488]">
              {roleMeta.title}
            </span>
            <h1 className="my-2 text-[clamp(2rem,2.4vw,2.75rem)] leading-[1.05] tracking-normal text-[#16202a]">
              Xin chào, {welcomeName}
            </h1>
            <p className="m-0 max-w-[44rem] text-base leading-7 text-[#62707f]">
              {roleMeta.dashboardSubtitle}
            </p>
          </div>
          <div className="min-w-[220px] rounded-[18px] border border-[#d8e0e7] bg-white p-4">
            <strong className="block text-sm text-[#16202a]">
              {dashboard?.sourceLabel ?? 'Dữ liệu dự phòng từ mock API'}
            </strong>
            <span className="mt-1 block text-sm text-[#62707f]">
              {dashboard?.snapshotTime ?? 'Chưa có ảnh chụp dữ liệu thời gian thực'}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
          {(dashboard?.summaryMetrics ?? []).map((item) => (
            <MetricCard key={item.label} item={item} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.4fr_1fr]">
          <ActivityPanel items={dashboard?.activity ?? []} loading={loadingDashboard} />
          <InsightsPanel highlights={dashboard?.highlights ?? []} />
        </section>

        <QuickActions actions={dashboard?.quickActions ?? []} />
        <AppFooter session={session} dashboard={dashboard} />
      </section>
    </main>
  )
}

export default GenericDashboard
