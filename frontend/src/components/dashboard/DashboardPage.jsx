import { DASHBOARD_VARIANT_TITLES } from '../../constants/dashboard'
import { getRoleMeta } from '../../constants/roles'
import DashboardHeader from '../layout/DashboardHeader'
import DashboardSidebar from '../layout/DashboardSidebar'
import AppFooter from '../layout/AppFooter'
import ActivityPanel from './ActivityPanel'
import InsightsPanel from './InsightsPanel'
import QuickActions from './QuickActions'

function MetricCard({ item }) {
  return (
    <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-[18px]">
      <span className="block text-[0.82rem] text-[#62707f]">{item.label}</span>
      <strong className="my-2.5 block text-[2rem] leading-none text-[#16202a]">{item.value}</strong>
      <small className="text-sm text-[#62707f]">{item.note}</small>
    </article>
  )
}

function CollectionTable({ title, columns, rows }) {
  return (
    <section className="rounded-[18px] border border-[#d8e0e7] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 text-[1.06rem] font-semibold text-[#16202a]">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border-t-0 px-0 pb-3 pt-0 text-left text-[0.82rem] font-bold uppercase text-[#62707f]"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id ?? `${title}-${rowIndex}`}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="border-t border-[#e7edf2] px-0 py-3 text-left text-[0.94rem] text-[#16202a]"
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function VariantCollections({ role, collections }) {
  if (!collections?.length) return null

  return (
    <section className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
      {collections.map((collection) => (
        <CollectionTable
          key={`${role}-${collection.type}`}
          title={DASHBOARD_VARIANT_TITLES[collection.type] ?? collection.title}
          columns={collection.columns}
          rows={collection.rows}
        />
      ))}
    </section>
  )
}

function DashboardPage({ session, dashboard, dashboardConfig, loadingDashboard, onSignOut }) {
  const roleMeta = getRoleMeta(session.role)
  const welcomeName = session.fullName?.split(' ')[0] ?? session.username

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[#f8fafc] lg:grid-cols-[270px_minmax(0,1fr)]">
      <DashboardSidebar
        session={session}
        navItems={dashboardConfig.nav}
        roleMeta={roleMeta}
        onSignOut={onSignOut}
      />

      <section className="flex flex-col gap-[18px] p-7 max-lg:p-6">
        <DashboardHeader session={session} roleMeta={roleMeta} />

        <section className="flex flex-col gap-4 rounded-[22px] border border-[#d8e0e7] bg-white p-6 xl:flex-row xl:items-start xl:justify-between">
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

        <section
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Chỉ số tổng quan"
        >
          {(dashboard?.summaryMetrics ?? []).map((item) => (
            <MetricCard key={item.label} item={item} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-3.5 xl:grid-cols-[1.4fr_1fr]">
          <ActivityPanel items={dashboard?.activity ?? []} loading={loadingDashboard} />
          <InsightsPanel highlights={dashboard?.highlights ?? []} />
        </section>

        <VariantCollections role={session.role} collections={dashboard?.collections ?? []} />

        <QuickActions actions={dashboard?.quickActions ?? []} />
        <AppFooter session={session} dashboard={dashboard} />
      </section>
    </main>
  )
}

export default DashboardPage
